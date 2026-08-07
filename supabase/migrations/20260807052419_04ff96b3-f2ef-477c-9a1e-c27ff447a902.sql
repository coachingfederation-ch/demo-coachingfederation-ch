ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.op_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS events_community_id_idx ON public.events(community_id);