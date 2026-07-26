import { createFileRoute } from "@tanstack/react-router";
import EventsPage from "@/pages/Events";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/events")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/events", "events.meta.title", "events.meta.description"),
      links: localeLinkTags("/events", locale),
    };
  },
  component: EventsPage,
});