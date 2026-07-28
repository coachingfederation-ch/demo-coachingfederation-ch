import { createFileRoute, notFound } from "@tanstack/react-router";
import EventDetailPage, { EventFallback } from "@/pages/EventDetail";
import { getPublicEvent } from "@/lib/events.functions";
import { eventHead } from "@/lib/event-head";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/events/$slug")({
  loader: async ({ params }) => {
    const event = await getPublicEvent({
      data: { slug: params.slug, locale: params.locale as Locale },
    });
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData, params }) => eventHead(loaderData, params.locale as Locale, params.slug),
  errorComponent: () => (
    <EventFallback titleKey="events.detail.errorTitle" bodyKey="events.detail.errorBody" />
  ),
  notFoundComponent: () => (
    <EventFallback titleKey="events.detail.notFoundTitle" bodyKey="events.detail.notFoundBody" />
  ),
  component: LocaleEventDetailRoute,
});

function LocaleEventDetailRoute() {
  return <EventDetailPage event={Route.useLoaderData().event} />;
}
