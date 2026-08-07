CREATE POLICY "governance documents editors manage"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'governance-documents' AND private.is_editor(auth.uid()))
  WITH CHECK (bucket_id = 'governance-documents' AND private.is_editor(auth.uid()));
