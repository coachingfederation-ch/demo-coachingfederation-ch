import { createFileRoute } from "@tanstack/react-router";
import FindACoachPage from "@/pages/FindACoach";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/find-a-coach")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/find-a-coach",
        "directory.meta.title",
        "directory.meta.description",
      ),
      links: localeLinkTags("/find-a-coach", locale),
    };
  },
  component: FindACoachPage,
});