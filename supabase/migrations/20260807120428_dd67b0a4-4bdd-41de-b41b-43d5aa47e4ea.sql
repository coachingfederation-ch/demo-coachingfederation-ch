CREATE TABLE public.governance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  year integer,
  language article_lang NOT NULL DEFAULT 'en',
  file_path text,
  external_url text,
  file_size_bytes bigint,
  mime_type text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  document_date date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT governance_documents_category_check
    CHECK (category IN ('agm','code-of-ethics','deib','charter','annual-report','other')),
  CONSTRAINT governance_documents_year_check
    CHECK (year IS NULL OR (year BETWEEN 1990 AND 2100)),
  CONSTRAINT governance_documents_source_check
    CHECK (file_path IS NOT NULL OR external_url IS NOT NULL)
);

GRANT SELECT ON public.governance_documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.governance_documents TO authenticated;
GRANT ALL ON public.governance_documents TO service_role;

ALTER TABLE public.governance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "governance public read published"
  ON public.governance_documents
  FOR SELECT
  TO anon, authenticated
  USING (is_published);

CREATE POLICY "governance editors write"
  ON public.governance_documents
  FOR ALL
  TO authenticated
  USING (private.is_editor(auth.uid()))
  WITH CHECK (private.is_editor(auth.uid()));

CREATE TRIGGER governance_documents_touch_updated_at
  BEFORE UPDATE ON public.governance_documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE INDEX governance_documents_browse_idx
  ON public.governance_documents (category, year DESC NULLS LAST, sort_order);
