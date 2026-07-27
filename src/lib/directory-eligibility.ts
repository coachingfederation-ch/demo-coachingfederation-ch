/**
 * Directory eligibility — the single definition of the four concepts the
 * roadmap keeps deliberately separate:
 *
 *  - `is_active_member`         membership validity (feed / lifecycle only)
 *  - `has_directory_credential` accreditation validity (ACC | PCC | MCC, unexpired)
 *  - `is_directory_eligible`    baseline permission to participate at all
 *  - `is_directory_visible`     actually shown to the public right now
 *
 * Invariant, enforced here and again by a database trigger: a member without a
 * valid directory credential can never resolve to eligible, and an ineligible
 * member can never resolve to visible — regardless of membership state, member
 * intent or staff action.
 *
 * These mirror the SQL functions `public.member_is_active`,
 * `public.member_has_directory_credential` and
 * `public.member_is_directory_eligible`. The database remains the boundary of
 * record; this module exists so admin and member screens can *explain* a
 * decision without re-deriving it differently.
 */

/**
 * The ICF feed tag is `Flagship_Credential`; it is stored as
 * `members.credential_slug` and joins `cf_credentials.slug`. Upper-case
 * everywhere — one canonical casing per layer.
 */
export const DIRECTORY_CREDENTIAL_SLUGS = ["ACC", "PCC", "MCC"] as const;

export type MemberEligibilityFacts = {
  activity_state: string | null;
  credential_slug: string | null;
  credential_expires_on: string | null;
};

/**
 * `hidden_no_credential` is deliberately distinct from `hidden_inactive`: one
 * means "membership lapsed", the other "active member without a valid
 * ACC/PCC/MCC credential". They are never interchangeable.
 */
export type MemberVisibility =
  | "draft"
  | "published"
  | "hidden_no_credential"
  | "hidden_inactive"
  | "hidden_admin";

export function isActiveMember(member: MemberEligibilityFacts): boolean {
  return member.activity_state === "active";
}

export function hasDirectoryCredential(member: MemberEligibilityFacts): boolean {
  const slug = (member.credential_slug ?? "").toUpperCase();
  if (!(DIRECTORY_CREDENTIAL_SLUGS as readonly string[]).includes(slug)) return false;
  // A missing expiry counts as valid: the feed does not supply one for every
  // credentialed member, and absent data must not silently delist someone who
  // genuinely holds the credential.
  if (!member.credential_expires_on) return true;
  return new Date(`${member.credential_expires_on}T23:59:59Z`).getTime() >= Date.now();
}

export function isDirectoryEligible(member: MemberEligibilityFacts): boolean {
  return isActiveMember(member) && hasDirectoryCredential(member);
}

export function isDirectoryVisible(
  member: MemberEligibilityFacts,
  visibility: MemberVisibility | string | null,
): boolean {
  return isDirectoryEligible(member) && visibility === "published";
}

export type EligibilityReason = "eligible" | "inactive" | "no_credential" | "credential_expired";

/** Why a member is (not) eligible — drives admin and Member Area messaging. */
export function directoryEligibilityReason(member: MemberEligibilityFacts): EligibilityReason {
  if (!isActiveMember(member)) return "inactive";
  const slug = (member.credential_slug ?? "").toUpperCase();
  if (!(DIRECTORY_CREDENTIAL_SLUGS as readonly string[]).includes(slug)) return "no_credential";
  if (!hasDirectoryCredential(member)) return "credential_expired";
  return "eligible";
}

/** Visibility a system-driven reconcile must force, or null to leave as-is. */
export function enforcedVisibility(member: MemberEligibilityFacts): MemberVisibility | null {
  const reason = directoryEligibilityReason(member);
  if (reason === "inactive") return "hidden_inactive";
  if (reason === "no_credential" || reason === "credential_expired") return "hidden_no_credential";
  return null;
}

/**
 * Why a profile may not be published right now, or null when it may.
 *
 * Publication needs eligibility *and* at least one declared service area: a
 * listing with no canton cannot be found by the directory's region filter, so
 * publishing one would produce an invisible "published" profile.
 *
 * This is the one definition of that rule. The member editor, the staff member
 * screen and the server-side write path all call it, so the three surfaces can
 * never drift apart. The server path is still the boundary — the UIs use this
 * to *explain* the block, not to enforce it.
 */
export type PublishBlockReason = "ineligible" | "no_region";

export function publishBlockReason(input: {
  eligible: boolean;
  regionCount: number;
}): PublishBlockReason | null {
  if (!input.eligible) return "ineligible";
  if (input.regionCount < 1) return "no_region";
  return null;
}
