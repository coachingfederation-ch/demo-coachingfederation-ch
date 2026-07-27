-- Public directory reads must not be able to reach member contact details.
-- The email shown on an opted-in coach profile now comes from a guarded
-- helper, so the `email` column itself never has to be readable by visitors.
CREATE OR REPLACE FUNCTION private.directory_contact_email(_profile_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.email
  FROM public.member_directory_profiles p
  JOIN public.members m ON m.id = p.member_id
  WHERE p.id = _profile_id
    AND p.contact_email_public
    AND p.visibility = 'published'
    AND public.member_is_active(m.activity_state)
    AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on)
$$;

REVOKE ALL ON FUNCTION private.directory_contact_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.directory_contact_email(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.coach_directory_public
WITH (security_invoker = on) AS
 SELECT p.id AS profile_id,
    m.id AS member_id,
    m.full_name,
    m.city,
    m.country,
    m.organisation,
    upper(m.credential_slug) AS credential_slug,
    m.credential_awarded_on,
    p.tagline,
    p.description,
    p.website_url,
    p.linkedin_url,
    p.profile_image_path,
    p.availability_slug,
    p.coaching_available,
    p.mentor_accredited,
    p.mentoring_available,
    p.supervision_accredited,
    p.supervision_available,
    p.booking_url,
    p.response_time_note,
    p.approach,
    p.qualifications,
    p.experience_band,
    p.session_length_note,
    p.fees_note,
    p.availability_note,
    p.testimonial_quote,
    p.testimonial_attribution,
    p.primary_locale,
    COALESCE(( SELECT jsonb_object_agg(t.locale, jsonb_build_object('tagline', t.tagline, 'description', t.description, 'approach', t.approach, 'qualifications', t.qualifications, 'fees_note', t.fees_note, 'session_length_note', t.session_length_note, 'availability_note', t.availability_note, 'response_time_note', t.response_time_note, 'testimonial_quote', t.testimonial_quote, 'testimonial_attribution', t.testimonial_attribution)) AS jsonb_object_agg
           FROM public.member_profile_translations t
          WHERE t.profile_id = p.id AND t.is_ready), '{}'::jsonb) AS translations,
    private.directory_contact_email(p.id) AS contact_email,
    array_remove(ARRAY[
        CASE WHEN p.coaching_available THEN 'coaching'::text ELSE NULL::text END,
        CASE WHEN p.mentoring_available THEN 'mentoring'::text ELSE NULL::text END,
        CASE WHEN p.supervision_available THEN 'supervision'::text ELSE NULL::text END], NULL::text) AS services,
    COALESCE(( SELECT array_agg(r.slug ORDER BY r.sort_order) AS array_agg
           FROM public.member_profile_regions mpr
             JOIN public.cf_regions r ON r.id = mpr.region_id
          WHERE mpr.profile_id = p.id), '{}'::text[]) AS region_slugs,
    COALESCE(( SELECT array_agg(l.slug ORDER BY l.sort_order) AS array_agg
           FROM public.member_profile_languages mpl
             JOIN public.cf_languages l ON l.id = mpl.language_id
          WHERE mpl.profile_id = p.id), '{}'::text[]) AS language_slugs,
    COALESCE(( SELECT array_agg(s.slug ORDER BY s.sort_order) AS array_agg
           FROM public.member_profile_specialisations mps
             JOIN public.cf_specialisations s ON s.id = mps.specialisation_id
          WHERE mps.profile_id = p.id), '{}'::text[]) AS specialisation_slugs,
    COALESCE(( SELECT array_agg(f.slug ORDER BY f.sort_order) AS array_agg
           FROM public.member_profile_formats mpf
             JOIN public.cf_formats f ON f.id = mpf.format_id
          WHERE mpf.profile_id = p.id), '{}'::text[]) AS format_slugs,
    COALESCE(( SELECT array_agg(ct.slug ORDER BY ct.sort_order) AS array_agg
           FROM public.member_profile_client_types mpc
             JOIN public.cf_client_types ct ON ct.id = mpc.client_type_id
          WHERE mpc.profile_id = p.id), '{}'::text[]) AS client_type_slugs,
    true AS is_active_member,
    true AS has_directory_credential,
    true AS is_directory_eligible,
    true AS is_directory_visible,
    p.updated_at
   FROM public.member_directory_profiles p
     JOIN public.members m ON m.id = p.member_id
  WHERE p.visibility = 'published'
    AND public.member_is_active(m.activity_state)
    AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on);

GRANT SELECT ON public.coach_directory_public TO anon, authenticated;
GRANT ALL ON public.coach_directory_public TO service_role;

-- Column-level lockdown: visitors keep row access to directory-listed members
-- (the RLS policies are unchanged) but can only read the columns the public
-- directory actually renders. Email, phone, membership dates, the ICF record
-- number and sync diagnostics are no longer selectable.
REVOKE SELECT ON public.members FROM anon;
REVOKE SELECT ON public.members FROM authenticated;

GRANT SELECT (
  id,
  full_name,
  city,
  country,
  organisation,
  credential_slug,
  credential_awarded_on,
  credential_expires_on,
  activity_state
) ON public.members TO anon, authenticated;

GRANT ALL ON public.members TO service_role;