CREATE OR REPLACE FUNCTION public.member_owns_storage_folder(_folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.auth_user_id = auth.uid()
      AND m.id::text = _folder
  )
$$;
REVOKE ALL ON FUNCTION public.member_owns_storage_folder(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_owns_storage_folder(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.member_owns_storage_folder(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.member_owns_storage_folder(text) TO service_role;

CREATE POLICY "Members manage their own profile image"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'member-profile-images'
    AND public.member_owns_storage_folder((storage.foldername(name))[1])
  )
  WITH CHECK (
    bucket_id = 'member-profile-images'
    AND public.member_owns_storage_folder((storage.foldername(name))[1])
  );

CREATE POLICY "Staff manage member profile images"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'member-profile-images'
    AND EXISTS (SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  )
  WITH CHECK (
    bucket_id = 'member-profile-images'
    AND EXISTS (SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );