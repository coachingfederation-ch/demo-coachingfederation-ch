ALTER TABLE public.europe_pulse_raw ADD COLUMN IF NOT EXISTS failure_kind text;
ALTER TABLE public.europe_pulse_chapters ADD COLUMN IF NOT EXISTS consecutive_failures integer NOT NULL DEFAULT 0;