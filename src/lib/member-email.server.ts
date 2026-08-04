/**
 * Single gate for every member-facing email.
 *
 * While `emails_suppressed` is true (always the case in TEST mode, enforced by
 * a database trigger) no provider call is made at all — the intent is logged
 * and dropped. There is deliberately no queue table, so nothing can drain into
 * LIVE after cutover.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isTestShapedEmail } from "./integration";
import type { IntegrationConfig } from "./integration";
import { loadIntegrationConfigAdmin } from "./integration-config.server";

export type MemberEmail = {
  memberId?: string | null;
  to: string;
  templateKey: string;
  subject: string;
  body: string;
  /** Registered React Email template used for the actual send. */
  template?: { name: string; data?: Record<string, unknown>; idempotencyKey?: string };
};

export type MemberEmailResult =
  | { sent: false; reason: "suppressed" | "test_shaped_recipient" | "failed" | "recipient_suppressed" }
  | { sent: true; redirected: boolean };

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

  // Emails without a registered template have no transport of their own — they
  // are intent records only, so they are logged and dropped rather than lost
  // silently.
  if (!email.template) {
    await log(redirected ? "no_transport_redirected" : "no_transport", recipient);
    return { sent: false, reason: "failed" };
  }

  try {
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const result = await sendTemplateEmail(email.template.name, recipient, {
      templateData: email.template.data,
      idempotencyKey: email.template.idempotencyKey,
    });
    if (!result.sent) {
      // Bounced/complained/unsubscribed recipients are blocked upstream; this
      // is an expected outcome for staff to act on, not a failure to retry.
      await log(redirected ? "recipient_suppressed_redirected" : "recipient_suppressed", recipient);
      return { sent: false, reason: "recipient_suppressed" };
    }
    await log(redirected ? "sent_redirected" : "sent", recipient);
    return { sent: true, redirected };
  } catch (err) {
    await log("failed", recipient, err instanceof Error ? err.message : String(err));
    return { sent: false, reason: "failed" };
  }
}

export function describeEmailGate(config: IntegrationConfig): string {
  if (config.emails_suppressed && !config.email_redirect_to) return "suppressed";
  if (config.emails_suppressed) return `redirected to ${config.email_redirect_to}`;
  return "live";
}
