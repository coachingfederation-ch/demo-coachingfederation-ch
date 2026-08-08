-- The public-read policies on these tables are row-scoped only; column safety is
-- carried by column-level grants. Remove every privilege that no policy needs, so
-- a future grant mistake has a much smaller blast radius.

-- members: read-only for the public/directory audience, никогда written via the Data API.
REVOKE ALL ON public.members FROM anon, authenticated;
GRANT SELECT (
  id, first_name, last_name, full_name, city, country, organisation,
  credential_slug, credential_awarded_on, credential_expires_on, activity_state
) ON public.members TO anon, authenticated;
GRANT ALL ON public.members TO service_role;

-- op_projects: anon reads safe columns; admins (policy-gated) still manage rows.
REVOKE ALL ON public.op_projects FROM anon, authenticated;
GRANT SELECT (
  id, slug, name, name_de, name_fr, name_it, sort_order, is_active,
  is_community, is_featured_community, description, description_de,
  description_fr, description_it, cadence_note, cadence_note_de,
  cadence_note_fr, cadence_note_it, public_contact_email, signup_url,
  language_slugs, content_updated_at, created_at, updated_at
) ON public.op_projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.op_projects TO authenticated;
GRANT ALL ON public.op_projects TO service_role;

-- user_roles: no anon surface at all; signed-in users read, admins grant/revoke.
REVOKE ALL ON public.user_roles FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;