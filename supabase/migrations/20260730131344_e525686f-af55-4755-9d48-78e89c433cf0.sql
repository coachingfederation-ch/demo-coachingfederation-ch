-- 1. Operational structure tables -------------------------------------------

CREATE TABLE public.op_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_de text,
  name_fr text,
  name_it text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.op_projects TO authenticated;
GRANT ALL ON public.op_projects TO service_role;
ALTER TABLE public.op_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage projects" ON public.op_projects
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.op_project_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.op_projects(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  name_de text,
  name_fr text,
  name_it text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.op_project_roles TO authenticated;
GRANT ALL ON public.op_project_roles TO service_role;
ALTER TABLE public.op_project_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage project roles" ON public.op_project_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.op_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.op_projects(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.op_project_roles(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, project_id, role_id)
);

CREATE INDEX op_assignments_project_idx ON public.op_assignments(project_id);
CREATE INDEX op_assignments_member_idx ON public.op_assignments(member_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.op_assignments TO authenticated;
GRANT ALL ON public.op_assignments TO service_role;
ALTER TABLE public.op_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage assignments" ON public.op_assignments
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER op_projects_touch BEFORE UPDATE ON public.op_projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER op_project_roles_touch BEFORE UPDATE ON public.op_project_roles
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER op_assignments_touch BEFORE UPDATE ON public.op_assignments
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- 2. Team role description ----------------------------------------------------

ALTER TABLE public.member_directory_profiles ADD COLUMN team_bio text;
ALTER TABLE public.member_profile_translations ADD COLUMN team_bio text;

CREATE OR REPLACE FUNCTION public.tg_member_profile_content_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tagline IS DISTINCT FROM OLD.tagline
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.approach IS DISTINCT FROM OLD.approach
     OR NEW.qualifications IS DISTINCT FROM OLD.qualifications
     OR NEW.fees_note IS DISTINCT FROM OLD.fees_note
     OR NEW.session_length_note IS DISTINCT FROM OLD.session_length_note
     OR NEW.availability_note IS DISTINCT FROM OLD.availability_note
     OR NEW.response_time_note IS DISTINCT FROM OLD.response_time_note
     OR NEW.testimonial_quote IS DISTINCT FROM OLD.testimonial_quote
     OR NEW.testimonial_attribution IS DISTINCT FROM OLD.testimonial_attribution
     OR NEW.team_bio IS DISTINCT FROM OLD.team_bio
     OR NEW.primary_locale IS DISTINCT FROM OLD.primary_locale THEN
    NEW.content_updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Public team view ---------------------------------------------------------

-- Team membership, not directory publication, decides who appears. The email
-- is still opt-in only, and the coach-profile link is only offered when that
-- profile is genuinely public.
CREATE OR REPLACE FUNCTION private.team_contact_email(_profile_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT m.email
  FROM public.member_directory_profiles p
  JOIN public.members m ON m.id = p.member_id
  WHERE p.id = _profile_id
    AND p.contact_email_public
    AND EXISTS (SELECT 1 FROM public.op_assignments a WHERE a.member_id = m.id)
$$;

CREATE VIEW public.team_directory_public AS
SELECT
  p.id                     AS profile_id,
  m.id                     AS member_id,
  m.full_name,
  p.profile_image_path,
  p.team_bio,
  p.primary_locale,
  p.linkedin_url,
  private.team_contact_email(p.id) AS contact_email,
  CASE
    WHEN p.visibility = 'published'
     AND public.member_is_active(m.activity_state)
     AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on)
    THEN p.id
  END AS public_coach_profile_id,
  COALESCE((
    SELECT jsonb_object_agg(t.locale, jsonb_build_object('team_bio', t.team_bio))
    FROM public.member_profile_translations t
    WHERE t.profile_id = p.id AND t.is_ready
  ), '{}'::jsonb) AS translations,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
             'project_slug', pr.slug,
             'project_name', pr.name,
             'project_name_de', pr.name_de,
             'project_name_fr', pr.name_fr,
             'project_name_it', pr.name_it,
             'project_sort_order', pr.sort_order,
             'role_name', rl.name,
             'role_name_de', rl.name_de,
             'role_name_fr', rl.name_fr,
             'role_name_it', rl.name_it,
             'sort_order', a.sort_order
           ) ORDER BY a.sort_order, pr.sort_order)
    FROM public.op_assignments a
    JOIN public.op_projects pr ON pr.id = a.project_id AND pr.is_active
    JOIN public.op_project_roles rl ON rl.id = a.role_id
    WHERE a.member_id = m.id
  ), '[]'::jsonb) AS assignments,
  COALESCE((
    SELECT min(a.sort_order)
    FROM public.op_assignments a
    JOIN public.op_projects pr ON pr.id = a.project_id AND pr.is_active
    WHERE a.member_id = m.id
  ), 0) AS primary_sort_order
FROM public.member_directory_profiles p
JOIN public.members m ON m.id = p.member_id
WHERE public.member_is_active(m.activity_state)
  AND EXISTS (
    SELECT 1 FROM public.op_assignments a
    JOIN public.op_projects pr ON pr.id = a.project_id AND pr.is_active
    WHERE a.member_id = m.id
  );

GRANT SELECT ON public.team_directory_public TO anon, authenticated;

-- Active projects are the public filter pills; expose them read-only.
CREATE VIEW public.team_projects_public AS
SELECT id, slug, name, name_de, name_fr, name_it, sort_order
FROM public.op_projects
WHERE is_active;

GRANT SELECT ON public.team_projects_public TO anon, authenticated;

-- 4. Seed the default project list --------------------------------------------

INSERT INTO public.op_projects (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('board', 'Board', 'Vorstand', 'Comité', 'Comitato', 10),
  ('events', 'Events', 'Veranstaltungen', 'Événements', 'Eventi', 20),
  ('communication-marketing', 'Communication & Marketing', 'Kommunikation & Marketing', 'Communication & marketing', 'Comunicazione e marketing', 30),
  ('deib', 'DEIB', 'DEIB', 'DEIB', 'DEIB', 40),
  ('membership', 'Membership', 'Mitgliedschaft', 'Adhésion', 'Adesione', 50),
  ('credentialing', 'Credentialing', 'Akkreditierung', 'Accréditation', 'Accreditamento', 60),
  ('mentor-coaching', 'Mentor coaching', 'Mentor-Coaching', 'Mentorat de coaching', 'Mentor coaching', 70),
  ('coaching-science', 'Coaching science', 'Coaching-Forschung', 'Recherche en coaching', 'Ricerca sul coaching', 80),
  ('coaching-in-organisations', 'Coaching in organisations', 'Coaching in Organisationen', 'Coaching en organisation', 'Coaching nelle organizzazioni', 90),
  ('ethics', 'Ethics', 'Ethik', 'Éthique', 'Etica', 100),
  ('partnerships', 'Partnerships & sponsoring', 'Partnerschaften & Sponsoring', 'Partenariats & sponsoring', 'Partnership e sponsorizzazioni', 110),
  ('volunteering', 'Volunteering', 'Freiwilligenarbeit', 'Bénévolat', 'Volontariato', 120),
  ('finance', 'Finance', 'Finanzen', 'Finances', 'Finanze', 130),
  ('it-website', 'IT & website', 'IT & Website', 'IT & site web', 'IT e sito web', 140),
  ('community-zurich', 'Community Zürich', 'Community Zürich', 'Communauté Zurich', 'Comunità Zurigo', 150),
  ('community-basel', 'Community Basel', 'Community Basel', 'Communauté Bâle', 'Comunità Basilea', 160),
  ('community-bern', 'Community Bern', 'Community Bern', 'Communauté Berne', 'Comunità Berna', 170),
  ('community-central', 'Community Central Switzerland', 'Community Zentralschweiz', 'Communauté Suisse centrale', 'Comunità Svizzera centrale', 180),
  ('community-eastern', 'Community Eastern Switzerland', 'Community Ostschweiz', 'Communauté Suisse orientale', 'Comunità Svizzera orientale', 190),
  ('community-romandie', 'Community Romandie', 'Community Romandie', 'Communauté Romandie', 'Comunità Romandia', 200),
  ('community-ticino', 'Community Ticino', 'Community Tessin', 'Communauté Tessin', 'Comunità Ticino', 210),
  ('next-generation', 'Next generation', 'Nächste Generation', 'Nouvelle génération', 'Nuova generazione', 220);

INSERT INTO public.op_project_roles (project_id, slug, name, name_de, name_fr, name_it, sort_order)
SELECT p.id, 'lead', 'Lead', 'Leitung', 'Responsable', 'Responsabile', 10 FROM public.op_projects p;

INSERT INTO public.op_project_roles (project_id, slug, name, name_de, name_fr, name_it, sort_order)
SELECT p.id, 'team-member', 'Team member', 'Teammitglied', 'Membre de l''équipe', 'Membro del team', 20 FROM public.op_projects p;

INSERT INTO public.op_project_roles (project_id, slug, name, name_de, name_fr, name_it, sort_order)
SELECT p.id, 'board-member', 'Board member', 'Vorstandsmitglied', 'Membre du comité', 'Membro del comitato', 5
FROM public.op_projects p WHERE p.slug = 'board';