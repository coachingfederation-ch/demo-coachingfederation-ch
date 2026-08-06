CREATE TABLE public.cf_event_categories (
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

GRANT SELECT ON public.cf_event_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cf_event_categories TO authenticated;
GRANT ALL ON public.cf_event_categories TO service_role;

ALTER TABLE public.cf_event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cf_event_categories anon read active" ON public.cf_event_categories
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "cf_event_categories authenticated read" ON public.cf_event_categories
  FOR SELECT TO authenticated USING (is_active OR private.is_editor(auth.uid()));
CREATE POLICY "cf_event_categories editors write" ON public.cf_event_categories
  FOR ALL TO authenticated
  USING (private.is_editor(auth.uid()))
  WITH CHECK (private.is_editor(auth.uid()));

CREATE TRIGGER cf_event_categories_touch
  BEFORE UPDATE ON public.cf_event_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.cf_event_categories (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('chapter',   'Chapter events',   'Chapter-Events',      'Événements du chapitre',   'Eventi del chapter',   10),
  ('community', 'Community events', 'Community-Events',    'Événements communautaires','Eventi della community',20),
  ('learning',  'Learning events',  'Lern-Events',         'Événements de formation',  'Eventi formativi',     30),
  ('flagship',  'Flagship events',  'Flagship-Events',     'Événements phares',        'Eventi di punta',      40),
  ('partner',   'Partner events',   'Partner-Events',      'Événements partenaires',   'Eventi dei partner',   50);

INSERT INTO public.cf_regions (slug, name, name_de, name_fr, name_it, sort_order, is_active)
VALUES ('nationwide', 'Nationwide', 'Schweizweit', 'National', 'Nazionale', 5, true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.events
  ADD COLUMN category_id uuid REFERENCES public.cf_event_categories(id) ON DELETE SET NULL,
  ADD COLUMN region_id uuid REFERENCES public.cf_regions(id) ON DELETE SET NULL;

UPDATE public.events SET
  category_id = (SELECT id FROM public.cf_event_categories WHERE slug = 'chapter'),
  region_id = (SELECT id FROM public.cf_regions WHERE slug = 'nationwide')
WHERE category_id IS NULL OR region_id IS NULL;

CREATE INDEX events_category_id_idx ON public.events (category_id);
CREATE INDEX events_region_id_idx ON public.events (region_id);

DROP VIEW IF EXISTS public.events_public;
CREATE VIEW public.events_public
WITH (security_invoker = true) AS
  SELECT e.id,
     e.slug,
     e.title,
     e.summary,
     e.description,
     e.language,
     e.image_url,
     e.image_credit_name,
     e.image_credit_url,
     e.starts_at,
     e.ends_at,
     e.timezone,
     e.location_mode,
     e.venue_name,
     e.city,
     e.online_url,
     e.is_featured,
     e.registration_mode,
     e.capacity,
     e.guest_registration_allowed,
     e.registration_opens_at,
     e.registration_closes_at,
     private.event_confirmed_count(e.id) AS registration_count,
     CASE WHEN e.capacity IS NULL THEN NULL::integer
          ELSE GREATEST(e.capacity - private.event_confirmed_count(e.id), 0) END AS seats_remaining,
     e.capacity IS NOT NULL AND private.event_confirmed_count(e.id) >= e.capacity AS is_full,
     e.registration_mode = 'rsvp'::event_registration_mode
       AND (e.registration_opens_at IS NULL OR now() >= e.registration_opens_at)
       AND CASE WHEN e.registration_closes_at IS NOT NULL THEN now() <= e.registration_closes_at
                ELSE now() <= COALESCE(e.ends_at, e.starts_at) END
       AND (e.capacity IS NULL OR private.event_confirmed_count(e.id) < e.capacity) AS registration_open,
     c.slug AS category_slug,
     c.name AS category_name,
     r.slug AS region_slug,
     r.name AS region_name,
     e.published_at,
     e.updated_at
    FROM public.events e
    LEFT JOIN public.cf_event_categories c ON c.id = e.category_id
    LEFT JOIN public.cf_regions r ON r.id = e.region_id
   WHERE e.status = 'published'::event_status;

GRANT SELECT ON public.events_public TO anon, authenticated;
GRANT ALL ON public.events_public TO service_role;