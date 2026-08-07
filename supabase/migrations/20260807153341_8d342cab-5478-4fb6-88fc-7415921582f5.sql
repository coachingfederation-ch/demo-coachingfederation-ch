ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'review';

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE OR REPLACE FUNCTION private.is_article_publisher(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.op_assignments a
    JOIN public.members m ON m.id = a.member_id
    JOIN public.op_projects p ON p.id = a.project_id
    JOIN public.op_project_roles r ON r.id = a.role_id
    WHERE m.auth_user_id = _user_id
      AND p.slug = 'communication-marketing'
      AND r.slug = 'publisher'
      AND r.is_active
  )
$$;

CREATE OR REPLACE FUNCTION public.tg_articles_publish_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  is_admin boolean := private.has_role(auth.uid(), 'admin');
BEGIN
  IF NEW.status IN ('published', 'scheduled')
     AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT is_admin AND NOT private.is_article_publisher(uid) THEN
      RAISE EXCEPTION 'only a Communication & Marketing publisher may publish an article';
    END IF;
    IF NOT is_admin AND NEW.created_by IS NOT NULL AND NEW.created_by = uid THEN
      RAISE EXCEPTION 'the creator of an article cannot publish it; another publisher must review it';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_publish_guard ON public.articles;
CREATE TRIGGER articles_publish_guard
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.tg_articles_publish_guard();