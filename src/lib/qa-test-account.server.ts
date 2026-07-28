/**
 * QA test-member provisioning (TEST mode only).
 *
 * The self-service claim flow mints the auth identity from the *imported*
 * member email, which in TEST mode is a scrambled `zz…zz` address — unusable
 * as a login for manual QA. This helper establishes the exact same binding
 * contract (`members.auth_user_id` + a `member` role grant) through the
 * supported auth admin path, with an operator-chosen address.
 *
 * Deliberate limits, so this can never become a back door:
 * - refuses unless the integration is in TEST mode;
 * - refuses a test-shaped login address;
 * - only ever binds an active member whose `auth_user_id` is still NULL, so an
 *   already-claimed account (including a hybrid admin) is out of reach;
 * - grants `member` and nothing else.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadIntegrationConfigAdmin } from "./integration-config.server";
import { isTestShapedEmail } from "./integration";

export type ClaimableMember = { memberId: string; name: string; cstRecno: string };

export type ProvisionResult = { authUserId: string; email: string; memberName: string };

function displayName(row: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}): string {
  const joined = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return (row.full_name || joined || "Unnamed member").trim();
}

/** Active members with no linked account — the only valid QA binding targets. */
export async function listClaimableMembers(limit = 200): Promise<ClaimableMember[]> {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("id, cst_recno, full_name, first_name, last_name")
    .is("auth_user_id", null)
    .eq("activity_state", "active")
    .order("last_name", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((m) => ({
    memberId: m.id as string,
    name: displayName(m),
    cstRecno: m.cst_recno as string,
  }));
}

export async function provisionQaTestMember(
  actorUserId: string,
  memberId: string,
  email: string,
  password: string,
): Promise<ProvisionResult> {
  const config = await loadIntegrationConfigAdmin();
  if (config.mode !== "test") {
    throw new Error("QA test accounts can only be created while the integration is in TEST mode.");
  }

  const login = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(login)) throw new Error("Enter a valid email address.");
  if (isTestShapedEmail(login)) {
    throw new Error("Use a real address you control — scrambled test addresses cannot be a login.");
  }
  if (password.length < 10) throw new Error("Use a password of at least 10 characters.");

  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("id, auth_user_id, activity_state, full_name, first_name, last_name")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  if (!member) throw new Error("Member not found.");
  if (member.auth_user_id) throw new Error("This member already has a linked account.");
  if (member.activity_state !== "active") throw new Error("Only active members can be linked.");

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: login,
    password,
    email_confirm: true,
  });
  if (createError || !created?.user) {
    const message = createError?.message ?? "";
    const isCollision =
      createError?.status === 422 || /already (been )?registered|already exists/i.test(message);
    if (isCollision) throw new Error("An account with this email already exists.");
    throw new Error(`Account creation failed: ${message || "unknown auth error"}`);
  }
  const authUserId = created.user.id;

  // Conditional bind: another claim landing first loses the race harmlessly.
  const { data: bound, error: bindError } = await supabaseAdmin
    .from("members")
    .update({ auth_user_id: authUserId })
    .eq("id", member.id)
    .is("auth_user_id", null)
    .select("id");
  if (bindError || !bound?.length) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    throw bindError ?? new Error("This member was claimed by another account.");
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: authUserId, role: "member" }, { onConflict: "user_id,role" });
  if (roleError) throw roleError;

  await supabaseAdmin.from("member_sync_events").insert({
    member_id: member.id,
    event_type: "member_qa_account_provisioned",
    severity: "warning",
    message: `Admin provisioned a QA test account (${login}) bound to this member.`,
    actor_user_id: actorUserId,
    details: { email: login, auth_user_id: authUserId },
  });

  return { authUserId, email: login, memberName: displayName(member) };
}
