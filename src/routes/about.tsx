import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/pages/About";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: localeMeta("en", "/about", "about.meta.title", "about.meta.description"),
    links: localeLinkTags("/about", "en"),
  }),
  component: AboutPage,
});
