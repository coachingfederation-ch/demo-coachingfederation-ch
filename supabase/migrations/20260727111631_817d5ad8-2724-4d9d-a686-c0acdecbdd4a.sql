DROP POLICY IF EXISTS "Public can read published directory profiles" ON public.member_directory_profiles;

REVOKE EXECUTE ON FUNCTION public.member_is_directory_eligible(uuid) FROM anon;

CREATE POLICY "Public can read published directory profiles"
  ON public.member_directory_profiles FOR SELECT TO anon
  USING (visibility = 'published');
-- migration end</query>
