-- Public reads of the operational structure are intentional (the /team and
-- /communities pages are public), but they should never expose retired roles
-- or assignments hanging off them.

DROP POLICY IF EXISTS "Public can read project roles" ON public.op_project_roles;
CREATE POLICY "Public can read project roles"
  ON public.op_project_roles
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active
    AND EXISTS (
      SELECT 1 FROM public.op_projects p
      WHERE p.id = op_project_roles.project_id AND p.is_active
    )
  );

DROP POLICY IF EXISTS "Public can read assignments" ON public.op_assignments;
CREATE POLICY "Public can read assignments"
  ON public.op_assignments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.op_projects p
      WHERE p.id = op_assignments.project_id AND p.is_active
    )
    AND EXISTS (
      SELECT 1 FROM public.op_project_roles r
      WHERE r.id = op_assignments.role_id AND r.is_active
    )
  );