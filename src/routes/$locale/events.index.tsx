import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import EventsPage from "@/pages/Events";
import { listPublicEvents } from "@/lib/events.functions";
import { eventsSearchSchema } from "@/lib/events-search";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/events/")({
  validateSearch: zodValidator(eventsSearchSchema),
  loader: ({ params }) => listPublicEvents({ data: { locale: params.locale as Locale } }),
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/events", "events.meta.title", "events.meta.description"),
      links: localeLinkTags("/events", locale),
    };
  },
  errorComponent: () => (
    <EventsPage
      data={{ featured: null, upcoming: [], past: [], categories: [], regions: [] }}
    />
  ),
  component: LocaleEventsRoute,
});

function LocaleEventsRoute() {
  return <EventsPage data={Route.useLoaderData()} />;
}
