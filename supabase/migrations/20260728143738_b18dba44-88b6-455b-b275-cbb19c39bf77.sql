CREATE TABLE public.cf_experience_bands (
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

GRANT SELECT ON public.cf_experience_bands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_experience_bands TO authenticated;
GRANT ALL ON public.cf_experience_bands TO service_role;

ALTER TABLE public.cf_experience_bands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cf_experience_bands anon read active" ON public.cf_experience_bands
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_experience_bands authenticated read" ON public.cf_experience_bands
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
CREATE POLICY "cf_experience_bands editors write" ON public.cf_experience_bands
  FOR ALL TO authenticated USING (private.is_editor(auth.uid())) WITH CHECK (private.is_editor(auth.uid()));

CREATE TRIGGER cf_experience_bands_touch_updated_at
  BEFORE UPDATE ON public.cf_experience_bands
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.cf_experience_bands (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('0-2',  '0–2 years',  '0–2 Jahre',  '0–2 ans',  '0–2 anni',  10),
  ('3-5',  '3–5 years',  '3–5 Jahre',  '3–5 ans',  '3–5 anni',  20),
  ('6-10', '6–10 years', '6–10 Jahre', '6–10 ans', '6–10 anni', 30),
  ('10+',  '10+ years',  '10+ Jahre',  '10+ ans',  '10+ anni',  40);