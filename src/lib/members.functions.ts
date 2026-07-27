import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin-only guard: role is verified against the caller's own RLS-scoped client. */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
  return context.userId;
}

/** Manual sync run (admin). Uses whichever mode integration_config is in. */
export const runSyncNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await assertAdmin(context as never);
    const { runMemberSync } = await import("./member-sync.server");
    return await runMemberSync({ triggerSource: "manual", actorUserId: userId });
  });

/** Admin "Clean up": anonymise members past their scheduled deletion date. */
export const cleanupExpiredMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await assertAdmin(context as never);
    const { runLifecycleCleanup } = await import("./member-sync.server");
    return await runLifecycleCleanup(userId);
  });

/** One-time TEST -> LIVE cutover (admin only, irreversible). */
export const executeCutover = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ confirm: z.literal("CUTOVER") }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await assertAdmin(context as never);
    const { runCutover } = await import("./cutover.server");
    return await runCutover(userId);
  });

/**
 * Cutover readiness rehearsal (admin only, non-destructive). Runs pre-flight and
 * the archive snapshot, then reports exactly what a real cutover would delete,
 * unbind and switch — without freezing, purging, changing mode or importing.
 */
export const rehearseCutover = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await assertAdmin(context as never);
    const { runCutover } = await import("./cutover.server");
    return await runCutover(userId, { dryRun: true });
  });

/** Bulk PII export — admin only, never editors. */
export const exportMembersCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { buildMembersCsv } = await import("./members-export.server");
    return await buildMembersCsv();
  });

/** Admin member detail: imported ICF reference data + local directory fields. */
export const getMemberDetail = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ memberId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context as never);
    const { loadMemberDetail } = await import("./member-admin.server");
    return await loadMemberDetail(data.memberId);
  });

/**
 * Staff-owned directory fields. Service-area regions are declared, never
 * derived from the imported address, so they are only written from here or
 * (later) from the Member Area.
 */
export const updateMemberDirectory = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        memberId: z.string().uuid(),
        visibility: z
          .enum(["draft", "published", "hidden_no_credential", "hidden_inactive", "hidden_admin"])
          .optional(),
        mentor_accredited: z.boolean().optional(),
        supervision_accredited: z.boolean().optional(),
        region_ids: z.array(z.string().uuid()).max(40).optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const userId = await assertAdmin(context as never);
    const { updateMemberDirectoryAdmin } = await import("./member-admin.server");
    return await updateMemberDirectoryAdmin(userId, data);
  });

/**
 * Member account claim. Built now, inert until the chapter explicitly opens the
 * Member Area after the LIVE cutover — `account_claim_enabled` cannot be true
 * in TEST mode (database trigger).
 */
export const requestMemberClaim = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().email().max(320) }).parse(input))
  .handler(async ({ data }) => {
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const { attemptMemberClaim } = await import("./member-claim.server");
    return await attemptMemberClaim(data.email, new URL(getRequestUrl()).origin);
  });

/** Read-only token state for the /claim/$token screen. Never returns the raw email. */
export const getMemberClaimStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { loadIntegrationConfigAdmin } = await import("./member-email.server");
  const config = await loadIntegrationConfigAdmin();
  return {
    enabled:
      config.account_claim_enabled && config.mode === "live" && !config.cutover_in_progress,
  };
});

export const checkMemberClaimToken = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ token: z.string().min(20).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyClaimToken } = await import("./member-claim.server");
    return await verifyClaimToken(data.token);
  });

/**
 * Consumes a claim token: creates the account, binds the member record and
 * grants the `member` role in one guarded path.
 */
export const completeMemberClaim = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ token: z.string().min(20).max(200), password: z.string().min(10).max(200) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { completeClaim } = await import("./member-claim.server");
    return await completeClaim(data.token, data.password);
  });

/**
 * Admin support tooling: mint a claim link and show it once. Exists because the
 * member-facing email transport is still inert before the LIVE cutover.
 */
export const issueMemberClaimLink = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ memberId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const userId = await assertAdmin(context as never);
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const { issueClaimLinkForMember } = await import("./member-claim.server");
    return await issueClaimLinkForMember(userId, data.memberId, new URL(getRequestUrl()).origin);
  });
/**
 * Staff-support account binding (admin only). Separate from the future
 * member-initiated claim flow — this is testing/support tooling.
 */
export const getMemberClaimStatuses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { loadClaimStatuses } = await import("./member-admin.server");
    return await loadClaimStatuses();
  });

/**
 * Staff-support account binding (admin only). Separate from the future
 * member-initiated claim flow — this is testing/support tooling.
 */
export const bindMemberAccount = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ memberId: z.string().uuid(), email: z.string().email().max(320) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const userId = await assertAdmin(context as never);
    const { bindMemberToAuthUser } = await import("./member-admin.server");
    return await bindMemberToAuthUser(userId, data.memberId, data.email);
  });

export const unbindMemberAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ memberId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const userId = await assertAdmin(context as never);
    const { unbindMemberAuthUser } = await import("./member-admin.server");
    await unbindMemberAuthUser(userId, data.memberId);
    return { ok: true };
  });
