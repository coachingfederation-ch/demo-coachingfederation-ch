/**
 * Locale-prefixed insights index route (/:locale/insights).
 * Exports: Route. Renders the localized insights/blog listing page.
 */

import { createFileRoute } from "@tanstack/react-router";
import InsightsPage from "@/pages/Insights";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/insights/")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/insights", "insights.meta.title", "insights.meta.description"),
      links: localeLinkTags("/insights", locale),
    };
  },
  component: InsightsPage,
});
