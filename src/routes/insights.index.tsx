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
