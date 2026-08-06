/**
 * Legal Imprint page route (/imprint).
 * Exports: Route. Renders the legal imprint information with localized
 * meta tags.
 */

import { createFileRoute } from "@tanstack/react-router";
import ImprintPage from "@/pages/Imprint";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/imprint")({
  head: () => ({
    meta: localeMeta(
      "en",
      "/imprint",
      "legal.imprint.meta.title",
      "legal.imprint.meta.description",
    ),
    links: localeLinkTags("/imprint", "en"),
  }),
  component: ImprintPage,
});
