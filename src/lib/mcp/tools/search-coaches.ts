/**
 * MCP tool definition to search the published coach directory with various filters.
 * Exports: default (defineTool). Registered in the internal MCP tool registry.
 */
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, sanitiseSearchText, supabaseForUser, textResult } from "../supabase";

const COLUMNS =
  "profile_id, member_id, full_name, tagline, city, country, credential_slug, services, region_slugs, language_slugs, specialisation_slugs, format_slugs, client_type_slugs, experience_band";

export default defineTool({
  name: "search_coaches",
  title: "Search coaches",
  description:
    "Search the published The Switzerland Chapter of ICF coach directory by free text, canton/region, language, credential (acc, pcc, mcc), specialisation or service (coaching, mentoring, supervision).",
  inputSchema: {
    query: z.string().max(120).optional().describe("Free text matched against name and tagline."),
    region: z.string().max(64).optional().describe("Service-area region slug, e.g. 'zurich'."),
    language: z.string().max(64).optional().describe("Language slug, e.g. 'de', 'fr', 'it', 'en'."),
    credential: z.string().max(16).optional().describe("ICF credential slug: acc, pcc or mcc."),
    specialisation: z.string().max(64).optional().describe("Specialisation slug."),
    service: z
      .enum(["coaching", "mentoring", "supervision"])
      .optional()
      .describe("Restrict to coaches offering this service."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results, default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx).from("coach_directory_public").select(COLUMNS);
    const term = input.query ? sanitiseSearchText(input.query) : "";
    if (term) q = q.or(`full_name.ilike.%${term}%,tagline.ilike.%${term}%`);
    if (input.region) q = q.contains("region_slugs", [input.region]);
    if (input.language) q = q.contains("language_slugs", [input.language]);
    if (input.specialisation) q = q.contains("specialisation_slugs", [input.specialisation]);
    if (input.service) q = q.contains("services", [input.service]);
    if (input.credential) q = q.eq("credential_slug", input.credential.toLowerCase());

    const { data, error } = await q.limit(input.limit ?? 10);
    if (error) return errorResult("Could not search the coach directory.");
    return {
      ...textResult({ count: data?.length ?? 0, coaches: data ?? [] }),
      structuredContent: { coaches: data ?? [] },
    };
  },
});
