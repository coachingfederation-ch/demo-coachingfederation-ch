import { createFileRoute } from "@tanstack/react-router";
import ForCoachesPage from "@/pages/ForCoaches";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/for-coaches")({
  head: () => ({
    meta: localeMeta("en", "/for-coaches", "coaches.meta.title", "coaches.meta.description"),
    links: localeLinkTags("/for-coaches", "en"),
  }),
  component: ForCoachesPage,
});
