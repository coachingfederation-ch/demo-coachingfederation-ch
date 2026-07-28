import { createFileRoute } from "@tanstack/react-router";
import EventsPage from "@/pages/Events";
import { listPublicEvents } from "@/lib/events.functions";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/events")({
  loader: () => listPublicEvents(),
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/events", "events.meta.title", "events.meta.description"),
      links: localeLinkTags("/events", locale),
    };
  },
  errorComponent: () => <EventsPage data={{ featured: null, upcoming: [], past: [] }} />,
  component: () => <EventsPage data={Route.useLoaderData()} />,
});