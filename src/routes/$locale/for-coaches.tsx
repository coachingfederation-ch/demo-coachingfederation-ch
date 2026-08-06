/**
 * Locale-prefixed for-coaches route (/:locale/for-coaches).
 * Exports: Route. Renders the landing page dedicated to coach resources and membership.
 */

import { createFileRoute } from "@tanstack/react-router";
import ForCoachesPage from "@/pages/ForCoaches";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/for-coaches")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/for-coaches", "coaches.meta.title", "coaches.meta.description"),
      links: localeLinkTags("/for-coaches", locale),
    };
  },
  component: ForCoachesPage,
});
