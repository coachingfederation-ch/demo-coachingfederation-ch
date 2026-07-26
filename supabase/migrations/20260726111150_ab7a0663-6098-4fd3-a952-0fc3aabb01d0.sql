-- 1. PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles public read" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles insert own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.tg_profiles_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''), ' ', 1), ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULLIF(substr(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''), strpos(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''), ' ') + 1), COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')), ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, first_name, last_name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'first_name', split_part(COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), ' ', 1), ''),
       COALESCE(u.raw_user_meta_data ->> 'last_name', ''),
       COALESCE(u.email, '')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_de text,
  name_fr text,
  name_it text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories public read" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories editors write" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER categories_touch_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_touch_updated_at();

INSERT INTO public.categories (slug, name, name_de, name_fr, name_it, sort_order) VALUES
  ('leadership', 'Leadership', 'Führung', 'Leadership', 'Leadership', 1),
  ('ai-coaching', 'AI & Coaching', 'KI & Coaching', 'IA & coaching', 'IA e coaching', 2),
  ('diversity', 'Diversity', 'Diversität', 'Diversité', 'Diversità', 3),
  ('future-of-work', 'Future of Work', 'Zukunft der Arbeit', 'Futur du travail', 'Futuro del lavoro', 4),
  ('research', 'Research', 'Forschung', 'Recherche', 'Ricerca', 5);

-- 3. ARTICLES: author FK, category FK, content_updated_at
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
ALTER TABLE public.articles
  ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.articles
  ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN content_updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.articles a
  SET category_id = c.id
  FROM public.categories c
  WHERE a.category IS NOT NULL AND c.name = a.category;

CREATE OR REPLACE FUNCTION public.tg_articles_content_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.excerpt IS DISTINCT FROM OLD.excerpt
     OR NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.content_updated_at = now();
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER articles_content_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.tg_articles_content_updated_at();

-- 4. ARTICLE TRANSLATIONS
CREATE TABLE public.article_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('en', 'de', 'fr', 'it')),
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  manually_edited boolean NOT NULL DEFAULT false,
  source_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, locale)
);

GRANT SELECT ON public.article_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_translations TO authenticated;
GRANT ALL ON public.article_translations TO service_role;

ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translations public read published" ON public.article_translations
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.status = 'published')
  );
CREATE POLICY "translations editors read" ON public.article_translations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "translations editors insert" ON public.article_translations
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "translations editors update" ON public.article_translations
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "translations editors delete" ON public.article_translations
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER article_translations_touch_updated_at
  BEFORE UPDATE ON public.article_translations
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_touch_updated_at();

CREATE INDEX article_translations_article_idx ON public.article_translations (article_id);