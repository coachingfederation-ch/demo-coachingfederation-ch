/**
 * Public Coach Finder directory route (/find-a-coach).
 * Exports: Route. Renders the searchable coach directory with validated
 * search parameters and localized SEO metadata.
 */

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import FindACoachPage from "@/pages/FindACoach";
import { localeLinkTags, localeMeta } from "@/i18n";
import { finderSearchSchema } from "@/lib/finder-search";

export const Route = createFileRoute("/find-a-coach")({
  validateSearch: zodValidator(finderSearchSchema),
  head: () => ({
    meta: localeMeta("en", "/find-a-coach", "directory.meta.title", "directory.meta.description"),
    links: localeLinkTags("/find-a-coach", "en"),
  }),
  component: FindACoachPage,
});
