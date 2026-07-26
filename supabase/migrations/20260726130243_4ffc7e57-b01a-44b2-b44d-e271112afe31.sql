CREATE TABLE public.deck_download_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  locale text NOT NULL DEFAULT 'en',
  source text NOT NULL DEFAULT 'for-organisations',
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.deck_download_leads TO anon, authenticated;
GRANT SELECT ON public.deck_download_leads TO authenticated;
GRANT ALL ON public.deck_download_leads TO service_role;

ALTER TABLE public.deck_download_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can record a deck download"
ON public.deck_download_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  locale IN ('en','de','fr','it')
  AND source = 'for-organisations'
  AND (email IS NULL OR (length(email) <= 255 AND email like '%_@_%'))
);

CREATE POLICY "Editors can read deck downloads"
ON public.deck_download_leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','editor')
  )
);