/**
 * Public Coach Finder read path.
 *
 * Reads `public.coach_directory_public` only — never the base member tables.
 * The view is the safety boundary: it exposes no email, phone, cst_recno or
 * membership dates, and returns only rows that are eligible *and* published.
 *
 * Region filtering matches declared service areas (`region_slugs`), i.e. the
 * cantons a member chose to work in in person. The imported `city` / `country`
 * columns are reference labels shown on the card and are never filterable —
 * where someone lives is not where they offer to work.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const slugList = z.array(z.string().max(64)).max(32).optional();

const filterSchema = z.object({
  services: slugList,
  regions: slugList,
  languages: slugList,
  specialisations: slugList,
  formats: slugList,
  credentials: slugList,
  page: z.number().int().min(0).max(500).optional(),
});

export type DirectoryFilters = z.infer<typeof filterSchema>;

export type DirectoryEntry =
  Database["public"]["Views"]["coach_directory_public"]["Row"] & {
    /** Short-lived signed URL, minted server-side only. Null when absent. */
    image_url?: string | null;
  };

export type CoachProfileLink = {
  id: string;
  link_type: string;
  label: string | null;
  url: string;
};

export type PublicCoachProfile = DirectoryEntry & { links: CoachProfileLink[] };

export type DirectoryPage = {
  entries: DirectoryEntry[];
  total: number;
  page: number;
  pageSize: number;
};

export const queryCoachDirectory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => filterSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<DirectoryPage> => {
    const { publicSupabaseClient } = await import("./supabase-public.server");
    const { signProfileImages } = await import("./storage.server");
    const supabasePublic = publicSupabaseClient();

    const { data: config } = await supabasePublic
      .from("coach_finder_config")
      .select("page_size, default_sort")
      .maybeSingle();
    const pageSize = config?.page_size ?? 12;
    const page = data.page ?? 0;

    let query = supabasePublic
      .from("coach_directory_public")
      .select("*", { count: "exact" });

    // Every list filter is an OR within the facet and an AND across facets,
    // which is what the wireframe's checkbox groups imply.
    if (data.services?.length) query = query.overlaps("services", data.services);
    if (data.regions?.length) query = query.overlaps("region_slugs", data.regions);
    if (data.languages?.length) query = query.overlaps("language_slugs", data.languages);
    if (data.specialisations?.length) {
      query = query.overlaps("specialisation_slugs", data.specialisations);
    }
    if (data.formats?.length) query = query.overlaps("format_slugs", data.formats);
    if (data.credentials?.length) {
      query = query.in("credential_slug", data.credentials.map((c) => c.toUpperCase()));
    }

    const { data: rows, error, count } = await query
      .order("full_name", { ascending: true })
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) throw error;

    // Sign only the images of the rows on this page.
    const entries = (rows ?? []) as DirectoryEntry[];
    const signed = await signProfileImages(
      entries.map((e) => e.profile_image_path).filter((p): p is string => !!p),
    );
    for (const entry of entries) {
      entry.image_url = entry.profile_image_path
        ? (signed.get(entry.profile_image_path) ?? null)
        : null;
    }

    return { entries, total: count ?? 0, page, pageSize };
  });

/**
 * Public read-only coach detail. The view is queried first: if it returns no
 * row the profile is not published/eligible and we return null before touching
 * anything privileged. Website links are only loaded after that gate passes,
 * and only the public-safe columns are projected.
 */
export const getPublicCoachProfile = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ profileId: z.string().uuid() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<PublicCoachProfile | null> => {
    const { publicSupabaseClient } = await import("./supabase-public.server");
    const { signProfileImages } = await import("./storage.server");
    const supabasePublic = publicSupabaseClient();
    const { data: row, error } = await supabasePublic
      .from("coach_directory_public")
      .select("*")
      .eq("profile_id", data.profileId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;

    const entry = row as DirectoryEntry;
    const signed = entry.profile_image_path
      ? await signProfileImages([entry.profile_image_path])
      : new Map<string, string>();
    entry.image_url = entry.profile_image_path
      ? (signed.get(entry.profile_image_path) ?? null)
      : null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: linkRows } = await supabaseAdmin
      .from("member_profile_websites")
      .select("id, link_type, label, url")
      .eq("profile_id", data.profileId)
      .order("sort_order", { ascending: true });

    const links = (linkRows ?? []).filter((l) => /^https:\/\//i.test(l.url)) as CoachProfileLink[];
    return { ...entry, links };
  });
