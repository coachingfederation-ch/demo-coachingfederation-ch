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

/** Bulk PII export — admin only, never editors. */
export const exportMembersCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { buildMembersCsv } = await import("./members-export.server");
    return await buildMembersCsv();
  });

/**
 * Member account claim. Built now, inert until the chapter explicitly opens the
 * Member Area after the LIVE cutover — `account_claim_enabled` cannot be true
 * in TEST mode (database trigger).
 */
export const requestMemberClaim = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().email().max(320) }).parse(input))
  .handler(async ({ data }) => {
    const { attemptMemberClaim } = await import("./member-claim.server");
    return await attemptMemberClaim(data.email);
  });