GRANT SELECT ON public.articles TO anon;

CREATE POLICY "public read published articles"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');