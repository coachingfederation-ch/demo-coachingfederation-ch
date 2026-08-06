/**
 * Locale-prefixed for-organisations route (/:locale/for-organisations).
 * Exports: Route. Renders the landing page for organizational coaching services.
 */

import { createFileRoute } from "@tanstack/react-router";
import ForOrganisationsPage from "@/pages/ForOrganisations";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/for-organisations")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/for-organisations",
        "organisations.meta.title",
        "organisations.meta.description",
      ),
      links: localeLinkTags("/for-organisations", locale),
    };
  },
  component: ForOrganisationsPage,
});
