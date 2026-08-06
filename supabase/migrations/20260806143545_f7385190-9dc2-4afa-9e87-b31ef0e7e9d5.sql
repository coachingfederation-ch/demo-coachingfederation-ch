ALTER TABLE public.member_import_snapshots
  ADD COLUMN IF NOT EXISTS change_kind text NOT NULL DEFAULT 'updated';

CREATE INDEX IF NOT EXISTS member_import_snapshots_run_idx
  ON public.member_import_snapshots (sync_run_id, change_kind);

CREATE INDEX IF NOT EXISTS member_sync_events_run_idx
  ON public.member_sync_events (sync_run_id, created_at DESC);