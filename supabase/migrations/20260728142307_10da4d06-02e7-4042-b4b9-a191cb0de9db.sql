CREATE TABLE public.event_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('en','de','fr','it')),
  title text NOT NULL,
  summary text,
  description text,
  manually_edited boolean NOT NULL DEFAULT false,
  source_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, locale)
);

CREATE INDEX event_translations_event_id_idx ON public.event_translations(event_id);

GRANT SELECT ON public.event_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_translations TO authenticated;
GRANT ALL ON public.event_translations TO service_role;

ALTER TABLE public.event_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event translations public read published"
  ON public.event_translations FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.events e
                 WHERE e.id = event_translations.event_id
                   AND e.status = 'published'));

CREATE POLICY "event translations manager read"
  ON public.event_translations FOR SELECT TO authenticated
  USING (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_translations.event_id
                 AND e.organizer_id = auth.uid()
                 AND private.has_role(auth.uid(), 'organizer'::app_role))
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_translations.event_id
                 AND e.status = 'published')
  );

CREATE POLICY "event translations manager insert"
  ON public.event_translations FOR INSERT TO authenticated
  WITH CHECK (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_translations.event_id
                 AND e.organizer_id = auth.uid()
                 AND private.has_role(auth.uid(), 'organizer'::app_role))
  );

CREATE POLICY "event translations manager update"
  ON public.event_translations FOR UPDATE TO authenticated
  USING (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_translations.event_id
                 AND e.organizer_id = auth.uid()
                 AND private.has_role(auth.uid(), 'organizer'::app_role))
  )
  WITH CHECK (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_translations.event_id
                 AND e.organizer_id = auth.uid()
                 AND private.has_role(auth.uid(), 'organizer'::app_role))
  );

CREATE POLICY "event translations manager delete"
  ON public.event_translations FOR DELETE TO authenticated
  USING (
    private.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_translations.event_id
                 AND e.organizer_id = auth.uid()
                 AND private.has_role(auth.uid(), 'organizer'::app_role))
  );

CREATE TRIGGER event_translations_touch_updated_at
  BEFORE UPDATE ON public.event_translations
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();