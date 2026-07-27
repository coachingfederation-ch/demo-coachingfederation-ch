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

const memberIdSchema = z.object({ memberId: z.string().uuid() });

/** Claimed members with their current CMS grant, plus recent grant history. */
export const listRoleAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listClaimedMemberRoles, listRoleGrantAudit } = await import("./roles-admin.server");
    const [members, audit] = await Promise.all([listClaimedMemberRoles(), listRoleGrantAudit()]);
    return { members, audit };
  });

/** Adds Insights CMS access to a claimed member. Membership is untouched. */
export const grantEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { authUserIdForMember } = await import("./roles-admin.server");
    const authUserId = await authUserIdForMember(data.memberId);

    // Plain insert, not upsert: the grant path holds INSERT and DELETE only,
    // so an already-granted row is a harmless unique-violation, not an update.
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: authUserId, role: "editor" });
    if (error && error.code !== "23505") throw new Error("Could not grant editor access.");
    return { ok: true };
  });

/** Removes Insights CMS access. The member keeps their profile and portal. */
export const revokeEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { authUserIdForMember } = await import("./roles-admin.server");
    const authUserId = await authUserIdForMember(data.memberId);

    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", authUserId)
      .eq("role", "editor");
    if (error) throw new Error("Could not revoke editor access.");
    return { ok: true };
  });
