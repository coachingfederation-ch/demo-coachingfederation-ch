DROP POLICY "Anyone can submit a survey response" ON public.organisation_survey_responses;

CREATE POLICY "Anyone can submit a valid survey response"
  ON public.organisation_survey_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    locale IN ('en', 'de', 'fr', 'it')
    AND source = 'for-organisations'
    AND (total_score IS NULL OR (total_score >= 0 AND total_score <= 100))
    AND (primary_pressure IS NULL OR length(primary_pressure) <= 64)
    AND (maturity_band IS NULL OR length(maturity_band) <= 32)
    AND (contact_name IS NULL OR length(contact_name) <= 120)
    AND (contact_email IS NULL OR length(contact_email) <= 255)
    AND (contact_organisation IS NULL OR length(contact_organisation) <= 160)
    AND (message IS NULL OR length(message) <= 2000)
    AND length(answers::text) <= 4000
    AND length(dimension_scores::text) <= 2000
  );