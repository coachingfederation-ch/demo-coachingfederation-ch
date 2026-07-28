/**
 * Shared search-param contract for the public Coach Finder.
 *
 * `mode` holds the selected finder mode slug (coaching / mentoring /
 * supervision). It is intentionally a plain string with a fallback: which
 * modes exist is configured in `coach_finder_config` at runtime, so an old
 * link pointing at a since-disabled mode must degrade to the first active
 * mode rather than throw or render an empty list.
 */
import { z } from "zod";

// Optional with no default: an absent mode must leave the URL untouched
// (a default would make the router rewrite `/find-a-coach` to `?mode=`).
export const finderSearchSchema = z.object({
  // `.catch()` keeps an invalid value from throwing; `fallback(..., undefined)`
  // from the zod adapter compiles to a non-optional check under Zod 4 and
  // rejects a missing `?mode=` outright.
  mode: z.string().optional().catch(undefined),
});

export type FinderSearch = z.infer<typeof finderSearchSchema>;
