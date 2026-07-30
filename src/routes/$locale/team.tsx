import { createFileRoute } from "@tanstack/react-router";
import TeamPage from "@/pages/Team";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/team")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/team", "team.meta.title", "team.meta.description"),
      links: localeLinkTags("/team", locale),
    };
  },
  component: TeamPage,
});
