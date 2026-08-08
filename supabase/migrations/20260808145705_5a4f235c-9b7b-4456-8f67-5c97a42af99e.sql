-- Defensive re-assertion of column-scoped public read access.
REVOKE SELECT ON public.members FROM anon, authenticated;
GRANT SELECT (
  id, first_name, last_name, full_name, city, country, organisation,
  credential_slug, credential_awarded_on, credential_expires_on, activity_state
) ON public.members TO anon, authenticated;

REVOKE SELECT ON public.op_projects FROM anon, authenticated;
GRANT SELECT (
  id, slug, name, name_de, name_fr, name_it, description, description_de,
  description_fr, description_it, cadence_note, cadence_note_de, cadence_note_fr,
  cadence_note_it, public_contact_email, signup_url, language_slugs, is_active,
  is_community, is_featured_community, sort_order, created_at, updated_at,
  content_updated_at
) ON public.op_projects TO anon, authenticated;

-- Event registrations: anon may only insert; authenticated reads are row-scoped by RLS
-- to their own registration or events they manage.
REVOKE SELECT ON public.event_registrations FROM anon;
