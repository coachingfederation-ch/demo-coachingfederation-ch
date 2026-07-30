CREATE POLICY "Public can read team members" ON public.members
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.op_assignments a
    JOIN public.op_projects p ON p.id = a.project_id AND p.is_active
    WHERE a.member_id = members.id
  ));