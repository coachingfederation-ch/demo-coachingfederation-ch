-- Finding: member_directory_profiles_public_read_missing_grant_check
-- Column-scoped SELECT grants already existed on this table, but a blanket
-- table-level SELECT grant to anon/authenticated superseded them, so every
-- column of a published profile was readable. Restrict to exactly the columns
-- projected by public.coach_directory_public (the only anon/authenticated read
-- path; all app-internal reads go through the service role, and /team reads a
-- SECURITY DEFINER function), matching the members/op_projects pattern.
REVOKE SELECT ON public.member_directory_profiles FROM anon, authenticated;

GRANT SELECT (
  id,
  member_id,
  visibility,
  tagline,
  description,
  website_url,
  linkedin_url,
  booking_url,
  profile_image_path,
  availability_slug,
  coaching_available,
  mentor_accredited,
  mentoring_available,
  supervision_accredited,
  supervision_available,
  response_time_note,
  approach,
  qualifications,
  experience_band,
  session_length_note,
  fees_note,
  availability_note,
  testimonial_quote,
  testimonial_attribution,
  primary_locale,
  updated_at
) ON public.member_directory_profiles TO anon, authenticated;

-- Finding: profiles_public_read_authenticated_scope
-- The public/authenticated read policies exist for author attribution, which
-- needs only the display name. Column-scope the grant so any future column
-- (contact details, tokens, notes) is not exposed by those same policies.
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (id, first_name, last_name) ON public.profiles TO anon, authenticated;
