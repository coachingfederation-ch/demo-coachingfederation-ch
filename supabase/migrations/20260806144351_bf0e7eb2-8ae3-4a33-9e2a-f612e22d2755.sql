-- 1) The public surface is the curated view, not the table. Recreate it so a
--    contact address is only published for local communities (where it is a
--    chapter mailbox printed on the community page); internal project
--    mailboxes are masked.
DROP VIEW IF EXISTS public.team_projects_public;

CREATE VIEW public.team_projects_public
WITH (security_invoker = off) AS
SELECT
  id, slug, name, name_de, name_fr, name_it, sort_order,
  is_community, is_featured_community,
  description, description_de, description_fr, description_it,
  cadence_note, cadence_note_de, cadence_note_fr, cadence_note_it,
  CASE WHEN is_community THEN contact_email ELSE NULL END AS contact_email,
  signup_url, language_slugs
FROM public.op_projects
WHERE is_active;

GRANT SELECT ON public.team_projects_public TO anon, authenticated;
GRANT ALL ON public.team_projects_public TO service_role;

-- 2) Close direct Data API access to the base table. Public pages read the
--    view; the CMS is admin-only and keeps its policy.
DROP POLICY IF EXISTS "Public can read active projects" ON public.op_projects;
REVOKE ALL ON public.op_projects FROM anon;
