import { createFileRoute } from "@tanstack/react-router";
import TeamPage from "@/pages/Team";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: localeMeta("en", "/team", "team.meta.title", "team.meta.description"),
    links: localeLinkTags("/team", "en"),
  }),
  component: TeamPage,
});
