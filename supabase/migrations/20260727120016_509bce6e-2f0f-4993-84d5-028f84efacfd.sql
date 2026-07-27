REVOKE ALL ON FUNCTION public.member_owns_profile(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_owns_profile(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.member_owns_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.member_owns_profile(uuid) TO service_role;