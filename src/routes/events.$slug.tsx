import { createFileRoute, notFound } from "@tanstack/react-router";
import EventDetailPage, { EventFallback } from "@/pages/EventDetail";
import { getPublicEvent } from "@/lib/events.functions";
import { eventHead } from "@/lib/event-head";

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ params }) => {
    const event = await getPublicEvent({ data: { slug: params.slug } });
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData, params }) => eventHead(loaderData, "en", params.slug),
  errorComponent: () => (
    <EventFallback titleKey="events.detail.errorTitle" bodyKey="events.detail.errorBody" />
  ),
  notFoundComponent: () => (
    <EventFallback titleKey="events.detail.notFoundTitle" bodyKey="events.detail.notFoundBody" />
  ),
  component: EventDetailRoute,
});

function EventDetailRoute() {
  return <EventDetailPage event={Route.useLoaderData().event} />;
}