import { createFileRoute } from "@tanstack/react-router";
import EventsPage from "@/pages/Events";
import { listPublicEvents } from "@/lib/events.functions";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/events/")({
  loader: () => listPublicEvents(),
  head: () => ({
    meta: localeMeta("en", "/events", "events.meta.title", "events.meta.description"),
    links: localeLinkTags("/events", "en"),
  }),
  errorComponent: () => <EventsPage data={{ featured: null, upcoming: [], past: [] }} />,
  component: EventsRoute,
});

function EventsRoute() {
  return <EventsPage data={Route.useLoaderData()} />;
}
