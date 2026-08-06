/**
 * Server function to machine-translate articles using AI (Lovable AI Gateway).
 * Exports: translateArticle (createServerFn). Called by components/cms/TranslationsPanel.tsx.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff } from "./authz";

const LOCALE_NAMES: Record<string, string> = {
  de: "Swiss Standard German (no ß, use ss)",
  fr: "Swiss French",
  it: "Swiss Italian",
  en: "English",
};

const inputSchema = z.object({
  articleId: z.string().uuid(),
  locale: z.enum(["de", "fr", "it", "en"]),
});

/** Machine-translates an article into one locale and upserts the translation row. */
export const translateArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Paid AI call: gate on a CMS role, not merely on being signed in. Without
    // this, any authenticated account (e.g. a member) could run up AI spend by
    // translating arbitrary articles; the RLS write-back happens far too late.
    await assertStaff(context);

    const { data: article, error } = await supabase
      .from("articles")
      .select("id, language, title, excerpt, content, content_updated_at")
      .eq("id", data.articleId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!article) throw new Error("Article not found");
    if (article.language === data.locale)
      throw new Error("Source language cannot be translated into itself");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Translation service is not configured");

    const prompt = [
      `Translate the following article from ${LOCALE_NAMES[article.language] ?? article.language} into ${LOCALE_NAMES[data.locale]}.`,
      "Keep Markdown formatting, links and structure exactly as they are.",
      "Use professional, warm editorial tone suitable for the International Coaching Federation Switzerland.",
      "Do not translate proper nouns such as ICF, ACC, PCC, MCC, Zürich, Lausanne, Lugano.",
      'Respond with JSON only, in the shape {"title": "...", "excerpt": "...", "content": "..."}.',
      "",
      `TITLE: ${article.title}`,
      `EXCERPT: ${article.excerpt}`,
      "CONTENT:",
      article.content,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional Swiss editorial translator. You reply with JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) throw new Error("Rate limit reached — please try again shortly.");
    if (response.status === 402)
      throw new Error("AI credits exhausted — please top up the workspace.");
    if (!response.ok) throw new Error(`Translation service error (${response.status})`);

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    let parsed: { title?: string; excerpt?: string; content?: string };
    try {
      parsed = JSON.parse(
        raw
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/, "")
          .trim(),
      );
    } catch {
      throw new Error("Translation service returned an unexpected response");
    }

    const row = {
      article_id: article.id,
      locale: data.locale,
      title: parsed.title ?? article.title,
      excerpt: parsed.excerpt ?? article.excerpt,
      content: parsed.content ?? article.content,
      manually_edited: false,
      source_updated_at: article.content_updated_at,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("article_translations")
      .upsert(row, { onConflict: "article_id,locale" });
    if (upsertError) throw new Error(upsertError.message);

    return row;
  });
