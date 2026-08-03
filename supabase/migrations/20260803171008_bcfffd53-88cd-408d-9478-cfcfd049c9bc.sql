INSERT INTO public.op_project_roles (project_id, slug, name, name_de, name_fr, name_it, sort_order)
SELECT p.id, 'co-lead', 'Co-lead', 'Co-Leitung', 'Co-responsable', 'Co-responsabile', 15
FROM public.op_projects p
WHERE NOT EXISTS (
  SELECT 1 FROM public.op_project_roles r WHERE r.project_id = p.id AND r.slug = 'co-lead'
);