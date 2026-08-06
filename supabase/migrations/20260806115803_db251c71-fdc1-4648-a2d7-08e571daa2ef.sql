CREATE TABLE public.event_hosts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, profile_id)
);

CREATE INDEX event_hosts_event_idx ON public.event_hosts(event_id, sort_order);

GRANT SELECT ON public.event_hosts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_hosts TO authenticated;
GRANT ALL ON public.event_hosts TO service_role;

ALTER TABLE public.event_hosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read event hosts" ON public.event_hosts
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "editors manage event hosts" ON public.event_hosts
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid()))
  WITH CHECK (private.is_editor(auth.uid()));

CREATE POLICY "organizers manage hosts of own events" ON public.event_hosts
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_hosts.event_id
      AND e.organizer_id = auth.uid()
      AND private.has_role(auth.uid(), 'organizer'::app_role)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_hosts.event_id
      AND e.organizer_id = auth.uid()
      AND private.has_role(auth.uid(), 'organizer'::app_role)
  ));