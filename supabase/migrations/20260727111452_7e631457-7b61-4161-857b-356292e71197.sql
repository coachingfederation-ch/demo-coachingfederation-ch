ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS credential_awarded_on date,
  ADD COLUMN IF NOT EXISTS credential_expires_on date;

UPDATE public.members
SET credential_awarded_on = to_date(diagnostics ->> 'credential_award_date', 'MM/DD/YYYY')
WHERE credential_awarded_on IS NULL
  AND diagnostics ->> 'credential_award_date' ~ '^\d{2}/\d{2}/\d{4}$';

UPDATE public.members
SET credential_expires_on = to_date(diagnostics ->> 'credential_expire_date', 'MM/DD/YYYY')
WHERE credential_expires_on IS NULL
  AND diagnostics ->> 'credential_expire_date' ~ '^\d{2}/\d{2}/\d{4}$';

ALTER TYPE public.member_visibility ADD VALUE IF NOT EXISTS 'hidden_no_credential';

CREATE OR REPLACE FUNCTION public.member_is_active(_activity_state public.member_activity_state)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT _activity_state = 'active'
$$;

CREATE OR REPLACE FUNCTION public.member_has_directory_credential(_credential_slug text, _credential_expires_on date)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT upper(coalesce(_credential_slug, '')) IN ('ACC', 'PCC', 'MCC')
     AND (_credential_expires_on IS NULL OR _credential_expires_on >= current_date)
$$;

CREATE OR REPLACE FUNCTION public.member_is_directory_eligible(_member_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.member_is_active(m.activity_state)
     AND public.member_has_directory_credential(m.credential_slug, m.credential_expires_on)
  FROM public.members m
  WHERE m.id = _member_id
$$;

REVOKE ALL ON FUNCTION public.member_is_directory_eligible(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_is_directory_eligible(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.member_is_directory_eligible(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.member_is_directory_eligible(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.tg_directory_profile_eligibility_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.visibility = 'published'
     AND NOT coalesce(public.member_is_directory_eligible(NEW.member_id), false) THEN
    RAISE EXCEPTION 'member % is not directory-eligible (requires active membership and a valid ACC, PCC or MCC credential)', NEW.member_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS directory_profile_eligibility_guard ON public.member_directory_profiles;
CREATE TRIGGER directory_profile_eligibility_guard
  BEFORE INSERT OR UPDATE ON public.member_directory_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_directory_profile_eligibility_guard();
-- migration end</query>
