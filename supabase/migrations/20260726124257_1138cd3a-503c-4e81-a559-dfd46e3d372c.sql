CREATE TABLE public.organisation_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL DEFAULT 'en',
  primary_pressure text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  dimension_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_score integer,
  maturity_band text,
  contact_name text,
  contact_email text,
  contact_organisation text,
  message text,
  consent boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'for-organisations',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.organisation_survey_responses TO anon;
GRANT INSERT, SELECT ON public.organisation_survey_responses TO authenticated;
GRANT ALL ON public.organisation_survey_responses TO service_role;

ALTER TABLE public.organisation_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a survey response"
  ON public.organisation_survey_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Editors and admins can read survey responses"
  ON public.organisation_survey_responses FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'editor')
  ));

CREATE TRIGGER tg_organisation_survey_responses_updated_at
  BEFORE UPDATE ON public.organisation_survey_responses
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_touch_updated_at();