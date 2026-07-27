-- 1. New roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'contributor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member';

-- 2. Restore EXECUTE on the role-check helpers.
-- An earlier hardening pass revoked these from `authenticated`, but the RLS
-- policies on members / member_directory_profiles call is_editor(auth.uid()),
-- and policy expressions run as the querying role -> every signed-in read of
-- those tables failed with "permission denied for function is_editor".
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_editor(uuid) TO authenticated;