import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  locale: z.enum(["en", "de", "fr", "it"]),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  consent: z.boolean().optional(),
  // Honeypot: must stay empty.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type DeckDownloadInput = z.input<typeof schema>;

export const recordDeckDownload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };

    const { publicSupabaseClient } = await import("./supabase-public.server");
    const supabase = publicSupabaseClient();

    const email = data.email?.trim() ? data.email.trim() : null;
    const { error } = await supabase.from("deck_download_leads").insert({
      email,
      locale: data.locale,
      consent: Boolean(data.consent),
      source: "for-organisations",
    });

    if (error) {
      console.error("deck download insert failed", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
