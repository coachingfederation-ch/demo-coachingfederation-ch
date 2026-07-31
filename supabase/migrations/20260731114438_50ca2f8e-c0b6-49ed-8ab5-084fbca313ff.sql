-- ---------------------------------------------------------------------------
-- Europe Pulse: weekly scan of ~29 ICF European chapter websites.
-- ---------------------------------------------------------------------------

CREATE TYPE public.pulse_item_type AS ENUM ('event','news','webinar','workshop','conference');
CREATE TYPE public.pulse_item_status AS ENUM ('pending','published','hidden');
CREATE TYPE public.pulse_run_status AS ENUM ('running','succeeded','failed');
CREATE TYPE public.pulse_publish_mode AS ENUM ('automatic','manual');

-- Chapters -------------------------------------------------------------------
CREATE TABLE public.europe_pulse_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter text NOT NULL,
  country text NOT NULL,
  country_code text NOT NULL,
  base_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  last_status text,
  last_scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code)
);
GRANT SELECT ON public.europe_pulse_chapters TO anon, authenticated;
GRANT ALL ON public.europe_pulse_chapters TO service_role;
ALTER TABLE public.europe_pulse_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active chapters"
  ON public.europe_pulse_chapters FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins read all chapters"
  ON public.europe_pulse_chapters FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage chapters"
  ON public.europe_pulse_chapters FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER europe_pulse_chapters_touch BEFORE UPDATE ON public.europe_pulse_chapters
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Runs -----------------------------------------------------------------------
CREATE TABLE public.europe_pulse_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of date NOT NULL,
  status public.pulse_run_status NOT NULL DEFAULT 'running',
  trigger_source text NOT NULL DEFAULT 'manual',
  triggered_by uuid,
  chapters_total integer NOT NULL DEFAULT 0,
  chapters_ok integer NOT NULL DEFAULT 0,
  chapters_failed integer NOT NULL DEFAULT 0,
  raw_items integer NOT NULL DEFAULT 0,
  curated_items integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.europe_pulse_runs TO authenticated;
GRANT ALL ON public.europe_pulse_runs TO service_role;
ALTER TABLE public.europe_pulse_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read runs"
  ON public.europe_pulse_runs FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- Raw scan payloads ----------------------------------------------------------
CREATE TABLE public.europe_pulse_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.europe_pulse_runs(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.europe_pulse_chapters(id) ON DELETE SET NULL,
  chapter text NOT NULL,
  country text NOT NULL,
  source_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ok',
  error_message text,
  extracted_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  scan_date timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.europe_pulse_raw TO authenticated;
GRANT ALL ON public.europe_pulse_raw TO service_role;
ALTER TABLE public.europe_pulse_raw ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read raw scans"
  ON public.europe_pulse_raw FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
CREATE INDEX europe_pulse_raw_run_idx ON public.europe_pulse_raw (run_id);

-- Curated items --------------------------------------------------------------
CREATE TABLE public.europe_pulse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.europe_pulse_runs(id) ON DELETE SET NULL,
  week_of date NOT NULL,
  chapter text NOT NULL,
  country text NOT NULL,
  country_code text NOT NULL,
  type public.pulse_item_type NOT NULL DEFAULT 'news',
  title_en text NOT NULL,
  title_de text,
  title_fr text,
  title_it text,
  description_en text,
  description_de text,
  description_fr text,
  description_it text,
  url text NOT NULL,
  event_date date,
  status public.pulse_item_status NOT NULL DEFAULT 'published',
  sort_rank integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.europe_pulse TO anon, authenticated;
GRANT ALL ON public.europe_pulse TO service_role;
ALTER TABLE public.europe_pulse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published pulse items"
  ON public.europe_pulse FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all pulse items"
  ON public.europe_pulse FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage pulse items"
  ON public.europe_pulse FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE INDEX europe_pulse_week_idx ON public.europe_pulse (week_of DESC, sort_rank);
CREATE TRIGGER europe_pulse_touch BEFORE UPDATE ON public.europe_pulse
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Config ---------------------------------------------------------------------
CREATE TABLE public.europe_pulse_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  publish_mode public.pulse_publish_mode NOT NULL DEFAULT 'automatic',
  item_cap integer NOT NULL DEFAULT 30,
  max_per_chapter integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.europe_pulse_config TO authenticated;
GRANT ALL ON public.europe_pulse_config TO service_role;
ALTER TABLE public.europe_pulse_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read pulse config"
  ON public.europe_pulse_config FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pulse config"
  ON public.europe_pulse_config FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER europe_pulse_config_touch BEFORE UPDATE ON public.europe_pulse_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.europe_pulse_config (id) VALUES (true);

INSERT INTO public.europe_pulse_chapters (chapter, country, country_code, base_url, sort_order) VALUES
  ('ICF Austria','Austria','AT','https://coachfederation.at',1),
  ('ICF Belgium','Belgium','BE','https://coachingfederation.be',2),
  ('ICF Bulgaria','Bulgaria','BG','https://icfbulgaria.org',3),
  ('ICF Cyprus','Cyprus','CY','https://icf-chapters.org/icf-cyprus',4),
  ('ICF Czech Republic','Czech Republic','CZ','https://coachfederation.cz',5),
  ('ICF Denmark','Denmark','DK','https://icfdanmark.dk',6),
  ('ICF Estonia','Estonia','EE','https://coaching.ee',7),
  ('ICF Finland','Finland','FI','https://icffinland.fi',8),
  ('ICF France','France','FR','https://coachfederation.fr',9),
  ('ICF Germany','Germany','DE','https://coachingfederation.de',10),
  ('ICF Greece','Greece','GR','https://icfgreece.org',11),
  ('ICF Hungary','Hungary','HU','https://coachingfederation.hu',12),
  ('ICF Iceland','Iceland','IS','https://icficeland.is',13),
  ('ICF Ireland','Ireland','IE','https://icfireland.com',14),
  ('ICF Italy','Italy','IT','https://coachingfederation.it',15),
  ('ICF Latvia','Latvia','LV','https://icf.lv',16),
  ('ICF Lithuania','Lithuania','LT','https://icf.lt',17),
  ('ICF Luxembourg','Luxembourg','LU','https://coachfederation.lu',18),
  ('ICF Netherlands','Netherlands','NL','https://coachingfederation.nl',19),
  ('ICF Norway','Norway','NO','https://coachingfederation.no',20),
  ('ICF Poland','Poland','PL','https://icf.org.pl',21),
  ('ICF Portugal','Portugal','PT','https://icf.pt',22),
  ('ICF Romania','Romania','RO','https://coachingfederation.ro',23),
  ('ICF Slovakia','Slovakia','SK','https://icf.sk',24),
  ('ICF Slovenia','Slovenia','SI','https://icfslovenia.org',25),
  ('ICF Spain','Spain','ES','https://coachingfederation.es',26),
  ('ICF Sweden','Sweden','SE','https://icfsweden.se',27),
  ('ICF Turkey','Turkey','TR','https://icfturkey.org',28),
  ('ICF United Kingdom','United Kingdom','GB','https://coachingfederation.org.uk',29);