CREATE POLICY "Article images are publicly readable"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "Authors can upload images for their own articles"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'article-images'
    AND EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.author_id = auth.uid()
        AND a.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Authors can update images for their own articles"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'article-images'
    AND EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.author_id = auth.uid()
        AND a.id::text = (storage.foldername(name))[1]
    )
  )
  WITH CHECK (
    bucket_id = 'article-images'
    AND EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.author_id = auth.uid()
        AND a.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Authors can delete images for their own articles"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'article-images'
    AND EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.author_id = auth.uid()
        AND a.id::text = (storage.foldername(name))[1]
    )
  );