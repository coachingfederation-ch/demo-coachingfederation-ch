-- Defence in depth: table privileges were ALL for anon/authenticated, relying
-- solely on RLS. Narrow them to exactly what the policies allow so any future
-- accidental policy addition cannot expose contact PII.

REVOKE ALL ON public.deck_download_leads FROM anon, authenticated;
GRANT INSERT ON public.deck_download_leads TO anon;
GRANT INSERT, SELECT ON public.deck_download_leads TO authenticated;
GRANT ALL ON public.deck_download_leads TO service_role;

REVOKE ALL ON public.organisation_survey_responses FROM anon, authenticated;
GRANT INSERT ON public.organisation_survey_responses TO anon;
GRANT INSERT, SELECT ON public.organisation_survey_responses TO authenticated;
GRANT ALL ON public.organisation_survey_responses TO service_role;

REVOKE ALL ON public.event_registrations FROM anon, authenticated;
GRANT INSERT ON public.event_registrations TO anon;
GRANT INSERT, SELECT, UPDATE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;