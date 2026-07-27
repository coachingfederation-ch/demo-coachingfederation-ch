ALTER VIEW public.coach_directory_public SET (security_invoker = true);

GRANT EXECUTE ON FUNCTION public.member_is_directory_eligible(uuid) TO anon;

-- Column-scoped public read on members: no email, phone, cst_recno or membership dates.
GRANT SELECT (id, full_name, city, country, organisation, credential_slug, credential_awarded_on, credential_expires_on, activity_state)
  ON public.members TO anon;

CREATE POLICY "Public can read directory-listed members"
  ON public.members FOR SELECT TO anon
  USING (
    public.member_is_active(activity_state)
    AND public.member_has_directory_credential(credential_slug, credential_expires_on)
    AND EXISTS (
      SELECT 1 FROM public.member_directory_profiles p
      WHERE p.member_id = members.id AND p.visibility = 'published'
    )
  );

GRANT SELECT (id, member_id, visibility, tagline, description, website_url, linkedin_url, profile_image_path,
              availability_slug, coaching_available, mentor_accredited, mentoring_available,
              supervision_accredited, supervision_available, updated_at)
  ON public.member_directory_profiles TO anon;

CREATE POLICY "Public can read published directory profiles"
  ON public.member_directory_profiles FOR SELECT TO anon
  USING (
    visibility = 'published'
    AND coalesce(public.member_is_directory_eligible(member_id), false)
  );

GRANT SELECT ON public.member_profile_regions TO anon;
GRANT SELECT ON public.member_profile_languages TO anon;
GRANT SELECT ON public.member_profile_specialisations TO anon;
GRANT SELECT ON public.member_profile_formats TO anon;

CREATE POLICY "Public can read regions of published profiles"
  ON public.member_profile_regions FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.member_directory_profiles p
                 WHERE p.id = member_profile_regions.profile_id AND p.visibility = 'published'));

CREATE POLICY "Public can read languages of published profiles"
  ON public.member_profile_languages FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.member_directory_profiles p
                 WHERE p.id = member_profile_languages.profile_id AND p.visibility = 'published'));

CREATE POLICY "Public can read specialisations of published profiles"
  ON public.member_profile_specialisations FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.member_directory_profiles p
                 WHERE p.id = member_profile_specialisations.profile_id AND p.visibility = 'published'));

CREATE POLICY "Public can read formats of published profiles"
  ON public.member_profile_formats FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.member_directory_profiles p
                 WHERE p.id = member_profile_formats.profile_id AND p.visibility = 'published'));

GRANT SELECT ON public.cf_regions TO anon;
GRANT SELECT ON public.cf_languages TO anon;
GRANT SELECT ON public.cf_specialisations TO anon;
GRANT SELECT ON public.cf_formats TO anon;
GRANT SELECT ON public.cf_credentials TO anon;
GRANT SELECT ON public.cf_availability_labels TO anon;
-- migration end</query>
