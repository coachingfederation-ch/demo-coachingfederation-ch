-- ============ enums ============
CREATE TYPE public.integration_mode AS ENUM ('test','live');
CREATE TYPE public.member_activity_state AS ENUM ('active','inactive','grace','anonymized');
CREATE TYPE public.member_visibility AS ENUM ('draft','published','hidden_inactive','hidden_admin');
CREATE TYPE public.sync_run_status AS ENUM ('running','succeeded','failed','aborted');

-- ============ integration_config (singleton) ============
CREATE TABLE public.integration_config (
  id boolean PRIMARY KEY DEFAULT true,
  mode public.integration_mode NOT NULL DEFAULT 'test',
  soap_endpoint_key text NOT NULL DEFAULT 'test',
  emails_suppressed boolean NOT NULL DEFAULT true,
  email_redirect_to text,
  account_claim_enabled boolean NOT NULL DEFAULT false,
  cutover_in_progress boolean NOT NULL DEFAULT false,
  cutover_completed_at timestamptz,
  cutover_completed_by uuid,
  last_successful_sync_at timestamptz,
  last_failed_sync_at timestamptz,
  last_sync_error text,
  last_sync_run_id uuid,
  feed_drop_threshold_pct integer NOT NULL DEFAULT 30,
  grace_period_days integer NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integration_config_singleton CHECK (id)
);

GRANT SELECT ON public.integration_config TO authenticated;
GRANT INSERT, UPDATE ON public.integration_config TO authenticated;
GRANT ALL ON public.integration_config TO service_role;
ALTER TABLE public.integration_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read integration config"
  ON public.integration_config FOR SELECT TO authenticated
  USING (public.is_editor(auth.uid()));
CREATE POLICY "Admins can update integration config"
  ON public.integration_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.tg_integration_config_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  -- TEST mode can never send member email or open account claim.
  IF NEW.mode = 'test' THEN
    NEW.emails_suppressed = true;
    NEW.account_claim_enabled = false;
  END IF;
  -- Claim only opens after a recorded LIVE cutover.
  IF NEW.account_claim_enabled AND (NEW.mode <> 'live' OR NEW.cutover_completed_at IS NULL) THEN
    RAISE EXCEPTION 'account_claim_enabled requires live mode and a completed cutover';
  END IF;
  -- Mode is a one-way door.
  IF TG_OP = 'UPDATE' AND OLD.mode = 'live' AND NEW.mode = 'test' THEN
    RAISE EXCEPTION 'cannot revert integration mode from live to test';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER integration_config_guard
  BEFORE INSERT OR UPDATE ON public.integration_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_integration_config_guard();

INSERT INTO public.integration_config (id) VALUES (true);

-- ============ sync runs ============
CREATE TABLE public.member_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode public.integration_mode NOT NULL,
  status public.sync_run_status NOT NULL DEFAULT 'running',
  triggered_by uuid,
  trigger_source text NOT NULL DEFAULT 'cron',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  feed_member_count integer,
  created_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  deactivated_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_sync_runs TO authenticated;
GRANT ALL ON public.member_sync_runs TO service_role;
ALTER TABLE public.member_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read sync runs" ON public.member_sync_runs
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));

-- ============ members ============
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cst_recno text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  city text,
  country text,
  organisation text,
  credential_slug text,
  member_type text,
  membership_join_date date,
  membership_expiration_date date,
  activity_state public.member_activity_state NOT NULL DEFAULT 'active',
  inactive_since timestamptz,
  scheduled_deletion_at timestamptz,
  anonymized_at timestamptz,
  auth_user_id uuid UNIQUE,
  last_synced_at timestamptz,
  last_sync_run_id uuid REFERENCES public.member_sync_runs(id) ON DELETE SET NULL,
  diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX members_activity_state_idx ON public.members(activity_state);
CREATE INDEX members_email_idx ON public.members(lower(email));

GRANT SELECT ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read members" ON public.members
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));

CREATE TRIGGER members_touch_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ member_directory_profiles ============
CREATE TABLE public.member_directory_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL UNIQUE REFERENCES public.members(id) ON DELETE CASCADE,
  visibility public.member_visibility NOT NULL DEFAULT 'draft',
  tagline text,
  description text,
  website_url text,
  linkedin_url text,
  profile_image_path text,
  availability_slug text,
  coaching_available boolean NOT NULL DEFAULT true,
  mentor_accredited boolean NOT NULL DEFAULT false,
  mentoring_available boolean NOT NULL DEFAULT false,
  supervision_accredited boolean NOT NULL DEFAULT false,
  supervision_available boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX member_directory_profiles_visibility_idx ON public.member_directory_profiles(visibility);

GRANT SELECT ON public.member_directory_profiles TO authenticated;
GRANT ALL ON public.member_directory_profiles TO service_role;
ALTER TABLE public.member_directory_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read directory profiles" ON public.member_directory_profiles
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));

CREATE TRIGGER member_directory_profiles_touch BEFORE UPDATE ON public.member_directory_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ facet joins ============
CREATE TABLE public.member_profile_regions (
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES public.cf_regions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, region_id)
);
CREATE TABLE public.member_profile_specialisations (
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  specialisation_id uuid NOT NULL REFERENCES public.cf_specialisations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, specialisation_id)
);
CREATE TABLE public.member_profile_languages (
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  language_id uuid NOT NULL REFERENCES public.cf_languages(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, language_id)
);
CREATE TABLE public.member_profile_formats (
  profile_id uuid NOT NULL REFERENCES public.member_directory_profiles(id) ON DELETE CASCADE,
  format_id uuid NOT NULL REFERENCES public.cf_formats(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, format_id)
);

GRANT SELECT ON public.member_profile_regions TO authenticated;
GRANT SELECT ON public.member_profile_specialisations TO authenticated;
GRANT SELECT ON public.member_profile_languages TO authenticated;
GRANT SELECT ON public.member_profile_formats TO authenticated;
GRANT ALL ON public.member_profile_regions TO service_role;
GRANT ALL ON public.member_profile_specialisations TO service_role;
GRANT ALL ON public.member_profile_languages TO service_role;
GRANT ALL ON public.member_profile_formats TO service_role;

ALTER TABLE public.member_profile_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profile_specialisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profile_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profile_formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read profile regions" ON public.member_profile_regions
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));
CREATE POLICY "Staff can read profile specialisations" ON public.member_profile_specialisations
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));
CREATE POLICY "Staff can read profile languages" ON public.member_profile_languages
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));
CREATE POLICY "Staff can read profile formats" ON public.member_profile_formats
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));

-- ============ import snapshots ============
CREATE TABLE public.member_import_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id uuid NOT NULL REFERENCES public.member_sync_runs(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  cst_recno text NOT NULL,
  normalized_payload jsonb NOT NULL,
  changed_fields text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX member_import_snapshots_run_idx ON public.member_import_snapshots(sync_run_id);
CREATE INDEX member_import_snapshots_recno_idx ON public.member_import_snapshots(cst_recno);

GRANT SELECT ON public.member_import_snapshots TO authenticated;
GRANT ALL ON public.member_import_snapshots TO service_role;
ALTER TABLE public.member_import_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read import snapshots" ON public.member_import_snapshots
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));

-- ============ sync events (audit trail) ============
CREATE TABLE public.member_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id uuid REFERENCES public.member_sync_runs(id) ON DELETE SET NULL,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  cst_recno text,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  message text,
  actor_user_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX member_sync_events_created_idx ON public.member_sync_events(created_at DESC);

GRANT SELECT ON public.member_sync_events TO authenticated;
GRANT ALL ON public.member_sync_events TO service_role;
ALTER TABLE public.member_sync_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read sync events" ON public.member_sync_events
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));

-- ============ lifecycle queue ============
CREATE TABLE public.member_lifecycle_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL UNIQUE REFERENCES public.members(id) ON DELETE CASCADE,
  entered_grace_at timestamptz NOT NULL DEFAULT now(),
  scheduled_deletion_at timestamptz NOT NULL,
  notified_at timestamptz,
  resolved_at timestamptz,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_lifecycle_queue TO authenticated;
GRANT ALL ON public.member_lifecycle_queue TO service_role;
ALTER TABLE public.member_lifecycle_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read lifecycle queue" ON public.member_lifecycle_queue
  FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));
CREATE TRIGGER member_lifecycle_queue_touch BEFORE UPDATE ON public.member_lifecycle_queue
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ account claim links (inert until cutover) ============
CREATE TABLE public.member_profile_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX member_profile_links_member_idx ON public.member_profile_links(member_id);
GRANT SELECT ON public.member_profile_links TO authenticated;
GRANT ALL ON public.member_profile_links TO service_role;
ALTER TABLE public.member_profile_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read claim links" ON public.member_profile_links
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ email log ============
CREATE TABLE public.member_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  intended_recipient text NOT NULL,
  actual_recipient text,
  template_key text NOT NULL,
  status text NOT NULL,
  mode public.integration_mode NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX member_email_log_created_idx ON public.member_email_log(created_at DESC);
GRANT SELECT ON public.member_email_log TO authenticated;
GRANT ALL ON public.member_email_log TO service_role;
ALTER TABLE public.member_email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read email log" ON public.member_email_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ archive snapshots (cutover backup) ============
CREATE TABLE public.member_archive_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  reason text NOT NULL DEFAULT 'test_to_live_cutover',
  taken_by uuid,
  table_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_archive_snapshots TO authenticated;
GRANT ALL ON public.member_archive_snapshots TO service_role;
ALTER TABLE public.member_archive_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read archive snapshots" ON public.member_archive_snapshots
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));