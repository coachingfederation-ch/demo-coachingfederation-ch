/**
 * Europe Pulse page route (/europe-pulse).
 * Exports: Route. Renders the Europe Pulse page with search validation
 * and localized meta tags.
 */

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import EuropePulsePage from "@/pages/EuropePulse";
import { europePulseSearchSchema } from "@/lib/europe-pulse";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/europe-pulse")({
  validateSearch: zodValidator(europePulseSearchSchema),
  head: () => ({
    meta: localeMeta("en", "/europe-pulse", "europe-pulse.meta.title", "europe-pulse.meta.description"),
    links: localeLinkTags("/europe-pulse", "en"),
  }),
  component: EuropePulsePage,
});