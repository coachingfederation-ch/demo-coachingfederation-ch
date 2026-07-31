import { createFileRoute } from "@tanstack/react-router";
import EuropePulsePage from "@/pages/EuropePulse";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/europe-pulse")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/europe-pulse",
        "europe-pulse.meta.title",
        "europe-pulse.meta.description",
      ),
      links: localeLinkTags("/europe-pulse", locale),
    };
  },
  component: EuropePulsePage,
});