-- Shared touch trigger for the coach finder vocabulary tables
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- cf_regions
-- ---------------------------------------------------------------------------
CREATE TABLE public.cf_regions (
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
GRANT SELECT ON public.cf_regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_regions TO authenticated;
GRANT ALL ON public.cf_regions TO service_role;
ALTER TABLE public.cf_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_regions anon read active" ON public.cf_regions
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_regions authenticated read" ON public.cf_regions
  FOR SELECT TO authenticated USING (
    is_active OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
    )
  );
CREATE POLICY "cf_regions editors write" ON public.cf_regions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER cf_regions_touch BEFORE UPDATE ON public.cf_regions
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- cf_specialisations
-- ---------------------------------------------------------------------------
CREATE TABLE public.cf_specialisations (
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
GRANT SELECT ON public.cf_specialisations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_specialisations TO authenticated;
GRANT ALL ON public.cf_specialisations TO service_role;
ALTER TABLE public.cf_specialisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_specialisations anon read active" ON public.cf_specialisations
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_specialisations authenticated read" ON public.cf_specialisations
  FOR SELECT TO authenticated USING (
    is_active OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
    )
  );
CREATE POLICY "cf_specialisations editors write" ON public.cf_specialisations
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER cf_specialisations_touch BEFORE UPDATE ON public.cf_specialisations
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- cf_credentials
-- ---------------------------------------------------------------------------
CREATE TABLE public.cf_credentials (
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
GRANT SELECT ON public.cf_credentials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_credentials TO authenticated;
GRANT ALL ON public.cf_credentials TO service_role;
ALTER TABLE public.cf_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_credentials anon read active" ON public.cf_credentials
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_credentials authenticated read" ON public.cf_credentials
  FOR SELECT TO authenticated USING (
    is_active OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
    )
  );
CREATE POLICY "cf_credentials editors write" ON public.cf_credentials
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER cf_credentials_touch BEFORE UPDATE ON public.cf_credentials
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- cf_formats
-- ---------------------------------------------------------------------------
CREATE TABLE public.cf_formats (
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
GRANT SELECT ON public.cf_formats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_formats TO authenticated;
GRANT ALL ON public.cf_formats TO service_role;
ALTER TABLE public.cf_formats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_formats anon read active" ON public.cf_formats
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_formats authenticated read" ON public.cf_formats
  FOR SELECT TO authenticated USING (
    is_active OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
    )
  );
CREATE POLICY "cf_formats editors write" ON public.cf_formats
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER cf_formats_touch BEFORE UPDATE ON public.cf_formats
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- cf_languages
-- ---------------------------------------------------------------------------
CREATE TABLE public.cf_languages (
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
GRANT SELECT ON public.cf_languages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_languages TO authenticated;
GRANT ALL ON public.cf_languages TO service_role;
ALTER TABLE public.cf_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_languages anon read active" ON public.cf_languages
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_languages authenticated read" ON public.cf_languages
  FOR SELECT TO authenticated USING (
    is_active OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
    )
  );
CREATE POLICY "cf_languages editors write" ON public.cf_languages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER cf_languages_touch BEFORE UPDATE ON public.cf_languages
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- cf_availability_labels
-- ---------------------------------------------------------------------------
CREATE TABLE public.cf_availability_labels (
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
GRANT SELECT ON public.cf_availability_labels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_availability_labels TO authenticated;
GRANT ALL ON public.cf_availability_labels TO service_role;
ALTER TABLE public.cf_availability_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_availability_labels anon read active" ON public.cf_availability_labels
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_availability_labels authenticated read" ON public.cf_availability_labels
  FOR SELECT TO authenticated USING (
    is_active OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
    )
  );
CREATE POLICY "cf_availability_labels editors write" ON public.cf_availability_labels
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER cf_availability_labels_touch BEFORE UPDATE ON public.cf_availability_labels
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- coach_finder_config (singleton)
-- ---------------------------------------------------------------------------
CREATE TABLE public.coach_finder_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  coaching_enabled boolean NOT NULL DEFAULT true,
  mentoring_enabled boolean NOT NULL DEFAULT false,
  supervision_enabled boolean NOT NULL DEFAULT false,
  coaching_label text NOT NULL DEFAULT 'Find a coach',
  mentoring_label text NOT NULL DEFAULT 'Find a mentor',
  supervision_label text NOT NULL DEFAULT 'Find a supervisor',
  default_sort text NOT NULL DEFAULT 'name',
  page_size integer NOT NULL DEFAULT 24,
  feed_drop_threshold_pct integer NOT NULL DEFAULT 30,
  snapshot_retention_months integer NOT NULL DEFAULT 24,
  csv_export_row_cap integer NOT NULL DEFAULT 5000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coach_finder_config TO anon;
GRANT SELECT, INSERT, UPDATE ON public.coach_finder_config TO authenticated;
GRANT ALL ON public.coach_finder_config TO service_role;
ALTER TABLE public.coach_finder_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach_finder_config public read" ON public.coach_finder_config
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "coach_finder_config editors write" ON public.coach_finder_config
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor'))
  );
CREATE TRIGGER coach_finder_config_touch BEFORE UPDATE ON public.coach_finder_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.coach_finder_config (id) VALUES (true);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
INSERT INTO public.cf_regions (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('zurich',        'Zürich',              'Zürich',              'Zurich',              'Zurigo',              10),
  ('bern',          'Bern',                'Bern',                'Berne',               'Berna',               20),
  ('basel',         'Basel',               'Basel',               'Bâle',                'Basilea',             30),
  ('central',       'Central Switzerland', 'Zentralschweiz',      'Suisse centrale',     'Svizzera centrale',   40),
  ('eastern',       'Eastern Switzerland', 'Ostschweiz',          'Suisse orientale',    'Svizzera orientale',  50),
  ('romandie-vaud', 'Vaud & Lausanne',     'Waadt & Lausanne',    'Vaud & Lausanne',     'Vaud e Losanna',      60),
  ('romandie-geneva','Geneva',             'Genf',                'Genève',              'Ginevra',             70),
  ('romandie-other','Romandie (other)',    'Romandie (übrige)',   'Romandie (autres)',   'Romandia (altro)',    80),
  ('ticino',        'Ticino',              'Tessin',              'Tessin',              'Ticino',              90),
  ('valais',        'Valais',              'Wallis',              'Valais',              'Vallese',            100),
  ('online',        'Online only',         'Nur online',          'En ligne uniquement', 'Solo online',        110);

INSERT INTO public.cf_specialisations (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('leadership', 'Leadership',        'Führung',              'Leadership',              'Leadership',            10),
  ('career',     'Career',            'Karriere',             'Carrière',                'Carriera',              20),
  ('team',       'Team',              'Team',                 'Équipe',                  'Team',                  30),
  ('executive',  'Executive',         'Executive',            'Dirigeants',              'Executive',             40),
  ('transition', 'Transition',        'Übergang',             'Transition',              'Transizione',           50),
  ('wellbeing',  'Wellbeing',         'Wohlbefinden',         'Bien-être',               'Benessere',             60),
  ('systemic',   'Systemic',          'Systemisch',           'Systémique',              'Sistemico',             70),
  ('diversity',  'Diversity & inclusion','Diversität & Inklusion','Diversité & inclusion','Diversità e inclusione',80);

INSERT INTO public.cf_credentials (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('ACC', 'ACC — Associate Certified Coach',  'ACC — Associate Certified Coach',  'ACC — Associate Certified Coach',  'ACC — Associate Certified Coach',  10),
  ('PCC', 'PCC — Professional Certified Coach','PCC — Professional Certified Coach','PCC — Professional Certified Coach','PCC — Professional Certified Coach',20),
  ('MCC', 'MCC — Master Certified Coach',     'MCC — Master Certified Coach',     'MCC — Master Certified Coach',     'MCC — Master Certified Coach',     30);

INSERT INTO public.cf_formats (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('in-person', 'In person', 'Vor Ort', 'En présentiel', 'In presenza', 10),
  ('online',    'Online',    'Online',  'En ligne',      'Online',      20);

INSERT INTO public.cf_languages (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('de', 'German',  'Deutsch',     'Allemand', 'Tedesco',  10),
  ('fr', 'French',  'Französisch', 'Français', 'Francese', 20),
  ('it', 'Italian', 'Italienisch', 'Italien',  'Italiano', 30),
  ('en', 'English', 'Englisch',    'Anglais',  'Inglese',  40);

INSERT INTO public.cf_availability_labels (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('accepting',     'Accepting clients',     'Nimmt Klient:innen an',   'Accepte des clients',      'Accetta clienti',        10),
  ('waitlist',      'Waiting list',          'Warteliste',              'Liste d''attente',         'Lista d''attesa',        20),
  ('not-accepting', 'Not accepting clients', 'Nimmt keine Klient:innen','N''accepte pas de clients','Non accetta clienti',    30);
