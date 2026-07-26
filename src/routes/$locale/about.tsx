import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/pages/About";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/about")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(locale, "/about", "about.meta.title", "about.meta.description"),
      links: localeLinkTags("/about", locale),
    };
  },
  component: AboutPage,
});