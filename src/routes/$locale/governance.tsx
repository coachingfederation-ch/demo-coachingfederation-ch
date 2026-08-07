/**
 * Locale-prefixed governance archive route (/:locale/governance).
 * Exports: Route. Renders the read-only archive of chapter governance documents.
 */

import { createFileRoute } from "@tanstack/react-router";
import GovernancePage from "@/pages/Governance";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/governance")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/governance",
        "governance.meta.title",
        "governance.meta.description",
      ),
      links: localeLinkTags("/governance", locale),
    };
  },
  component: GovernancePage,
});
