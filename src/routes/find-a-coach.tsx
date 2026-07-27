import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import FindACoachPage from "@/pages/FindACoach";
import { localeLinkTags, localeMeta } from "@/i18n";

export const finderSearchSchema = z.object({
  mode: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/find-a-coach")({
  validateSearch: zodValidator(finderSearchSchema),
  head: () => ({
    meta: localeMeta("en", "/find-a-coach", "directory.meta.title", "directory.meta.description"),
    links: localeLinkTags("/find-a-coach", "en"),
  }),
  component: FindACoachPage,
});