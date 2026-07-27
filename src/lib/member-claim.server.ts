/**
 * Member account claim — architecture in place, deliberately switched off.
 *
 * Nothing here can run while `account_claim_enabled` is false, and the database
 * refuses to set that flag unless the integration is in LIVE mode with a
 * recorded cutover. Even then, a TEST-shaped (`zz`-wrapped) address can never
 * become a claimable identity.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadIntegrationConfigAdmin } from "./member-email.server";
import { isTestShapedEmail } from "./integration";

export type ClaimResult =
  | { status: "disabled" }
  | { status: "not_eligible" }
  | { status: "duplicate_email" }
  | { status: "already_claimed" }
  | { status: "sent" };

export async function attemptMemberClaim(email: string): Promise<ClaimResult> {
  const config = await loadIntegrationConfigAdmin();
  if (!config.account_claim_enabled || config.mode !== "live" || config.cutover_in_progress) {
    return { status: "disabled" };
  }

  const normalized = email.trim().toLowerCase();
  if (isTestShapedEmail(normalized)) return { status: "not_eligible" };

  const { data: matches, error } = await supabaseAdmin
    .from("members")
    .select("id, email, activity_state, auth_user_id, last_synced_at")
    .eq("email", normalized);
  if (error) throw error;

  if (!matches || matches.length === 0) return { status: "not_eligible" };
  // ~500 members: duplicates are an admin-resolved data issue, not a picker flow.
  if (matches.length > 1) return { status: "duplicate_email" };

  const member = matches[0];
  if (member.auth_user_id) return { status: "already_claimed" };
  if (member.activity_state !== "active" || !member.last_synced_at) return { status: "not_eligible" };

  await supabaseAdmin.from("member_profile_links").insert({
    member_id: member.id,
    email: normalized,
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  });

  const { sendMemberEmail } = await import("./member-email.server");
  await sendMemberEmail({
    memberId: member.id,
    to: normalized,
    templateKey: "member_claim",
    subject: "Set your ICF Switzerland Member Area password",
    body: "<p>Follow the link in this email to set your password.</p>",
  });

  return { status: "sent" };
}