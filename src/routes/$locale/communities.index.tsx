/**
 * Locale-prefixed communities index route (/:locale/communities).
 * Exports: Route. Renders the Communities listing page with localized metadata.
 */

import { createFileRoute } from "@tanstack/react-router";
import CommunitiesPage from "@/pages/Communities";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/communities/")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/communities",
        "communities.meta.title",
        "communities.meta.description",
      ),
      links: localeLinkTags("/communities", locale),
    };
  },
  component: CommunitiesPage,
});
