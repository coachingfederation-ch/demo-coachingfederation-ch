ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS featured_image_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_category_check
  CHECK (category IS NULL OR category IN ('Leadership','AI & Coaching','Diversity','Future of Work','Research'));

CREATE UNIQUE INDEX IF NOT EXISTS articles_single_featured_idx
  ON public.articles (is_featured) WHERE is_featured;

CREATE OR REPLACE FUNCTION public.tg_articles_single_featured()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_featured THEN
    UPDATE public.articles
      SET is_featured = false
      WHERE is_featured = true
        AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_single_featured ON public.articles;
CREATE TRIGGER articles_single_featured
  BEFORE INSERT OR UPDATE OF is_featured ON public.articles
  FOR EACH ROW
  WHEN (NEW.is_featured)
  EXECUTE FUNCTION public.tg_articles_single_featured();