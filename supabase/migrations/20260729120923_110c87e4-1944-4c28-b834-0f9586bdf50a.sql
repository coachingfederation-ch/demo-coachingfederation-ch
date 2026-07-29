DROP POLICY IF EXISTS "contributors read own articles" ON public.articles;
DROP POLICY IF EXISTS "contributors insert own drafts" ON public.articles;
DROP POLICY IF EXISTS "contributors update own drafts" ON public.articles;
DROP POLICY IF EXISTS "contributors delete own drafts" ON public.articles;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select private.has_role(_user_id, 'admin')
      or private.has_role(_user_id, 'editor')
      or private.has_role(_user_id, 'organizer')
$$;