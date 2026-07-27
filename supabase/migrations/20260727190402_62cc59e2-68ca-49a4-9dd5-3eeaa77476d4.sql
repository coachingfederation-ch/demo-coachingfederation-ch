-- Internal config store for server-only values. Deliberately in the `private`
-- schema with no grants, so it is unreachable through PostgREST by anon,
-- authenticated or any app role.
CREATE TABLE IF NOT EXISTS private.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON private.app_config FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

-- Token is generated inside the database so the literal never lands in the
-- repository. The matching value is stored as the MEMBER_SYNC_CRON_TOKEN
-- server env var.
INSERT INTO private.app_config (key, value)
VALUES ('member_sync_cron_token', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (key) DO NOTHING;

-- Re-point the nightly job at the dedicated token header. The previous
-- configuration authenticated with the publishable key, which is shipped to
-- every browser and therefore protected nothing.
SELECT cron.unschedule('icf-member-sync-daily');

SELECT cron.schedule(
  'icf-member-sync-daily',
  '15 3 * * *',
  $job$
  select net.http_post(
    url := 'https://project--9b53a55c-a944-4840-b29d-ad56f7d750f4-dev.lovable.app/api/public/member-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (select value from private.app_config where key = 'member_sync_cron_token')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $job$
);