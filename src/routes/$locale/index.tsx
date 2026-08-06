/**
 * Locale-prefixed home page route (/:locale/).
 * Exports: Route. Renders the localized Home page and manages locale-specific metadata.
 */

import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/pages/Home";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/", "home.meta.title", "home.meta.description"),
      links: localeLinkTags("/", locale),
    };
  },
  component: HomePage,
});
