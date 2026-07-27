REVOKE EXECUTE ON FUNCTION public.member_is_directory_eligible(uuid) FROM authenticated;

CREATE OR REPLACE VIEW public.coach_directory_public
WITH (security_invoker = true) AS
SELECT
  p.id                                   AS profile_id,
  m.id                                   AS member_id,
  m.full_name,
  m.city,
  m.country,
  m.organisation,
  upper(m.credential_slug)               AS credential_slug,
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
  ARRAY_REMOVE(ARRAY[
    CASE WHEN p.coaching_available THEN 'coaching' END,
    CASE WHEN p.mentoring_available THEN 'mentoring' END,
    CASE WHEN p.supervision_available THEN 'supervision' END
  ], NULL)                               AS services,
  COALESCE((SELECT array_agg(r.slug ORDER BY r.sort_order)
            FROM public.member_profile_regions mpr
            JOIN public.cf_regions r ON r.id = mpr.region_id
            WHERE mpr.profile_id = p.id), '{}')            AS region_slugs,
  COALESCE((SELECT array_agg(l.slug ORDER BY l.sort_order)
            FROM public.member_profile_languages mpl
            JOIN public.cf_languages l ON l.id = mpl.language_id
            WHERE mpl.profile_id = p.id), '{}')            AS language_slugs,
  COALESCE((SELECT array_agg(s.slug ORDER BY s.sort_order)
            FROM public.member_profile_specialisations mps
            JOIN public.cf_specialisations s ON s.id = mps.specialisation_id
            WHERE mps.profile_id = p.id), '{}')            AS specialisation_slugs,
  COALESCE((SELECT array_agg(f.slug ORDER BY f.sort_order)
            FROM public.member_profile_formats mpf
            JOIN public.cf_formats f ON f.id = mpf.format_id
            WHERE mpf.profile_id = p.id), '{}')            AS format_slugs,
  true                                   AS is_active_member,
  true                                   AS has_directory_credential,
  true                                   AS is_directory_eligible,
  true                                   AS is_directory_visible,
  p.updated_at
FROM public.member_directory_profiles p
JOIN public.members m ON m.id = p.member_id
WHERE p.visibility = 'published'
  AND public.member_is_active(m.activity_state)
  AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on);

GRANT SELECT ON public.coach_directory_public TO anon;
GRANT SELECT ON public.coach_directory_public TO authenticated;
GRANT SELECT ON public.coach_directory_public TO service_role;
-- migration end</query>
