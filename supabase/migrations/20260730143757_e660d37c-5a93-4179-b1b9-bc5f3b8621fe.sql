-- The public team page must show board/volunteer members regardless of their
-- coach-directory publish state, but the base-table policies used to grant that
-- exposed full member PII and draft content. Move the exception into the
-- projection boundary instead: the view runs as its owner and exposes only
-- safe columns, so the permissive base-table policies can go away entirely.
DROP POLICY IF EXISTS "Public can read team members" ON public.members;
DROP POLICY IF EXISTS "Public can read team member profiles" ON public.member_directory_profiles;
DROP POLICY IF EXISTS "Public can read team member translations" ON public.member_profile_translations;

ALTER VIEW public.team_directory_public SET (security_invoker = off);
GRANT SELECT ON public.team_directory_public TO anon, authenticated;