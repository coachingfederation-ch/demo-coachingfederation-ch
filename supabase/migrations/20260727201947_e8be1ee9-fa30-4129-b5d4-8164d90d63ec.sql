-- Migration B: govern role changes and audit them.
--
-- `editor` is an ADDITIVE grant layered on top of an existing `member` grant.
-- It never changes membership. `admin` is deliberately NOT grantable through
-- the Data API: it stays a migration-only provisioning step so a single
-- compromised admin session cannot mint permanent admins.

-- 1. Audit log -----------------------------------------------------------------
CREATE TABLE public.role_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  action text NOT NULL CHECK (action IN ('granted', 'revoked')),
  actor_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.role_grants TO authenticated;
GRANT ALL ON public.role_grants TO service_role;

ALTER TABLE public.role_grants ENABLE ROW LEVEL SECURITY;

-- Read-only for admins; writes only ever happen through the trigger below
-- (which runs as the table owner) or the service role.
CREATE POLICY "admins read role grants" ON public.role_grants
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE INDEX role_grants_user_id_created_at_idx
  ON public.role_grants (user_id, created_at DESC);

-- 2. Audit trigger -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_user_roles_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_grants (user_id, role, action, actor_user_id)
    VALUES (NEW.user_id, NEW.role, 'granted', auth.uid());
    RETURN NEW;
  ELSE
    INSERT INTO public.role_grants (user_id, role, action, actor_user_id)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER user_roles_audit
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.tg_user_roles_audit();

-- 3. Admin-managed editor grants ------------------------------------------------
-- private.has_role is SECURITY DEFINER, so referencing user_roles through it
-- does not recurse into this table's own policies.
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY "admins grant editor" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    private.has_role(auth.uid(), 'admin')
    AND role = 'editor'
    AND private.has_role(user_id, 'member')
  );

CREATE POLICY "admins revoke editor" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin')
    AND role = 'editor'
  );