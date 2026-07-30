ALTER VIEW public.team_directory_public SET (security_invoker = on);
ALTER VIEW public.team_projects_public SET (security_invoker = on);

GRANT SELECT ON public.op_projects TO anon;
GRANT SELECT ON public.op_project_roles TO anon;
GRANT SELECT ON public.op_assignments TO anon;

CREATE POLICY "Public can read active projects" ON public.op_projects
  FOR SELECT TO anon, authenticated USING (is_active);

CREATE POLICY "Public can read project roles" ON public.op_project_roles
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.op_projects p WHERE p.id = project_id AND p.is_active));

CREATE POLICY "Public can read assignments" ON public.op_assignments
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.op_projects p WHERE p.id = project_id AND p.is_active));

-- Team members appear on the public team page whether or not their coach
-- profile is published, so the row itself must be readable.
CREATE POLICY "Public can read team member profiles" ON public.member_directory_profiles
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.op_assignments a WHERE a.member_id = member_directory_profiles.member_id));

CREATE POLICY "Public can read team member translations" ON public.member_profile_translations
  FOR SELECT TO anon, authenticated
  USING (
    is_ready AND EXISTS (
      SELECT 1 FROM public.member_directory_profiles p
      JOIN public.op_assignments a ON a.member_id = p.member_id
      WHERE p.id = member_profile_translations.profile_id
    )
  );