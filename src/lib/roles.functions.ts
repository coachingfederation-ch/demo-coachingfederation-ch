/**
 * Role administration RPC surface (admin only).
 *
 * Only `editor` is grantable here, and only on a claimed member account.
 * `admin` remains a migration-only provisioning step: letting one admin session
 * mint further admins turns a single compromise into a permanent one.
 *
 * Writes go through `context.supabase` — the caller's own RLS-scoped client —
 * so the database policies ("admins grant editor" / "admins revoke editor")
 * are the real boundary and the audit trigger records the acting admin.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./authz";
import { MANAGED_ROLES } from "./role-model";

const memberIdSchema = z.object({ memberId: z.string().uuid() });
const grantSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(MANAGED_ROLES),
});
const qaAccountSchema = z.object({
  memberId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(10),
});

/**
 * Claimed members with their current CMS grant, the internal (non-member)
 * privileged accounts, and recent grant history.
 */
export const listRoleAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listClaimedMemberRoles, listInternalStaffAccounts, listRoleGrantAudit } =
      await import("./roles-admin.server");
    const [members, internal, audit] = await Promise.all([
      listClaimedMemberRoles(),
      listInternalStaffAccounts(),
      listRoleGrantAudit(),
    ]);
    return { members, internal, audit };
  });

/**
 * QA support path: the claimable-member list and whether the TEST-mode gate is
 * currently open. Separate from the main read model so the Roles screen only
 * pays for it when the panel is opened.
 */
export const listQaProvisioningOptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { loadIntegrationConfigAdmin } = await import("./integration-config.server");
    const config = await loadIntegrationConfigAdmin();
    if (config.mode !== "test") return { testMode: false as const, candidates: [] };
    const { listClaimableMembers } = await import("./qa-test-account.server");
    return { testMode: true as const, candidates: await listClaimableMembers() };
  });

/**
 * Creates a pure-member QA account and binds it to one unclaimed member.
 * The password is echoed back once by the caller's UI and never stored.
 */
export const provisionQaTestAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => qaAccountSchema.parse(input))
  .handler(async ({ context, data }) => {
    const actorUserId = await assertAdmin(context);
    const { provisionQaTestMember } = await import("./qa-test-account.server");
    return provisionQaTestMember(actorUserId, data.memberId, data.email, data.password);
  });

/** Adds a managed staff grant to a claimed member. Membership is untouched. */
export const grantMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => grantSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { authUserIdForMember } = await import("./roles-admin.server");
    const authUserId = await authUserIdForMember(data.memberId);

    // Plain insert, not upsert: the grant path holds INSERT and DELETE only,
    // so an already-granted row is a harmless unique-violation, not an update.
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: authUserId, role: data.role });
    if (error && error.code !== "23505") throw new Error("Could not grant access.");
    return { ok: true };
  });

/** Removes a managed staff grant. The member keeps their profile and portal. */
export const revokeMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => grantSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { authUserIdForMember } = await import("./roles-admin.server");
    const authUserId = await authUserIdForMember(data.memberId);

    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", authUserId)
      .eq("role", data.role);
    if (error) throw new Error("Could not revoke access.");
    return { ok: true };
  });
