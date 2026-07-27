-- Staff = anyone who may enter the CMS at all. Publish rights stay with is_editor.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
      OR public.has_role(_user_id, 'editor')
      OR public.has_role(_user_id, 'contributor')
$$;

GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- Articles: replace the blanket "any authenticated author" policies with
-- role-scoped ones. A contributor may only ever touch their own DRAFTS.
DROP POLICY IF EXISTS "authors read own" ON public.articles;
DROP POLICY IF EXISTS "authors insert own" ON public.articles;
DROP POLICY IF EXISTS "authors update own" ON public.articles;
DROP POLICY IF EXISTS "authors delete own" ON public.articles;

CREATE POLICY "editors manage all articles"
  ON public.articles FOR ALL TO authenticated
  USING (public.is_editor(auth.uid()))
  WITH CHECK (public.is_editor(auth.uid()));

CREATE POLICY "contributors read own articles"
  ON public.articles FOR SELECT TO authenticated
  USING (auth.uid() = author_id AND public.has_role(auth.uid(), 'contributor'));

CREATE POLICY "contributors insert own drafts"
  ON public.articles FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND public.has_role(auth.uid(), 'contributor')
    AND status = 'draft'
  );

CREATE POLICY "contributors update own drafts"
  ON public.articles FOR UPDATE TO authenticated
  USING (
    auth.uid() = author_id
    AND public.has_role(auth.uid(), 'contributor')
    AND status = 'draft'
  )
  WITH CHECK (
    auth.uid() = author_id
    AND public.has_role(auth.uid(), 'contributor')
    AND status = 'draft'
  );

CREATE POLICY "contributors delete own drafts"
  ON public.articles FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
    AND public.has_role(auth.uid(), 'contributor')
    AND status = 'draft'
  );

-- Member access follows the EXPLICIT auth_user_id linkage, never an email match.
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT m.auth_user_id, 'member'::public.app_role
FROM public.members m
WHERE m.auth_user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;