import { createFileRoute } from "@tanstack/react-router";
import EuropePulsePage from "@/pages/EuropePulse";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/europe-pulse")({
  head: () => ({
    meta: localeMeta("en", "/europe-pulse", "europe-pulse.meta.title", "europe-pulse.meta.description"),
    links: localeLinkTags("/europe-pulse", "en"),
  }),
  component: EuropePulsePage,
});