/**
 * Public governance document archive route (/governance).
 * Exports: Route. Renders the read-only archive of chapter governance
 * documents with localized SEO metadata.
 */

import { createFileRoute } from "@tanstack/react-router";
import GovernancePage from "@/pages/Governance";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: localeMeta("en", "/governance", "governance.meta.title", "governance.meta.description"),
    links: localeLinkTags("/governance", "en"),
  }),
  component: GovernancePage,
});
