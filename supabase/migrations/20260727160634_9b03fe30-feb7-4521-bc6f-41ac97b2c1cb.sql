-- ============================================================
-- 1. Move SECURITY DEFINER helpers out of the exposed schema
-- ============================================================
-- These functions must stay SECURITY DEFINER (they are called from RLS
-- policies on tables the caller cannot otherwise read) and `authenticated`
-- must keep EXECUTE (a policy expression is evaluated as the querying role).
-- The only safe remediation is therefore to move them out of `public`, which
-- is the schema PostgREST exposes as RPC endpoints.
--
-- ALTER FUNCTION ... SET SCHEMA preserves the function OID, and RLS policies
-- store parsed OID references rather than text, so all 23 dependent policies
-- continue to work without being touched.

CREATE SCHEMA IF NOT EXISTS private;

-- USAGE alone grants nothing without EXECUTE; anon holds no EXECUTE on these.
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.is_editor(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_staff(uuid) SET SCHEMA private;
ALTER FUNCTION public.member_owns_profile(uuid) SET SCHEMA private;
ALTER FUNCTION public.member_owns_storage_folder(text) SET SCHEMA private;

-- is_editor/is_staff call has_role by qualified name in their SQL bodies,
-- which is stored as text and re-resolved at execution, so those bodies must
-- be repointed at its new home. CREATE OR REPLACE keeps the OID.
CREATE OR REPLACE FUNCTION private.is_editor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select private.has_role(_user_id, 'admin') or private.has_role(_user_id, 'editor')
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select private.has_role(_user_id, 'admin')
      or private.has_role(_user_id, 'editor')
      or private.has_role(_user_id, 'contributor')
$$;

-- ============================================================
-- 2. coach_directory_public: enforce RLS as the querying role
-- ============================================================
-- Every base table the view reads already has an anon SELECT policy plus an
-- anon SELECT grant that mirrors the view's own WHERE clause, so switching to
-- invoker semantics does not change what anonymous visitors can see.
ALTER VIEW public.coach_directory_public SET (security_invoker = on);

-- Under invoker semantics a signed-in NON-staff visitor would fall through to
-- the staff-only authenticated policies and silently receive zero rows. The
-- directory is public, so grant signed-in visitors the same published-row
-- read access anonymous visitors already have.
CREATE POLICY "Signed-in visitors read published directory profiles"
  ON public.member_directory_profiles FOR SELECT TO authenticated
  USING (visibility = 'published'::public.member_visibility);

CREATE POLICY "Signed-in visitors read directory-listed members"
  ON public.members FOR SELECT TO authenticated
  USING (
    public.member_is_active(activity_state)
    AND public.member_has_directory_credential(credential_slug, credential_expires_on)
    AND EXISTS (
      SELECT 1 FROM public.member_directory_profiles p
      WHERE p.member_id = members.id
        AND p.visibility = 'published'::public.member_visibility
    )
  );

CREATE POLICY "Signed-in visitors read regions of published profiles"
  ON public.member_profile_regions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = member_profile_regions.profile_id
      AND p.visibility = 'published'::public.member_visibility
  ));

CREATE POLICY "Signed-in visitors read languages of published profiles"
  ON public.member_profile_languages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = member_profile_languages.profile_id
      AND p.visibility = 'published'::public.member_visibility
  ));

CREATE POLICY "Signed-in visitors read specialisations of published profiles"
  ON public.member_profile_specialisations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = member_profile_specialisations.profile_id
      AND p.visibility = 'published'::public.member_visibility
  ));

CREATE POLICY "Signed-in visitors read formats of published profiles"
  ON public.member_profile_formats FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = member_profile_formats.profile_id
      AND p.visibility = 'published'::public.member_visibility
  ));

CREATE POLICY "Signed-in visitors read client types of published profiles"
  ON public.member_profile_client_types FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = member_profile_client_types.profile_id
      AND p.visibility = 'published'::public.member_visibility
  ));

-- ============================================================
-- 3. Contributors must not touch the featured flag
-- ============================================================
-- tg_articles_single_featured is SECURITY DEFINER and clears is_featured on
-- every other row, so a contributor featuring their own draft silently
-- un-featured the editorially chosen published article. Contributors have no
-- legitimate need for the flag; no contributor draft currently sets it.
DROP POLICY "contributors insert own drafts" ON public.articles;
CREATE POLICY "contributors insert own drafts"
  ON public.articles FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND private.has_role(auth.uid(), 'contributor'::public.app_role)
    AND status = 'draft'::public.article_status
    AND is_featured = false
  );

DROP POLICY "contributors update own drafts" ON public.articles;
CREATE POLICY "contributors update own drafts"
  ON public.articles FOR UPDATE TO authenticated
  USING (
    auth.uid() = author_id
    AND private.has_role(auth.uid(), 'contributor'::public.app_role)
    AND status = 'draft'::public.article_status
  )
  WITH CHECK (
    auth.uid() = author_id
    AND private.has_role(auth.uid(), 'contributor'::public.app_role)
    AND status = 'draft'::public.article_status
    AND is_featured = false
  );

-- ============================================================
-- 4. coach_finder_config: internal tuning fields become staff-only
-- ============================================================
-- The public site needs the display settings (which modes exist, their
-- labels, sort order, page size). It does not need the operational fields.
-- Column-level grants are the right tool here: RLS decides which ROWS are
-- visible, column privileges decide which COLUMNS, and PostgREST honours both.
REVOKE SELECT ON public.coach_finder_config FROM anon, authenticated;

GRANT SELECT (
  id,
  coaching_enabled,
  mentoring_enabled,
  supervision_enabled,
  coaching_label,
  mentoring_label,
  supervision_label,
  default_sort,
  page_size
) ON public.coach_finder_config TO anon, authenticated;

-- Staff keep full read/write; the staff settings screen reads the internal
-- fields through a role-gated server function using the service role.
GRANT ALL ON public.coach_finder_config TO service_role;