/**
 * MCP tool definition to read the full markdown content of a published article.
 * Exports: default (defineTool). Registered in the internal MCP tool registry.
 */
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_insight",
  title: "Read an insights article",
  description: "Read the full markdown body of one published Insights article by its id.",
  inputSchema: { id: z.string().uuid().describe("Article id returned by list_insights.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("articles")
      .select("id, title, excerpt, content, category, language, published_at")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("No published article with that id.");
    return { ...textResult(data), structuredContent: { article: data } };
  },
});
