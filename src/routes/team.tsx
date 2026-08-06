/**
 * "Our Team" page route (/team).
 * Exports: Route. Renders the chapter's leadership and team overview with
 * localized SEO metadata.
 */

import { createFileRoute } from "@tanstack/react-router";
import TeamPage from "@/pages/Team";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: localeMeta("en", "/team", "team.meta.title", "team.meta.description"),
    links: localeLinkTags("/team", "en"),
  }),
  component: TeamPage,
});
