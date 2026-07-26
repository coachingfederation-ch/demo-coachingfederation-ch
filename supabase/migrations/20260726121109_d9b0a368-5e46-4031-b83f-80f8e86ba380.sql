-- user_roles: admin management
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- categories
DROP POLICY IF EXISTS "categories editors write" ON public.categories;
CREATE POLICY "categories editors write" ON public.categories
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')));

-- article_translations
DROP POLICY IF EXISTS "translations author or editor read" ON public.article_translations;
CREATE POLICY "translations author or editor read" ON public.article_translations
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_translations.article_id AND a.author_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_translations.article_id AND a.status = 'published')
);

DROP POLICY IF EXISTS "translations author or editor insert" ON public.article_translations;
CREATE POLICY "translations author or editor insert" ON public.article_translations
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_translations.article_id AND a.author_id = auth.uid())
);

DROP POLICY IF EXISTS "translations author or editor update" ON public.article_translations;
CREATE POLICY "translations author or editor update" ON public.article_translations
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_translations.article_id AND a.author_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_translations.article_id AND a.author_id = auth.uid())
);

DROP POLICY IF EXISTS "translations author or editor delete" ON public.article_translations;
CREATE POLICY "translations author or editor delete" ON public.article_translations
FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_translations.article_id AND a.author_id = auth.uid())
);

-- profiles
DROP POLICY IF EXISTS "profiles authenticated read scoped" ON public.profiles;
CREATE POLICY "profiles authenticated read scoped" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  OR EXISTS (SELECT 1 FROM public.articles a WHERE a.author_id = profiles.id AND a.status = 'published')
);

-- storage objects
DROP POLICY IF EXISTS "Authors and editors can read their article images" ON storage.objects;
CREATE POLICY "Authors and editors can read their article images" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'article-images'
  AND (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
    OR EXISTS (SELECT 1 FROM public.articles a WHERE (a.id)::text = (storage.foldername(objects.name))[1] AND a.author_id = auth.uid())
  )
);