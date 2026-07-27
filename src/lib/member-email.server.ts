/**
 * Single gate for every member-facing email.
 *
 * While `emails_suppressed` is true (always the case in TEST mode, enforced by
 * a database trigger) no provider call is made at all — the intent is logged
 * and dropped. There is deliberately no queue table, so nothing can drain into
 * LIVE after cutover.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { IntegrationConfig } from "./integration";
import { isTestShapedEmail } from "./integration";

export type MemberEmail = {
  memberId?: string | null;
  to: string;
  templateKey: string;
  subject: string;
  body: string;
};

export type MemberEmailResult =
  | { sent: false; reason: "suppressed" | "test_shaped_recipient" | "failed" }
  | { sent: true; redirected: boolean };

export async function loadIntegrationConfigAdmin(): Promise<IntegrationConfig> {
  const { data, error } = await supabaseAdmin
    .from("integration_config")
    .select("*")
    .eq("id", true)
    .single();
  if (error) throw error;
  return data as unknown as IntegrationConfig;
}

export async function sendMemberEmail(email: MemberEmail): Promise<MemberEmailResult> {
  const config = await loadIntegrationConfigAdmin();

  const log = async (status: string, actual: string | null, errorMessage?: string) => {
    await supabaseAdmin.from("member_email_log").insert({
      member_id: email.memberId ?? null,
      intended_recipient: email.to,
      actual_recipient: actual,
      template_key: email.templateKey,
      status,
      mode: config.mode,
      error_message: errorMessage ?? null,
    });
  };

  // A TEST-shaped address is never a real person — refuse regardless of mode.
  if (isTestShapedEmail(email.to)) {
    await log("blocked_test_identity", null);
    return { sent: false, reason: "test_shaped_recipient" };
  }

  if (config.emails_suppressed && !config.email_redirect_to) {
    await log("suppressed", null);
    return { sent: false, reason: "suppressed" };
  }

  const recipient = config.emails_suppressed ? config.email_redirect_to! : email.to;
  const redirected = recipient !== email.to;

  try {
    const { sendLovableEmail } = await import("@lovable.dev/email-js");
    await sendLovableEmail({
      apiKey: process.env.LOVABLE_API_KEY!,
      to: recipient,
      subject: redirected ? `[redirected: ${email.to}] ${email.subject}` : email.subject,
      html: email.body,
    } as never);
    await log(redirected ? "redirected" : "sent", recipient);
    return { sent: true, redirected };
  } catch (error) {
    await log("failed", recipient, error instanceof Error ? error.message : String(error));
    return { sent: false, reason: "failed" };
  }
}