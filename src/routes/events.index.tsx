/**
 * Public events directory route (/events).
 * Exports: Route. Renders the searchable list of upcoming and past events
 * with search param validation and localized meta.
 */

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import EventsPage from "@/pages/Events";
import { listPublicEvents } from "@/lib/events.functions";
import { eventsSearchSchema } from "@/lib/events-search";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/events/")({
  validateSearch: zodValidator(eventsSearchSchema),
  loader: () => listPublicEvents({ data: { locale: "en" } }),
  head: () => ({
    meta: localeMeta("en", "/events", "events.meta.title", "events.meta.description"),
    links: localeLinkTags("/events", "en"),
  }),
  errorComponent: () => (
    <EventsPage data={{ featured: null, upcoming: [], past: [], categories: [], regions: [] }} />
  ),
  component: EventsRoute,
});

function EventsRoute() {
  return <EventsPage data={Route.useLoaderData()} />;
}
