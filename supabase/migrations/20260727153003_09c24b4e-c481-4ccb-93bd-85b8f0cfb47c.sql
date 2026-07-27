ALTER TABLE public.member_directory_profiles
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS contact_email_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS response_time_note text,
  ADD COLUMN IF NOT EXISTS approach text,
  ADD COLUMN IF NOT EXISTS qualifications text,
  ADD COLUMN IF NOT EXISTS experience_band text,
  ADD COLUMN IF NOT EXISTS session_length_note text,
  ADD COLUMN IF NOT EXISTS fees_note text,
  ADD COLUMN IF NOT EXISTS availability_note text,
  ADD COLUMN IF NOT EXISTS testimonial_quote text,
  ADD COLUMN IF NOT EXISTS testimonial_attribution text;

CREATE TABLE IF NOT EXISTS public.cf_client_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_de text,
  name_fr text,
  name_it text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cf_client_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_client_types TO authenticated;
GRANT ALL ON public.cf_client_types TO service_role;

ALTER TABLE public.cf_client_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cf_client_types anon read active" ON public.cf_client_types
  FOR SELECT TO anon USING (is_active);

CREATE POLICY "cf_client_types authenticated read" ON public.cf_client_types
  FOR SELECT TO authenticated
  USING (is_active OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = ANY (ARRAY['admin'::app_role, 'editor'::app_role])
  ));

CREATE POLICY "cf_client_types editors write" ON public.cf_client_types
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = ANY (ARRAY['admin'::app_role, 'editor'::app_role])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = ANY (ARRAY['admin'::app_role, 'editor'::app_role])
  ));

CREATE TRIGGER cf_client_types_touch_updated_at
  BEFORE UPDATE ON public.cf_client_types
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE IF NOT EXISTS public.member_profile_client_types (
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  client_type_id uuid NOT NULL REFERENCES public.cf_client_types(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, client_type_id)
);

GRANT SELECT ON public.member_profile_client_types TO anon;
GRANT SELECT ON public.member_profile_client_types TO authenticated;
GRANT ALL ON public.member_profile_client_types TO service_role;

ALTER TABLE public.member_profile_client_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read client types of published profiles"
  ON public.member_profile_client_types
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = member_profile_client_types.profile_id
      AND p.visibility = 'published'::member_visibility
  ));

CREATE POLICY "Staff can read profile client types"
  ON public.member_profile_client_types
  FOR SELECT TO authenticated
  USING (public.is_editor(auth.uid()));

INSERT INTO public.cf_client_types (slug, name, name_de, name_fr, name_it, sort_order)
VALUES
  ('organisational', 'Organisational', 'Organisational', 'Organisationnel', 'Organizzativo', 1),
  ('personal', 'Personal', 'Persönlich', 'Personnel', 'Personale', 2),
  ('team', 'Team', 'Team', 'Équipe', 'Team', 3)
ON CONFLICT (slug) DO NOTHING;

DROP VIEW IF EXISTS public.coach_directory_public;

CREATE VIEW public.coach_directory_public AS
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
    CASE WHEN p.contact_email_public THEN m.email ELSE NULL END AS contact_email,
    array_remove(ARRAY[
        CASE WHEN p.coaching_available THEN 'coaching'::text ELSE NULL::text END,
        CASE WHEN p.mentoring_available THEN 'mentoring'::text ELSE NULL::text END,
        CASE WHEN p.supervision_available THEN 'supervision'::text ELSE NULL::text END], NULL::text) AS services,
    COALESCE(( SELECT array_agg(r.slug ORDER BY r.sort_order)
           FROM public.member_profile_regions mpr
             JOIN public.cf_regions r ON r.id = mpr.region_id
          WHERE mpr.profile_id = p.id), '{}'::text[]) AS region_slugs,
    COALESCE(( SELECT array_agg(l.slug ORDER BY l.sort_order)
           FROM public.member_profile_languages mpl
             JOIN public.cf_languages l ON l.id = mpl.language_id
          WHERE mpl.profile_id = p.id), '{}'::text[]) AS language_slugs,
    COALESCE(( SELECT array_agg(s.slug ORDER BY s.sort_order)
           FROM public.member_profile_specialisations mps
             JOIN public.cf_specialisations s ON s.id = mps.specialisation_id
          WHERE mps.profile_id = p.id), '{}'::text[]) AS specialisation_slugs,
    COALESCE(( SELECT array_agg(f.slug ORDER BY f.sort_order)
           FROM public.member_profile_formats mpf
             JOIN public.cf_formats f ON f.id = mpf.format_id
          WHERE mpf.profile_id = p.id), '{}'::text[]) AS format_slugs,
    COALESCE(( SELECT array_agg(ct.slug ORDER BY ct.sort_order)
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
  WHERE p.visibility = 'published'::member_visibility
    AND public.member_is_active(m.activity_state)
    AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on);

GRANT SELECT ON public.coach_directory_public TO anon;
GRANT SELECT ON public.coach_directory_public TO authenticated;
GRANT ALL ON public.coach_directory_public TO service_role;