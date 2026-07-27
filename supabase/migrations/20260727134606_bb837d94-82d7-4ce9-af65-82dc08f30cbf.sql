ALTER TABLE public.member_profile_links
  ADD COLUMN IF NOT EXISTS token_hash text,
  ADD COLUMN IF NOT EXISTS consumed_at timestamptz,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS member_profile_links_token_hash_key
  ON public.member_profile_links (token_hash)
  WHERE token_hash IS NOT NULL;

-- At most one open (pending, unconsumed) link per member.
CREATE UNIQUE INDEX IF NOT EXISTS member_profile_links_one_open_per_member
  ON public.member_profile_links (member_id)
  WHERE status = 'pending' AND consumed_at IS NULL;

CREATE INDEX IF NOT EXISTS member_profile_links_email_requested_at_idx
  ON public.member_profile_links (email, requested_at DESC);