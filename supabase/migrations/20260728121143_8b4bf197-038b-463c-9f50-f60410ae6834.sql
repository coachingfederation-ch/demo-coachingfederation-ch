-- Widen the admin-managed grant policies from `editor` only to the set of
-- application-managed staff grants. `admin` stays migration-only.
DROP POLICY IF EXISTS "admins grant editor" ON public.user_roles;
DROP POLICY IF EXISTS "admins revoke editor" ON public.user_roles;

CREATE POLICY "admins grant managed roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    private.has_role(auth.uid(), 'admin')
    AND role IN ('editor', 'organizer')
    AND private.has_role(user_id, 'member')
  );

CREATE POLICY "admins revoke managed roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin')
    AND role IN ('editor', 'organizer')
  );