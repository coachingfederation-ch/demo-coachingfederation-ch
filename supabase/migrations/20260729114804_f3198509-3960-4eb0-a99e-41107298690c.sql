CREATE POLICY "admins read all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));