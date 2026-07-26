import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/pages/Home";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: localeMeta("en", "/", "home.meta.title", "home.meta.description"),
    links: localeLinkTags("/", "en"),
  }),
  component: HomePage,
});
