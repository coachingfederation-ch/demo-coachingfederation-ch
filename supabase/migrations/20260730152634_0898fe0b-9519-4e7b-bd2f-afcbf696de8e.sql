-- 1. Restrict which member columns anon/authenticated can read at all.
REVOKE SELECT ON public.members FROM anon, authenticated;
GRANT SELECT (
  id, full_name, first_name, last_name, city, country, organisation,
  credential_slug, credential_awarded_on, credential_expires_on, activity_state
) ON public.members TO anon, authenticated;

-- 2. Replace the SECURITY DEFINER team view with an invoker view over a
--    security-definer function, so no extra table exposure is required.
DROP VIEW IF EXISTS public.team_directory_public;

CREATE OR REPLACE FUNCTION private.team_directory_rows()
RETURNS TABLE (
  profile_id uuid,
  member_id uuid,
  full_name text,
  profile_image_path text,
  team_bio text,
  primary_locale text,
  linkedin_url text,
  contact_email text,
  public_coach_profile_id uuid,
  translations jsonb,
  assignments jsonb,
  primary_sort_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT p.id AS profile_id,
         m.id AS member_id,
         m.full_name,
         p.profile_image_path,
         p.team_bio,
         p.primary_locale,
         p.linkedin_url,
         private.team_contact_email(p.id) AS contact_email,
         CASE
           WHEN p.visibility = 'published'::member_visibility
                AND public.member_is_active(m.activity_state)
                AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on)
           THEN p.id
           ELSE NULL::uuid
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
      SELECT 1
      FROM public.op_assignments a
      JOIN public.op_projects pr ON pr.id = a.project_id AND pr.is_active
      WHERE a.member_id = m.id
    );
$$;

REVOKE ALL ON FUNCTION private.team_directory_rows() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.team_directory_rows() TO anon, authenticated, service_role;

CREATE VIEW public.team_directory_public
WITH (security_invoker = on) AS
  SELECT * FROM private.team_directory_rows();

GRANT SELECT ON public.team_directory_public TO anon, authenticated, service_role;
