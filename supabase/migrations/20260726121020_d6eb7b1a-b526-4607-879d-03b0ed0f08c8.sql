-- 1. Profiles: restrict authenticated read
DROP POLICY IF EXISTS "profiles authenticated read" ON public.profiles;

CREATE POLICY "profiles authenticated read scoped"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.is_editor(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.author_id = profiles.id
      AND a.status = 'published'
  )
);

-- 2. Storage: article images only public when the article is published
DROP POLICY IF EXISTS "Article images are publicly readable" ON storage.objects;

CREATE POLICY "Article images readable when published"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'article-images'
  AND EXISTS (
    SELECT 1 FROM public.articles a
    WHERE (a.id)::text = (storage.foldername(objects.name))[1]
      AND a.status = 'published'
  )
);

CREATE POLICY "Authors and editors can read their article images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'article-images'
  AND EXISTS (
    SELECT 1 FROM public.articles a
    WHERE (a.id)::text = (storage.foldername(objects.name))[1]
      AND (a.author_id = auth.uid() OR public.is_editor(auth.uid()))
  )
);

-- 3. Revoke direct EXECUTE on security definer role helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.is_editor(uuid) FROM authenticated, anon, public;