ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS series_id uuid,
  ADD COLUMN IF NOT EXISTS recurrence jsonb;

CREATE INDEX IF NOT EXISTS events_series_id_idx ON public.events (series_id) WHERE series_id IS NOT NULL;