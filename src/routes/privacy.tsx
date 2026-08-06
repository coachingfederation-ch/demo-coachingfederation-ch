/**
 * Privacy Policy page route (/privacy).
 * Exports: Route. Renders the data protection and privacy policy with
 * localized meta tags.
 */

import { createFileRoute } from "@tanstack/react-router";
import PrivacyPage from "@/pages/Privacy";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: localeMeta(
      "en",
      "/privacy",
      "legal.privacy.meta.title",
      "legal.privacy.meta.description",
    ),
    links: localeLinkTags("/privacy", "en"),
  }),
  component: PrivacyPage,
});
