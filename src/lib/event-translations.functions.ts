/**
 * Machine translation for event copy.
 *
 * Deliberately a near-copy of `translations.functions.ts` (articles): same
 * gateway, same prompt shape, same upsert-on-(id, locale) storage, so editors
 * meet one translation model across the CMS. Only the editorial fields travel
 * — slug, URLs, venue and city stay in the source row.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertOrganizer } from "./authz";

const LOCALE_NAMES: Record<string, string> = {
  de: "Swiss Standard German (no ß, use ss)",
  fr: "Swiss French",
  it: "Swiss Italian",
  en: "English",
};

const inputSchema = z.object({
  eventId: z.string().uuid(),
  locale: z.enum(["de", "fr", "it", "en"]),
});

export const translateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Paid AI call: an account with no event rights must never be able to
    // spend credits here, so gate before touching the gateway.
    await assertOrganizer(context);

    const { data: event, error } = await supabase
      .from("events")
      .select("id, language, title, summary, description, content_updated_at")
      .eq("id", data.eventId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!event) throw new Error("Event not found");
    if (event.language === data.locale)
      throw new Error("Source language cannot be translated into itself");

    const hasSource = [event.title, event.summary, event.description].some(
      (v) => (v ?? "").trim().length > 0,
    );
    if (!hasSource) throw new Error("Add some event text before translating it.");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Translation service is not configured");

    const prompt = [
      `Translate the following event announcement from ${LOCALE_NAMES[event.language] ?? event.language} into ${LOCALE_NAMES[data.locale]}.`,
      "Keep any Markdown formatting, links and paragraph structure exactly as they are.",
      "Use professional, warm editorial tone suitable for the International Coaching Federation Switzerland.",
      "Do not translate proper nouns such as ICF, ACC, PCC, MCC, Zürich, Lausanne, Lugano, venue names or URLs.",
      'Respond with JSON only, in the shape {"title": "...", "summary": "...", "description": "..."}.',
      "",
      `TITLE: ${event.title}`,
      `SUMMARY: ${event.summary ?? ""}`,
      "DESCRIPTION:",
      event.description ?? "",
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
    let parsed: { title?: string; summary?: string; description?: string };
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

    const blank = (v: string | undefined | null) => {
      const trimmed = (v ?? "").trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const row = {
      event_id: event.id,
      locale: data.locale,
      title: blank(parsed.title) ?? event.title,
      summary: blank(parsed.summary),
      description: blank(parsed.description),
      manually_edited: false,
      source_updated_at: event.content_updated_at,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("event_translations")
      .upsert(row, { onConflict: "event_id,locale" });
    if (upsertError) throw new Error(upsertError.message);

    return row;
  });
