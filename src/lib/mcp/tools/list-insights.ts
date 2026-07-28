import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_insights",
  title: "List insights articles",
  description:
    "List published The Switzerland Chapter of ICF Insights articles (title, excerpt, category, language, publication date), newest first.",
  inputSchema: {
    language: z.enum(["en", "de", "fr", "it"]).optional().describe("Article language."),
    query: z.string().max(120).optional().describe("Free text matched against title and excerpt."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results, default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx)
      .from("articles")
      .select("id, title, excerpt, category, language, published_at, featured_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (input.language) q = q.eq("language", input.language);
    if (input.query) q = q.or(`title.ilike.%${input.query}%,excerpt.ilike.%${input.query}%`);

    const { data, error } = await q.limit(input.limit ?? 10);
    if (error) return errorResult(error.message);
    return {
      ...textResult({ count: data?.length ?? 0, articles: data ?? [] }),
      structuredContent: { articles: data ?? [] },
    };
  },
});
