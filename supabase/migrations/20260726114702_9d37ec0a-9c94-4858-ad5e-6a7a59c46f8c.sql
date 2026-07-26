revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_editor(uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_editor(uuid) to authenticated, service_role;