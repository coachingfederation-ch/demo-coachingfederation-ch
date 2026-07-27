-- Migration A: normalise inline user_roles subqueries onto private.is_editor().
-- Every rewritten policy previously inlined
--   EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid()
--           AND ur.role = ANY (ARRAY['admin','editor']))
-- which is exactly private.is_editor(auth.uid()). Semantic no-op.

-- article_translations -------------------------------------------------------
DROP POLICY IF EXISTS "translations author or editor read" ON public.article_translations;
CREATE POLICY "translations author or editor read" ON public.article_translations
  FOR SELECT TO authenticated
  USING (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.status = 'published')
  );

DROP POLICY IF EXISTS "translations author or editor insert" ON public.article_translations;
CREATE POLICY "translations author or editor insert" ON public.article_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "translations author or editor update" ON public.article_translations;
CREATE POLICY "translations author or editor update" ON public.article_translations
  FOR UPDATE TO authenticated
  USING (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  )
  WITH CHECK (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "translations author or editor delete" ON public.article_translations;
CREATE POLICY "translations author or editor delete" ON public.article_translations
  FOR DELETE TO authenticated
  USING (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  );

-- categories -----------------------------------------------------------------
DROP POLICY IF EXISTS "categories editors write" ON public.categories;
CREATE POLICY "categories editors write" ON public.categories
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid()))
  WITH CHECK (private.is_editor(auth.uid()));

-- coach-finder vocabularies --------------------------------------------------
DROP POLICY IF EXISTS "cf_availability_labels authenticated read" ON public.cf_availability_labels;
CREATE POLICY "cf_availability_labels authenticated read" ON public.cf_availability_labels
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_availability_labels editors write" ON public.cf_availability_labels;
CREATE POLICY "cf_availability_labels editors write" ON public.cf_availability_labels
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

DROP POLICY IF EXISTS "cf_client_types authenticated read" ON public.cf_client_types;
CREATE POLICY "cf_client_types authenticated read" ON public.cf_client_types
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_client_types editors write" ON public.cf_client_types;
CREATE POLICY "cf_client_types editors write" ON public.cf_client_types
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

DROP POLICY IF EXISTS "cf_credentials authenticated read" ON public.cf_credentials;
CREATE POLICY "cf_credentials authenticated read" ON public.cf_credentials
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_credentials editors write" ON public.cf_credentials;
CREATE POLICY "cf_credentials editors write" ON public.cf_credentials
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

DROP POLICY IF EXISTS "cf_formats authenticated read" ON public.cf_formats;
CREATE POLICY "cf_formats authenticated read" ON public.cf_formats
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_formats editors write" ON public.cf_formats;
CREATE POLICY "cf_formats editors write" ON public.cf_formats
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

DROP POLICY IF EXISTS "cf_languages authenticated read" ON public.cf_languages;
CREATE POLICY "cf_languages authenticated read" ON public.cf_languages
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_languages editors write" ON public.cf_languages;
CREATE POLICY "cf_languages editors write" ON public.cf_languages
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

DROP POLICY IF EXISTS "cf_regions authenticated read" ON public.cf_regions;
CREATE POLICY "cf_regions authenticated read" ON public.cf_regions
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_regions editors write" ON public.cf_regions;
CREATE POLICY "cf_regions editors write" ON public.cf_regions
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

DROP POLICY IF EXISTS "cf_specialisations authenticated read" ON public.cf_specialisations;
CREATE POLICY "cf_specialisations authenticated read" ON public.cf_specialisations
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
DROP POLICY IF EXISTS "cf_specialisations editors write" ON public.cf_specialisations;
CREATE POLICY "cf_specialisations editors write" ON public.cf_specialisations
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

-- coach_finder_config --------------------------------------------------------
DROP POLICY IF EXISTS "coach_finder_config editors write" ON public.coach_finder_config;
CREATE POLICY "coach_finder_config editors write" ON public.coach_finder_config
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

-- deck_download_leads --------------------------------------------------------
DROP POLICY IF EXISTS "Editors can read deck downloads" ON public.deck_download_leads;
CREATE POLICY "Editors can read deck downloads" ON public.deck_download_leads
  FOR SELECT TO authenticated USING (private.is_editor(auth.uid()));

-- member_profile_websites ----------------------------------------------------
DROP POLICY IF EXISTS "Staff manage all profile links" ON public.member_profile_websites;
CREATE POLICY "Staff manage all profile links" ON public.member_profile_websites
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

-- organisation_survey_responses ----------------------------------------------
DROP POLICY IF EXISTS "Editors and admins can read survey responses" ON public.organisation_survey_responses;
CREATE POLICY "Editors and admins can read survey responses" ON public.organisation_survey_responses
  FOR SELECT TO authenticated USING (private.is_editor(auth.uid()));

-- profiles -------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles authenticated read scoped" ON public.profiles;
CREATE POLICY "profiles authenticated read scoped" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.articles a WHERE a.author_id = profiles.id AND a.status = 'published')
  );