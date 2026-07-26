ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS image_credit_name text,
  ADD COLUMN IF NOT EXISTS image_credit_url text,
  ADD COLUMN IF NOT EXISTS image_source text;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_image_source_check
  CHECK (image_source IS NULL OR image_source IN ('upload','unsplash','url'));