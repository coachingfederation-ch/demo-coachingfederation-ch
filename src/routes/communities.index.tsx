/**
 * Public communities directory route (/communities).
 * Exports: Route. Renders the listing of all ICF Switzerland communities
 * with localized meta tags.
 */

import { createFileRoute } from "@tanstack/react-router";
import CommunitiesPage from "@/pages/Communities";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/communities/")({
  head: () => ({
    meta: localeMeta(
      "en",
      "/communities",
      "communities.meta.title",
      "communities.meta.description",
    ),
    links: localeLinkTags("/communities", "en"),
  }),
  component: CommunitiesPage,
});
