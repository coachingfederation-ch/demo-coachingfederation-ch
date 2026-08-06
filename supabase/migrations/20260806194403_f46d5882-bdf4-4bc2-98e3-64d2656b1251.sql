-- 1. Derived, publicly safe contact address: communities expose their chapter
--    mailbox, internal projects expose nothing.
ALTER TABLE public.op_projects
  ADD COLUMN IF NOT EXISTS public_contact_email text
  GENERATED ALWAYS AS (CASE WHEN is_community THEN contact_email ELSE NULL END) STORED;

-- 2. Column-scoped reads for visitors: never the raw contact_email.
REVOKE SELECT ON public.op_projects FROM authenticated;
REVOKE SELECT ON public.op_projects FROM anon;

GRANT SELECT (
  id, slug, name, name_de, name_fr, name_it, sort_order, is_active,
  is_community, is_featured_community,
  description, description_de, description_fr, description_it,
  cadence_note, cadence_note_de, cadence_note_fr, cadence_note_it,
  public_contact_email, signup_url, language_slugs,
  created_at, updated_at, content_updated_at
) ON public.op_projects TO anon, authenticated;

-- 3. Read policy for visitors, limited to active projects.
DROP POLICY IF EXISTS "Visitors read active projects" ON public.op_projects;
CREATE POLICY "Visitors read active projects"
  ON public.op_projects
  FOR SELECT
  TO anon, authenticated
  USING (is_active);

-- 4. Rebuild the public view as a security invoker view.
DROP VIEW IF EXISTS public.team_projects_public;
CREATE VIEW public.team_projects_public
WITH (security_invoker = on) AS
  SELECT id, slug, name, name_de, name_fr, name_it, sort_order,
         is_community, is_featured_community,
         description, description_de, description_fr, description_it,
         cadence_note, cadence_note_de, cadence_note_fr, cadence_note_it,
         public_contact_email AS contact_email,
         signup_url, language_slugs
    FROM public.op_projects
   WHERE is_active;

GRANT SELECT ON public.team_projects_public TO anon, authenticated;
GRANT ALL ON public.team_projects_public TO service_role;

-- 5. Belt and braces for the member directory: emails and phone numbers are
--    never readable by anonymous or signed-in visitors.
REVOKE SELECT (email, phone) ON public.members FROM anon, authenticated;