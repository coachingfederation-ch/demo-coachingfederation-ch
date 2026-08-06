/**
 * Public Insights directory route (/insights).
 * Exports: Route. Renders the article listing (blog) page with localized
 * meta tags and SEO links.
 */

import { createFileRoute } from "@tanstack/react-router";
import InsightsPage from "@/pages/Insights";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: localeMeta("en", "/insights", "insights.meta.title", "insights.meta.description"),
    links: localeLinkTags("/insights", "en"),
  }),
  component: InsightsPage,
});
