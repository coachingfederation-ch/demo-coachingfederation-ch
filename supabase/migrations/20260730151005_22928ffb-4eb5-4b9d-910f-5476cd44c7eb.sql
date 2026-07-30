ALTER TABLE public.op_projects
  ADD COLUMN is_community boolean NOT NULL DEFAULT false,
  ADD COLUMN is_featured_community boolean NOT NULL DEFAULT false,
  ADD COLUMN description text,
  ADD COLUMN description_de text,
  ADD COLUMN description_fr text,
  ADD COLUMN description_it text,
  ADD COLUMN cadence_note text,
  ADD COLUMN cadence_note_de text,
  ADD COLUMN cadence_note_fr text,
  ADD COLUMN cadence_note_it text,
  ADD COLUMN contact_email text,
  ADD COLUMN signup_url text,
  ADD COLUMN language_slugs text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN content_updated_at timestamptz NOT NULL DEFAULT now();

-- Only a community can be the featured community, and only one may hold it.
CREATE OR REPLACE FUNCTION public.tg_op_projects_single_featured_community()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_featured_community AND NOT NEW.is_community THEN
    NEW.is_featured_community = false;
  END IF;
  IF NEW.is_featured_community THEN
    UPDATE public.op_projects
      SET is_featured_community = false
      WHERE is_featured_community = true
        AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER op_projects_single_featured_community
BEFORE INSERT OR UPDATE ON public.op_projects
FOR EACH ROW EXECUTE FUNCTION public.tg_op_projects_single_featured_community();

-- Touch content_updated_at when translatable community copy changes, so the
-- CMS can flag stale translations (same idea as articles/events).
CREATE OR REPLACE FUNCTION public.tg_op_projects_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.cadence_note IS DISTINCT FROM OLD.cadence_note THEN
    NEW.content_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER op_projects_content_updated_at
BEFORE UPDATE ON public.op_projects
FOR EACH ROW EXECUTE FUNCTION public.tg_op_projects_content_updated_at();

-- Public read surface stays the view.
CREATE OR REPLACE VIEW public.team_projects_public AS
SELECT id,
    slug,
    name,
    name_de,
    name_fr,
    name_it,
    sort_order,
    is_community,
    is_featured_community,
    description,
    description_de,
    description_fr,
    description_it,
    cadence_note,
    cadence_note_de,
    cadence_note_fr,
    cadence_note_it,
    contact_email,
    signup_url,
    language_slugs
   FROM public.op_projects
  WHERE is_active;

UPDATE public.op_projects
   SET is_community = true
 WHERE slug LIKE 'community-%';

UPDATE public.op_projects
   SET is_featured_community = true
 WHERE slug = 'community-zurich';