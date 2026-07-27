/**
 * Member Area RPC surface for profile translations. Every call is
 * authenticated and resolves the profile from the bearer token's user id.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const localeSchema = z.enum(["en", "de", "fr", "it"]);

const valuesSchema = z.object({
  tagline: z.string().max(400).nullish(),
  description: z.string().max(6000).nullish(),
  approach: z.string().max(4000).nullish(),
  qualifications: z.string().max(4000).nullish(),
  fees_note: z.string().max(4000).nullish(),
  session_length_note: z.string().max(400).nullish(),
  availability_note: z.string().max(400).nullish(),
  response_time_note: z.string().max(400).nullish(),
  testimonial_quote: z.string().max(1000).nullish(),
  testimonial_attribution: z.string().max(400).nullish(),
});

export const getMyProfileTranslations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadMyProfileTranslations } = await import("./member-translations.server");
    return await loadMyProfileTranslations(context.userId);
  });

export const setMyProfilePrimaryLocale = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ locale: localeSchema }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { setMyPrimaryLocale } = await import("./member-translations.server");
    return await setMyPrimaryLocale(context.userId, data.locale);
  });

export const translateMyProfile = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ locale: localeSchema }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { autoTranslateMyProfile } = await import("./member-translations.server");
    return await autoTranslateMyProfile(context.userId, data.locale);
  });

export const saveMyProfileTranslationFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ locale: localeSchema, values: valuesSchema, isReady: z.boolean().optional() })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { saveMyProfileTranslation } = await import("./member-translations.server");
    return await saveMyProfileTranslation(context.userId, data.locale, data.values, data.isReady);
  });

export const setMyProfileTranslationReady = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ locale: localeSchema, isReady: z.boolean() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { setMyTranslationReady } = await import("./member-translations.server");
    return await setMyTranslationReady(context.userId, data.locale, data.isReady);
  });

export const deleteMyProfileTranslationFn = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ locale: localeSchema }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { deleteMyProfileTranslation } = await import("./member-translations.server");
    return await deleteMyProfileTranslation(context.userId, data.locale);
  });