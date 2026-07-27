-- The audit trigger function must not be reachable as a PostgREST RPC endpoint.
-- Triggers run as the table owner and do not consult EXECUTE grants.
REVOKE ALL ON FUNCTION public.tg_user_roles_audit() FROM PUBLIC, anon, authenticated;