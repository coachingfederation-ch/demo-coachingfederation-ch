CREATE TYPE public.linkedin_post_status AS ENUM ('pending', 'posted', 'failed');

CREATE TABLE public.article_linkedin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  status public.linkedin_post_status NOT NULL DEFAULT 'pending',
  linkedin_post_urn text,
  linkedin_post_url text,
  posted_at timestamp with time zone,
  commentary text NOT NULL DEFAULT '',
  image_mode text NOT NULL DEFAULT 'feature',
  error_message text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX article_linkedin_posts_article_idx
  ON public.article_linkedin_posts (article_id, created_at DESC);

GRANT SELECT ON public.article_linkedin_posts TO authenticated;
GRANT ALL ON public.article_linkedin_posts TO service_role;

ALTER TABLE public.article_linkedin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read linkedin posts"
  ON public.article_linkedin_posts
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin')
    OR private.has_role(auth.uid(), 'editor')
    OR private.has_role(auth.uid(), 'publisher')
  );

CREATE TRIGGER article_linkedin_posts_touch_updated_at
  BEFORE UPDATE ON public.article_linkedin_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.linkedin_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  organization_urn text,
  organization_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.linkedin_config TO authenticated;
GRANT ALL ON public.linkedin_config TO service_role;

ALTER TABLE public.linkedin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read linkedin config"
  ON public.linkedin_config
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin')
    OR private.has_role(auth.uid(), 'editor')
    OR private.has_role(auth.uid(), 'publisher')
  );

CREATE POLICY "admins update linkedin config"
  ON public.linkedin_config
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER linkedin_config_touch_updated_at
  BEFORE UPDATE ON public.linkedin_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.linkedin_config (id) VALUES (true) ON CONFLICT (id) DO NOTHING;