-- Publishing is now a role grant, not an operational-structure assignment.
CREATE OR REPLACE FUNCTION private.is_article_publisher(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
  SELECT private.has_role(_user_id, 'publisher')
$function$;

-- Publisher-only accounts must reach the CMS to review and publish.
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
  select private.has_role(_user_id, 'admin')
      or private.has_role(_user_id, 'editor')
      or private.has_role(_user_id, 'organizer')
      or private.has_role(_user_id, 'publisher')
$function$;

-- Managed grants widen to include publisher.
DROP POLICY IF EXISTS "admins grant managed roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins revoke managed roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins grant organizer" ON public.user_roles;
DROP POLICY IF EXISTS "admins revoke organizer" ON public.user_roles;

CREATE POLICY "admins grant managed roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    private.has_role(auth.uid(), 'admin')
    AND role = ANY (ARRAY['editor'::app_role, 'organizer'::app_role, 'publisher'::app_role])
    AND private.has_role(user_id, 'member')
  );

CREATE POLICY "admins revoke managed roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin')
    AND role = ANY (ARRAY['editor'::app_role, 'organizer'::app_role, 'publisher'::app_role])
  );

-- Backfill: current Communication & Marketing publishers keep publishing.
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT m.auth_user_id, 'publisher'::app_role
FROM public.op_assignments a
JOIN public.members m ON m.id = a.member_id
JOIN public.op_projects p ON p.id = a.project_id
JOIN public.op_project_roles r ON r.id = a.role_id
WHERE p.slug = 'communication-marketing'
  AND r.slug = 'publisher'
  AND r.is_active
  AND m.auth_user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;