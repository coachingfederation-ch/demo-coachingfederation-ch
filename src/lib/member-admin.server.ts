/**
 * Admin member detail: read model and staff-controlled writes.
 *
 * Two kinds of data meet here and must never blur into each other:
 *
 *  - **Imported ICF fields** (name, email, address, credential, membership
 *    dates) are read-only reference data. They are replaced wholesale on every
 *    sync, so any local edit would be silently lost.
 *  - **Local directory fields** (service-area regions, accreditation flags,
 *    administrative suppression) are owned here, and later by the member.
 *
 * In particular the imported city/state/zip is *not* a service area. Regions
 * describe where a member offers in-person work and are multi-select and
 * self-declared; they are only ever written by an explicit staff or member
 * action, never derived from an address.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { MemberVisibility } from "./directory-eligibility";

export type MemberDetail = {
  member: {
    id: string;
    cst_recno: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    organisation: string | null;
    credential_slug: string | null;
    credential_awarded_on: string | null;
    credential_expires_on: string | null;
    member_type: string | null;
    membership_join_date: string | null;
    membership_expiration_date: string | null;
    activity_state: string;
    scheduled_deletion_at: string | null;
    last_synced_at: string | null;
    /** Feed extras with no column of their own (zip, state, ACTC, …). */
    diagnostics: Record<string, string>;
  };
  profile: {
    id: string;
    visibility: MemberVisibility;
    tagline: string | null;
    coaching_available: boolean;
    mentor_accredited: boolean;
    mentoring_available: boolean;
    supervision_accredited: boolean;
    supervision_available: boolean;
    region_ids: string[];
  } | null;
};

const MEMBER_COLUMNS =
  "id, cst_recno, full_name, first_name, last_name, email, phone, city, country, organisation, credential_slug, credential_awarded_on, credential_expires_on, member_type, membership_join_date, membership_expiration_date, activity_state, scheduled_deletion_at, last_synced_at, diagnostics";

export async function loadMemberDetail(memberId: string): Promise<MemberDetail> {
  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("id", memberId)
    .single();
  if (error) throw error;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("member_directory_profiles")
    .select(
      "id, visibility, tagline, coaching_available, mentor_accredited, mentoring_available, supervision_accredited, supervision_available",
    )
    .eq("member_id", memberId)
    .maybeSingle();
  if (profileError) throw profileError;

  let regionIds: string[] = [];
  if (profile) {
    const { data: regions, error: regionError } = await supabaseAdmin
      .from("member_profile_regions")
      .select("region_id")
      .eq("profile_id", profile.id);
    if (regionError) throw regionError;
    regionIds = (regions ?? []).map((row) => row.region_id as string);
  }

  return {
    member: member as unknown as MemberDetail["member"],
    profile: profile
      ? ({ ...profile, region_ids: regionIds } as unknown as MemberDetail["profile"])
      : null,
  };
}

export type MemberAdminUpdate = {
  memberId: string;
  visibility?: MemberVisibility;
  mentor_accredited?: boolean;
  supervision_accredited?: boolean;
  region_ids?: string[];
};

export async function updateMemberDirectoryAdmin(
  actorUserId: string,
  input: MemberAdminUpdate,
): Promise<MemberDetail> {
  const { data: profile, error } = await supabaseAdmin
    .from("member_directory_profiles")
    .select("id, visibility, mentor_accredited, supervision_accredited")
    .eq("member_id", input.memberId)
    .maybeSingle();
  if (error) throw error;
  if (!profile) throw new Error("This member has no directory profile yet. Run a sync first.");

  const patch: Record<string, unknown> = {};
  if (input.visibility && input.visibility !== profile.visibility) patch.visibility = input.visibility;
  if (
    input.mentor_accredited !== undefined &&
    input.mentor_accredited !== profile.mentor_accredited
  ) {
    patch.mentor_accredited = input.mentor_accredited;
  }
  if (
    input.supervision_accredited !== undefined &&
    input.supervision_accredited !== profile.supervision_accredited
  ) {
    patch.supervision_accredited = input.supervision_accredited;
  }

  if (Object.keys(patch).length) {
    // The eligibility trigger is the real boundary: a `published` write for an
    // ineligible member is rejected here, not just discouraged in the UI.
    const { error: updateError } = await supabaseAdmin
      .from("member_directory_profiles")
      .update(patch as never)
      .eq("id", profile.id);
    if (updateError) throw updateError;
  }

  if (input.region_ids) {
    // Full replace: staff sets the complete declared service area in one go.
    const { error: deleteError } = await supabaseAdmin
      .from("member_profile_regions")
      .delete()
      .eq("profile_id", profile.id);
    if (deleteError) throw deleteError;
    if (input.region_ids.length) {
      const { error: insertError } = await supabaseAdmin.from("member_profile_regions").insert(
        input.region_ids.map((regionId) => ({ profile_id: profile.id, region_id: regionId })),
      );
      if (insertError) throw insertError;
    }
    patch.region_ids = input.region_ids;
  }

  if (Object.keys(patch).length) {
    await supabaseAdmin.from("member_sync_events").insert({
      event_type: "directory_profile_admin_update",
      severity: "info",
      message: `Staff updated directory profile fields: ${Object.keys(patch).join(", ")}.`,
      member_id: input.memberId,
      actor_user_id: actorUserId,
      details: patch as never,
    });
  }

  return await loadMemberDetail(input.memberId);
}
