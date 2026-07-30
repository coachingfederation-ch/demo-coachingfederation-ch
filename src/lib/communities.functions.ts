/**
 * Public local-communities read path.
 *
 * Communities are `op_projects` rows flagged `is_community`; members come from
 * the same `team_directory_public` view the team page uses, so photos, bios and
 * contact opt-ins behave identically on both surfaces.
 */
import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import type { CommunityDetail, CommunitySummary } from "./communities";

const localeSchema = z.enum(["en", "de", "fr", "it"]);

export const listCommunities = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ locale: localeSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<CommunitySummary[]> => {
    const { buildCommunities } = await import("./communities.server");
    return buildCommunities((data.locale ?? "en") as Locale);
  });

export const getCommunity = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(120), locale: localeSchema.optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<CommunityDetail> => {
    const { buildCommunityDetail } = await import("./communities.server");
    const detail = await buildCommunityDetail(data.slug, (data.locale ?? "en") as Locale);
    if (!detail) throw notFound();
    return detail;
  });

/** Slugs for the sitemap. */
export const listCommunitySlugs = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPublicProjects } = await import("./team.server");
  return (await loadPublicProjects()).filter((p) => p.is_community).map((p) => p.slug);
});
