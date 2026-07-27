-- One auth account may only ever be bound to a single member record.
CREATE UNIQUE INDEX IF NOT EXISTS members_auth_user_id_unique
  ON public.members(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Ownership helper: is this directory profile owned by the caller?
CREATE OR REPLACE FUNCTION public.member_owns_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.member_directory_profiles p
    JOIN public.members m ON m.id = p.member_id
    WHERE p.id = _profile_id
      AND m.auth_user_id = auth.uid()
  )
$$;
REVOKE EXECUTE ON FUNCTION public.member_owns_profile(uuid) FROM anon;

CREATE TABLE public.member_profile_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  link_type text NOT NULL DEFAULT 'website',
  label text,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_profile_websites_type_check
    CHECK (link_type IN ('website', 'linkedin', 'other')),
  CONSTRAINT member_profile_websites_url_check
    CHECK (url ~* '^https://[^\s]{3,250}$')
);

CREATE INDEX member_profile_websites_profile_idx
  ON public.member_profile_websites(profile_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_profile_websites TO authenticated;
GRANT ALL ON public.member_profile_websites TO service_role;

ALTER TABLE public.member_profile_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own profile links"
  ON public.member_profile_websites FOR ALL TO authenticated
  USING (public.member_owns_profile(profile_id))
  WITH CHECK (public.member_owns_profile(profile_id));

CREATE POLICY "Staff manage all profile links"
  ON public.member_profile_websites FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur
                 WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur
                      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')));

CREATE TRIGGER member_profile_websites_touch
  BEFORE UPDATE ON public.member_profile_websites
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Carry over the legacy single-value columns.
INSERT INTO public.member_profile_websites (profile_id, link_type, url, sort_order)
SELECT id, 'website', website_url, 0
FROM public.member_directory_profiles
WHERE website_url ~* '^https://[^\s]{3,250}$';

INSERT INTO public.member_profile_websites (profile_id, link_type, url, sort_order)
SELECT id, 'linkedin', linkedin_url, 1
FROM public.member_directory_profiles
WHERE linkedin_url ~* '^https://[^\s]{3,250}$';