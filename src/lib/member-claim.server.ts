/**
 * Member account claim — architecture in place, deliberately switched off.
 *
 * Self-service claiming cannot run while `account_claim_enabled` is false, and
 * the database refuses to set that flag unless the integration is in LIVE mode
 * with a recorded cutover. Even then, a TEST-shaped (`zz`-wrapped) address can
 * never become a claimable identity.
 *
 * Binding rule (deliberate, do not relax): a verified email address only ever
 * *nominates* a candidate member record. The claim is refused whenever the
 * address is not unambiguous — more than one member row, or a row already
 * linked to an account. The durable boundary is the explicit
 * `members.auth_user_id` link plus the granted `member` role, so an email that
 * also belongs to a staff account can never silently inherit someone else's
 * member profile.
 *
 * The token itself never touches the database: only its SHA-256 hash is
 * stored, so a database read cannot be replayed as a claim link.
 */
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadIntegrationConfigAdmin } from "./integration-config.server";
import { isTestShapedEmail } from "./integration";

export type ClaimResult =
  | { status: "disabled" }
  | { status: "not_eligible" }
  | { status: "duplicate_email" }
  | { status: "already_claimed" }
  | { status: "sent" };

export type ClaimTokenState =
  | { status: "valid"; maskedEmail: string }
  | { status: "expired" }
  | { status: "consumed" }
  | { status: "unknown" }
  | { status: "already_claimed" };

export type CompleteClaimResult =
  | { status: "ok"; email: string }
  | { status: "expired" }
  | { status: "consumed" }
  | { status: "unknown" }
  | { status: "already_claimed" }
  | { status: "account_exists" }
  | { status: "weak_password" };

const TOKEN_TTL_MS = 7 * 86_400_000;
const TOKEN_TTL_DAYS = 7;
const MAX_ATTEMPTS_PER_TOKEN = 10;
const MAX_REQUESTS_PER_EMAIL_PER_HOUR = 3;
/** Chapter languages the invitation email is written in. */
const CLAIM_LOCALES = ["en", "de", "fr", "it"] as const;
export type ClaimEmailLocale = (typeof CLAIM_LOCALES)[number];

function normalizeLocale(value: string | null | undefined): ClaimEmailLocale {
  const candidate = (value ?? "").slice(0, 2).toLowerCase();
  return (CLAIM_LOCALES as readonly string[]).includes(candidate)
    ? (candidate as ClaimEmailLocale)
    : "en";
}

/**
 * Sends one claim invitation. The link is minted here and never re-used: every
 * send (first or resend) supersedes the previous pending link, so an older
 * message in an inbox stops working the moment a new one goes out.
 */
async function deliverClaimInvitation(args: {
  memberId: string;
  email: string;
  firstName?: string | null;
  locale?: string | null;
  baseUrl: string;
  isResend: boolean;
}) {
  const token = await mintClaimToken(args.memberId, args.email);
  const url = claimUrl(args.baseUrl, token);

  const { sendMemberEmail } = await import("./member-email.server");
  return await sendMemberEmail({
    memberId: args.memberId,
    to: args.email,
    templateKey: "member_claim",
    subject: "Activate your Member Area account",
    body: url,
    template: {
      name: "member-claim-invitation",
      data: {
        claimUrl: url,
        firstName: args.firstName ?? undefined,
        expiresInDays: TOKEN_TTL_DAYS,
        isResend: args.isResend,
        locale: normalizeLocale(args.locale),
      },
      // Token-scoped: a retry of the same send is deduped, a genuine resend
      // mints a new token and therefore a new key.
      idempotencyKey: `member-claim-${hashToken(token).slice(0, 32)}`,
    },
  });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time equality so a hash lookup cannot be timed character by character. */
function hashesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  const head = local.slice(0, 1);
  return `${head}${"•".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

/**
 * Mints a single-use link for a member. Any earlier open link is superseded
 * first — the partial unique index allows only one pending row per member.
 */
export async function mintClaimToken(memberId: string, email: string): Promise<string> {
  await supabaseAdmin
    .from("member_profile_links")
    .update({ status: "superseded" })
    .eq("member_id", memberId)
    .eq("status", "pending")
    .is("consumed_at", null);

  const token = randomBytes(32).toString("base64url");
  const { error } = await supabaseAdmin.from("member_profile_links").insert({
    member_id: memberId,
    email,
    status: "pending",
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
  });
  if (error) throw error;
  return token;
}

export function claimUrl(baseUrl: string, token: string) {
  return `${baseUrl.replace(/\/$/, "")}/claim/${token}`;
}

export async function attemptMemberClaim(email: string, baseUrl: string): Promise<ClaimResult> {
  const config = await loadIntegrationConfigAdmin();
  if (!config.account_claim_enabled || config.mode !== "live" || config.cutover_in_progress) {
    return { status: "disabled" };
  }

  const normalized = email.trim().toLowerCase();
  if (isTestShapedEmail(normalized)) return { status: "not_eligible" };

  // Throttle per address. Returns the neutral "sent" shape so the endpoint
  // still cannot be used to probe which addresses exist.
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await supabaseAdmin
    .from("member_profile_links")
    .select("id", { count: "exact", head: true })
    .eq("email", normalized)
    .gte("requested_at", since);
  if ((count ?? 0) >= MAX_REQUESTS_PER_EMAIL_PER_HOUR) return { status: "sent" };

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
  if (member.activity_state !== "active" || !member.last_synced_at)
    return { status: "not_eligible" };

  await deliverClaimInvitation({
    memberId: member.id,
    email: normalized,
    baseUrl,
    isResend: false,
  });

  return { status: "sent" };
}

type LinkRow = {
  id: string;
  member_id: string;
  email: string;
  status: string;
  token_hash: string | null;
  consumed_at: string | null;
  expires_at: string | null;
  attempts: number;
};

async function loadLink(token: string): Promise<LinkRow | null> {
  const hash = hashToken(token);
  const { data, error } = await supabaseAdmin
    .from("member_profile_links")
    .select("id, member_id, email, status, token_hash, consumed_at, expires_at, attempts")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.token_hash || !hashesMatch(data.token_hash, hash)) return null;
  return data as LinkRow;
}

async function noteAttempt(link: LinkRow) {
  await supabaseAdmin
    .from("member_profile_links")
    .update({ attempts: link.attempts + 1, last_attempt_at: new Date().toISOString() })
    .eq("id", link.id);
}

function linkState(link: LinkRow): Exclude<ClaimTokenState["status"], "valid"> | null {
  if (link.consumed_at || link.status === "completed") return "consumed";
  if (link.status === "superseded") return "unknown";
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) return "expired";
  if (link.attempts >= MAX_ATTEMPTS_PER_TOKEN) return "expired";
  return null;
}

export async function verifyClaimToken(token: string): Promise<ClaimTokenState> {
  const link = await loadLink(token);
  if (!link) return { status: "unknown" };
  await noteAttempt(link);

  const bad = linkState(link);
  if (bad) return { status: bad };

  // A member who gained an account since the link was issued can no longer be
  // claimed — a leaked older link must never re-bind a claimed member.
  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("auth_user_id, activity_state")
    .eq("id", link.member_id)
    .maybeSingle();
  if (error) throw error;
  if (!member || member.activity_state !== "active") return { status: "unknown" };
  if (member.auth_user_id) return { status: "already_claimed" };

  return { status: "valid", maskedEmail: maskEmail(link.email) };
}

export async function completeClaim(token: string, password: string): Promise<CompleteClaimResult> {
  if (password.length < 10) return { status: "weak_password" };

  const link = await loadLink(token);
  if (!link) return { status: "unknown" };
  await noteAttempt(link);

  const bad = linkState(link);
  if (bad) return { status: bad };

  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("id, auth_user_id, activity_state, first_name, last_name")
    .eq("id", link.member_id)
    .maybeSingle();
  if (error) throw error;
  if (!member || member.activity_state !== "active") return { status: "unknown" };
  if (member.auth_user_id) return { status: "already_claimed" };

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: link.email,
    password,
    email_confirm: true,
    // The profile row is auto-created from this metadata; without it the
    // account ends up nameless and public bylines lose the surname.
    user_metadata: {
      first_name: member.first_name ?? "",
      last_name: member.last_name ?? "",
    },
  });
  if (createError || !created?.user) {
    // Only a genuine collision is a member-facing outcome: an existing account
    // must sign in instead, because claiming would silently take over an
    // identity we did not create here. Anything else (GoTrue outage, failing
    // auth trigger) is an infrastructure fault and must surface as an error —
    // mapping it to "account exists" once hid a broken sign-up trigger behind
    // advice the member could never act on.
    const message = createError?.message ?? "";
    const isCollision =
      createError?.status === 422 || /already (been )?registered|already exists/i.test(message);
    if (isCollision) return { status: "account_exists" };
    throw new Error(`Account creation failed: ${message || "unknown auth error"}`);
  }
  const authUserId = created.user.id;

  const { error: bindError } = await supabaseAdmin
    .from("members")
    .update({ auth_user_id: authUserId })
    .eq("id", member.id)
    .is("auth_user_id", null);
  if (bindError) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    throw bindError;
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: authUserId, role: "member" }, { onConflict: "user_id,role" });
  if (roleError) throw roleError;

  await supabaseAdmin
    .from("member_profile_links")
    .update({
      status: "completed",
      consumed_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq("id", link.id);

  await supabaseAdmin.from("member_sync_events").insert({
    member_id: member.id,
    event_type: "member_account_claimed",
    severity: "info",
    message: "Member completed the account claim flow and set a password.",
    details: { email: link.email, auth_user_id: authUserId },
  });

  return { status: "ok", email: link.email };
}

/**
 * Admin support path: mint a claim link for a member and hand the URL back
 * once, for manual delivery. This is how the flow is exercised while the
 * member-facing email transport is still inert. Audited like the bind action.
 */
export async function issueClaimLinkForMember(
  actorUserId: string,
  memberId: string,
  baseUrl: string,
): Promise<{ url: string; email: string }> {
  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("id, email, auth_user_id, activity_state")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  if (!member) throw new Error("Member not found.");
  if (member.auth_user_id) throw new Error("This member already has a linked account.");
  if (!member.email) throw new Error("This member record has no email address.");
  if (member.activity_state !== "active")
    throw new Error("Only active members can claim an account.");

  const email = member.email.trim().toLowerCase();
  const token = await mintClaimToken(member.id, email);

  await supabaseAdmin.from("member_sync_events").insert({
    member_id: member.id,
    event_type: "member_claim_link_issued_by_staff",
    severity: "warning",
    message: `Staff issued a one-time claim link for ${email} (support/testing path).`,
    actor_user_id: actorUserId,
    details: { email },
  });

  return { url: claimUrl(baseUrl, token), email };
}

export type ClaimInvitationStatus = {
  email: string | null;
  eligible: boolean;
  blockedReason: string | null;
  lastSentAt: string | null;
  lastStatus: string | null;
  sendCount: number;
};

function invitationBlockReason(member: {
  email: string | null;
  auth_user_id: string | null;
  activity_state: string;
}): string | null {
  if (member.auth_user_id) return "already_claimed";
  if (!member.email) return "no_email";
  if (member.activity_state !== "active") return "inactive";
  if (isTestShapedEmail(member.email.trim().toLowerCase())) return "test_identity";
  return null;
}

/** Read model for the staff panel: whether an invitation can go out, and what already did. */
export async function loadClaimInvitationStatus(memberId: string): Promise<ClaimInvitationStatus> {
  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("email, auth_user_id, activity_state")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  if (!member) throw new Error("Member not found.");

  const { data: log, error: logError } = await supabaseAdmin
    .from("member_email_log")
    .select("status, created_at")
    .eq("member_id", memberId)
    .eq("template_key", "member_claim")
    .order("created_at", { ascending: false });
  if (logError) throw logError;

  const blockedReason = invitationBlockReason(member);
  return {
    email: member.email,
    eligible: blockedReason === null,
    blockedReason,
    lastSentAt: log?.[0]?.created_at ?? null,
    lastStatus: log?.[0]?.status ?? null,
    sendCount: log?.length ?? 0,
  };
}

/**
 * Staff-triggered invitation (first send and resend are the same operation —
 * a resend simply supersedes the previous link). Audited like every other
 * member-facing staff action.
 */
export async function sendClaimInvitation(
  actorUserId: string,
  memberId: string,
  baseUrl: string,
): Promise<{ status: ClaimInvitationStatus; result: string }> {
  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("id, email, first_name, auth_user_id, activity_state")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  if (!member) throw new Error("Member not found.");

  const blocked = invitationBlockReason(member);
  if (blocked === "already_claimed") throw new Error("This member already has a linked account.");
  if (blocked === "no_email") throw new Error("This member record has no email address.");
  if (blocked === "inactive") throw new Error("Only active members can claim an account.");
  if (blocked === "test_identity")
    throw new Error("This member uses a test-shaped address and can never be emailed.");

  const email = member.email!.trim().toLowerCase();
  const priorStatus = await loadClaimInvitationStatus(memberId);
  const isResend = priorStatus.sendCount > 0;

  const sendResult = await deliverClaimInvitation({
    memberId: member.id,
    email,
    firstName: member.first_name,
    baseUrl,
    isResend,
  });

  await supabaseAdmin.from("member_sync_events").insert({
    member_id: member.id,
    event_type: isResend ? "member_claim_invitation_resent" : "member_claim_invitation_sent",
    severity: "info",
    message: `Staff ${isResend ? "resent" : "sent"} the claim invitation to ${email}.`,
    actor_user_id: actorUserId,
    details: { email, outcome: sendResult },
  });

  const result = sendResult.sent
    ? sendResult.redirected
      ? "sent_redirected"
      : "sent"
    : sendResult.reason;

  return { status: await loadClaimInvitationStatus(memberId), result };
}
