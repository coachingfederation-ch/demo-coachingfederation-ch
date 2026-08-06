/**
 * MCP tool definition to retrieve a full published coach profile by ID.
 * Exports: default (defineTool). Registered in the internal MCP tool registry.
 */
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_coach_profile",
  title: "Get coach profile",
  description:
    "Read one published coach profile in full (about, approach, qualifications, fees, availability, service areas, links) by its profile id from search_coaches.",
  inputSchema: { profile_id: z.string().uuid().describe("profile_id returned by search_coaches.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ profile_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("coach_directory_public")
      .select("*")
      .eq("profile_id", profile_id)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("No published profile with that id.");
    // Storage paths and raw translation blobs are internal plumbing.
    const {
      profile_image_path: _img,
      translations: _tr,
      ...profile
    } = data as Record<string, unknown>;
    return { ...textResult(profile), structuredContent: { profile } };
  },
});
