/**
 * Member claim — token issuing.
 *
 * A claim token is minted with `crypto.randomBytes` and only its SHA-256 hash
 * is ever persisted, so a database read can never be replayed as a claim
 * link. This module owns hashing, minting, masking and URL construction.
 */
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TOKEN_TTL_MS = 7 * 86_400_000;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time equality so a hash lookup cannot be timed character by character. */
export function hashesMatch(a: string, b: string) {
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
