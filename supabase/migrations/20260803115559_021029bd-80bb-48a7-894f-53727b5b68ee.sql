CREATE TABLE public.op_project_regions (
  project_id uuid NOT NULL REFERENCES public.op_projects(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES public.cf_regions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, region_id)
);

GRANT SELECT ON public.op_project_regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.op_project_regions TO authenticated;
GRANT ALL ON public.op_project_regions TO service_role;

ALTER TABLE public.op_project_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read project regions"
  ON public.op_project_regions FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.op_projects p WHERE p.id = project_id AND p.is_active));

CREATE POLICY "Admins manage project regions"
  ON public.op_project_regions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX op_project_regions_region_idx ON public.op_project_regions(region_id);

INSERT INTO public.op_project_regions (project_id, region_id)
SELECT p.id, r.id
FROM public.op_projects p
JOIN (VALUES
  ('community-zurich', 'zurich'),
  ('community-bern', 'bern'),
  ('community-basel', 'basel'),
  ('community-central', 'central'),
  ('community-eastern', 'eastern'),
  ('community-ticino', 'ticino'),
  ('community-romandie', 'romandie-vaud'),
  ('community-romandie', 'romandie-geneva'),
  ('community-romandie', 'romandie-other')
) AS m(project_slug, region_slug) ON m.project_slug = p.slug
JOIN public.cf_regions r ON r.slug = m.region_slug
ON CONFLICT DO NOTHING;