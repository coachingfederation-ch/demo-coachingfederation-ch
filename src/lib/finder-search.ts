/**
 * Shared search-param contract for the public Coach Finder.
 *
 * `mode` holds the selected finder mode slug (coaching / mentoring /
 * supervision). It is intentionally a plain string with a fallback: which
 * modes exist is configured in `coach_finder_config` at runtime, so an old
 * link pointing at a since-disabled mode must degrade to the first active
 * mode rather than throw or render an empty list.
 */
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

export const finderSearchSchema = z.object({
  mode: fallback(z.string(), "").default(""),
});

export type FinderSearch = z.infer<typeof finderSearchSchema>;
