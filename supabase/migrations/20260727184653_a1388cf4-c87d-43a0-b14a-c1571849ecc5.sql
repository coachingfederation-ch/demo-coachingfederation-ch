ALTER TABLE public.member_directory_profiles
  ADD COLUMN IF NOT EXISTS primary_locale text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS content_updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.member_directory_profiles
  DROP CONSTRAINT IF EXISTS member_directory_profiles_primary_locale_check;
ALTER TABLE public.member_directory_profiles
  ADD CONSTRAINT member_directory_profiles_primary_locale_check
  CHECK (primary_locale IN ('en','de','fr','it'));

CREATE OR REPLACE FUNCTION public.tg_member_profile_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tagline IS DISTINCT FROM OLD.tagline
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.approach IS DISTINCT FROM OLD.approach
     OR NEW.qualifications IS DISTINCT FROM OLD.qualifications
     OR NEW.fees_note IS DISTINCT FROM OLD.fees_note
     OR NEW.session_length_note IS DISTINCT FROM OLD.session_length_note
     OR NEW.availability_note IS DISTINCT FROM OLD.availability_note
     OR NEW.response_time_note IS DISTINCT FROM OLD.response_time_note
     OR NEW.testimonial_quote IS DISTINCT FROM OLD.testimonial_quote
     OR NEW.testimonial_attribution IS DISTINCT FROM OLD.testimonial_attribution
     OR NEW.primary_locale IS DISTINCT FROM OLD.primary_locale THEN
    NEW.content_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS member_profile_content_updated_at ON public.member_directory_profiles;
CREATE TRIGGER member_profile_content_updated_at
BEFORE UPDATE ON public.member_directory_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_member_profile_content_updated_at();

CREATE TABLE IF NOT EXISTS public.member_profile_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('en','de','fr','it')),
  tagline text,
  description text,
  approach text,
  qualifications text,
  fees_note text,
  session_length_note text,
  availability_note text,
  response_time_note text,
  testimonial_quote text,
  testimonial_attribution text,
  manually_edited boolean NOT NULL DEFAULT false,
  is_ready boolean NOT NULL DEFAULT false,
  source_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, locale)
);

GRANT SELECT ON public.member_profile_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_profile_translations TO authenticated;
GRANT ALL ON public.member_profile_translations TO service_role;

ALTER TABLE public.member_profile_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published profile translations"
  ON public.member_profile_translations FOR SELECT TO anon USING (is_ready);

CREATE POLICY "Signed-in visitors read published profile translations"
  ON public.member_profile_translations FOR SELECT TO authenticated USING (is_ready);

CREATE POLICY "Staff can read profile translations"
  ON public.member_profile_translations FOR SELECT TO authenticated
  USING (private.is_editor(auth.uid()));

CREATE POLICY "Members manage their own profile translations"
  ON public.member_profile_translations FOR ALL TO authenticated
  USING (private.member_owns_profile(profile_id))
  WITH CHECK (private.member_owns_profile(profile_id));

CREATE TRIGGER member_profile_translations_updated_at
BEFORE UPDATE ON public.member_profile_translations
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

DROP VIEW IF EXISTS public.coach_directory_public;

CREATE VIEW public.coach_directory_public
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
    COALESCE((
      SELECT jsonb_object_agg(t.locale, jsonb_build_object(
        'tagline', t.tagline,
        'description', t.description,
        'approach', t.approach,
        'qualifications', t.qualifications,
        'fees_note', t.fees_note,
        'session_length_note', t.session_length_note,
        'availability_note', t.availability_note,
        'response_time_note', t.response_time_note,
        'testimonial_quote', t.testimonial_quote,
        'testimonial_attribution', t.testimonial_attribution
      ))
      FROM public.member_profile_translations t
      WHERE t.profile_id = p.id AND t.is_ready
    ), '{}'::jsonb) AS translations,
        CASE
            WHEN p.contact_email_public THEN m.email
            ELSE NULL::text
        END AS contact_email,
    array_remove(ARRAY[
        CASE WHEN p.coaching_available THEN 'coaching'::text ELSE NULL::text END,
        CASE WHEN p.mentoring_available THEN 'mentoring'::text ELSE NULL::text END,
        CASE WHEN p.supervision_available THEN 'supervision'::text ELSE NULL::text END], NULL::text) AS services,
    COALESCE(( SELECT array_agg(r.slug ORDER BY r.sort_order)
           FROM member_profile_regions mpr
             JOIN cf_regions r ON r.id = mpr.region_id
          WHERE mpr.profile_id = p.id), '{}'::text[]) AS region_slugs,
    COALESCE(( SELECT array_agg(l.slug ORDER BY l.sort_order)
           FROM member_profile_languages mpl
             JOIN cf_languages l ON l.id = mpl.language_id
          WHERE mpl.profile_id = p.id), '{}'::text[]) AS language_slugs,
    COALESCE(( SELECT array_agg(s.slug ORDER BY s.sort_order)
           FROM member_profile_specialisations mps
             JOIN cf_specialisations s ON s.id = mps.specialisation_id
          WHERE mps.profile_id = p.id), '{}'::text[]) AS specialisation_slugs,
    COALESCE(( SELECT array_agg(f.slug ORDER BY f.sort_order)
           FROM member_profile_formats mpf
             JOIN cf_formats f ON f.id = mpf.format_id
          WHERE mpf.profile_id = p.id), '{}'::text[]) AS format_slugs,
    COALESCE(( SELECT array_agg(ct.slug ORDER BY ct.sort_order)
           FROM member_profile_client_types mpc
             JOIN cf_client_types ct ON ct.id = mpc.client_type_id
          WHERE mpc.profile_id = p.id), '{}'::text[]) AS client_type_slugs,
    true AS is_active_member,
    true AS has_directory_credential,
    true AS is_directory_eligible,
    true AS is_directory_visible,
    p.updated_at
   FROM member_directory_profiles p
     JOIN members m ON m.id = p.member_id
  WHERE p.visibility = 'published'::member_visibility
    AND member_is_active(m.activity_state)
    AND member_has_directory_credential(m.credential_slug, m.credential_expires_on);

GRANT SELECT ON public.coach_directory_public TO anon;
GRANT SELECT ON public.coach_directory_public TO authenticated;
GRANT SELECT ON public.coach_directory_public TO service_role;
