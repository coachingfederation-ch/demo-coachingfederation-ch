import { createFileRoute } from "@tanstack/react-router";
import FindACoachPage from "@/pages/FindACoach";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/find-a-coach")({
  head: () => ({
    meta: localeMeta("en", "/find-a-coach", "directory.meta.title", "directory.meta.description"),
    links: localeLinkTags("/find-a-coach", "en"),
  }),
  component: FindACoachPage,
});