/**
 * Locale-prefixed privacy policy route (/:locale/privacy).
 * Exports: Route. Renders the privacy policy page with localized metadata.
 */

import { createFileRoute } from "@tanstack/react-router";
import PrivacyPage from "@/pages/Privacy";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/privacy")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/privacy",
        "legal.privacy.meta.title",
        "legal.privacy.meta.description",
      ),
      links: localeLinkTags("/privacy", locale),
    };
  },
  component: PrivacyPage,
});
