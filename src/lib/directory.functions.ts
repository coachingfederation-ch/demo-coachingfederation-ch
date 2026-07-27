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
import { createClient } from "@supabase/supabase-js";
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
  Database["public"]["Views"]["coach_directory_public"]["Row"];

export type DirectoryPage = {
  entries: DirectoryEntry[];
  total: number;
  page: number;
  pageSize: number;
};

export const queryCoachDirectory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => filterSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<DirectoryPage> => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabasePublic = createClient<Database>(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Opaque sb_ publishable keys are not JWTs; PostgREST rejects them as
        // a bearer token, so send them as `apikey` only.
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

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

    return { entries: (rows ?? []) as DirectoryEntry[], total: count ?? 0, page, pageSize };
  });
