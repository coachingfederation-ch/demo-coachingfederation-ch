REVOKE ALL ON FUNCTION public.tg_event_registration_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_events_publish_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_events_touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.event_is_managed_by(uuid, uuid) FROM anon;