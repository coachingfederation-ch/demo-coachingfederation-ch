import { createFileRoute } from "@tanstack/react-router";
import EventsPage from "@/pages/Events";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: localeMeta("en", "/events", "events.meta.title", "events.meta.description"),
    links: localeLinkTags("/events", "en"),
  }),
  component: EventsPage,
});
