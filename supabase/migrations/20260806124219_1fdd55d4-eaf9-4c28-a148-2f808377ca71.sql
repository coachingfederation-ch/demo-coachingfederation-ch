DROP POLICY "public read event hosts" ON public.event_hosts;

CREATE POLICY "public read event hosts"
ON public.event_hosts
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_hosts.event_id
      AND e.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM public.member_directory_profiles p
    WHERE p.id = event_hosts.profile_id
      AND p.visibility = 'published'
  )
);