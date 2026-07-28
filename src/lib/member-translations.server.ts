/**
 * Member profile translations — server-side writes.
 *
 * Everything here resolves the profile from the authenticated user id, exactly
 * like `member-profile.server.ts`, so a caller can only ever reach their own
 * translations. Auto-translation reuses the same Lovable AI gateway and prompt
 * conventions as the Insights article translator.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  FIELD_MAX,
  TRANSLATABLE_FIELDS,
  type ProfileTranslation,
  type ProfileTranslationValues,
  type TranslatableField,
} from "./member-translations";

const LOCALE_NAMES: Record<string, string> = {
  de: "Swiss Standard German (no ß, use ss)",
  fr: "Swiss French",
  it: "Swiss Italian",
  en: "English",
};

const SELECT_COLUMNS = `locale, manually_edited, is_ready, source_updated_at, updated_at, ${TRANSLATABLE_FIELDS.join(", ")}`;

const SOURCE_COLUMNS = `id, primary_locale, content_updated_at, ${TRANSLATABLE_FIELDS.join(", ")}`;

export type MyProfileTranslations = {
  profileId: string;
  primaryLocale: string;
  contentUpdatedAt: string | null;
  source: ProfileTranslationValues;
  rows: ProfileTranslation[];
};

function cleanText(value: string | null | undefined, max: number): string | null {
  if (value == null) return null;
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  return cleaned ? cleaned.slice(0, max) : null;
}

/** The directory profile owned by this auth account. Throws when unbound. */
async function resolveProfile(userId: string) {
  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!member) throw new Error("No member record is linked to this account.");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("member_directory_profiles")
    .select(SOURCE_COLUMNS)
    .eq("member_id", member.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new Error("This member has no directory profile yet.");
  return profile as unknown as {
    id: string;
    primary_locale: string;
    content_updated_at: string;
  } & ProfileTranslationValues;
}

async function readRows(profileId: string): Promise<ProfileTranslation[]> {
  const { data, error } = await supabaseAdmin
    .from("member_profile_translations")
    .select(SELECT_COLUMNS)
    .eq("profile_id", profileId);
  if (error) throw error;
  return (data ?? []) as unknown as ProfileTranslation[];
}

function pack(
  profile: Awaited<ReturnType<typeof resolveProfile>>,
  rows: ProfileTranslation[],
): MyProfileTranslations {
  const source: ProfileTranslationValues = {};
  for (const field of TRANSLATABLE_FIELDS) source[field] = profile[field] ?? null;
  return {
    profileId: profile.id,
    primaryLocale: profile.primary_locale,
    contentUpdatedAt: profile.content_updated_at,
    source,
    rows,
  };
}

export async function loadMyProfileTranslations(userId: string): Promise<MyProfileTranslations> {
  const profile = await resolveProfile(userId);
  return pack(profile, await readRows(profile.id));
}

/** Change the authoring language. Only allowed while no translation exists. */
export async function setMyPrimaryLocale(
  userId: string,
  locale: string,
): Promise<MyProfileTranslations> {
  const profile = await resolveProfile(userId);
  const rows = await readRows(profile.id);
  if (rows.length) {
    throw new Error("Remove the existing translations before changing the primary language.");
  }
  const { error } = await supabaseAdmin
    .from("member_directory_profiles")
    .update({ primary_locale: locale } as never)
    .eq("id", profile.id);
  if (error) throw error;
  return await loadMyProfileTranslations(userId);
}

/**
 * Machine-translate the source profile into one locale and upsert the row as a
 * draft. `is_ready` is deliberately reset to false: a freshly generated
 * translation is never published without the coach looking at it.
 */
export async function autoTranslateMyProfile(
  userId: string,
  locale: string,
): Promise<MyProfileTranslations> {
  const profile = await resolveProfile(userId);
  if (locale === profile.primary_locale) {
    throw new Error("The primary language cannot be translated into itself.");
  }

  const payload: Record<string, string> = {};
  for (const field of TRANSLATABLE_FIELDS) {
    const value = profile[field];
    if (typeof value === "string" && value.trim()) payload[field] = value;
  }
  if (!Object.keys(payload).length) {
    throw new Error("Add some profile text before translating it.");
  }

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Translation service is not configured.");

  const prompt = [
    `Translate this coach profile from ${LOCALE_NAMES[profile.primary_locale] ?? profile.primary_locale} into ${LOCALE_NAMES[locale] ?? locale}.`,
    "Keep the professional, warm first-person tone of a Swiss executive coach.",
    "Do not translate proper nouns such as ICF, ACC, PCC, MCC, Zürich, Lausanne, Lugano.",
    "Keep each field roughly the same length as the original. Do not add content.",
    "Respond with JSON only: an object with exactly the same keys as the input object.",
    "",
    JSON.stringify(payload, null, 2),
  ].join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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

  const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = body.choices?.[0]?.message?.content ?? "";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(
      raw
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim(),
    );
  } catch {
    throw new Error("Translation service returned an unexpected response.");
  }

  const row: Record<string, unknown> = {
    profile_id: profile.id,
    locale,
    manually_edited: false,
    is_ready: false,
    source_updated_at: profile.content_updated_at,
    updated_at: new Date().toISOString(),
  };
  for (const field of TRANSLATABLE_FIELDS) {
    const value = parsed[field];
    row[field] = typeof value === "string" ? cleanText(value, FIELD_MAX[field]) : null;
  }

  const { error } = await supabaseAdmin
    .from("member_profile_translations")
    .upsert(row as never, { onConflict: "profile_id,locale" });
  if (error) throw error;

  return await loadMyProfileTranslations(userId);
}

/**
 * Save a hand-edited translation. Saving always marks the row as manually
 * edited and re-stamps `source_updated_at`, which clears the "outdated" badge:
 * the coach has just reviewed it against the current source.
 */
export async function saveMyProfileTranslation(
  userId: string,
  locale: string,
  values: ProfileTranslationValues,
  isReady?: boolean,
): Promise<MyProfileTranslations> {
  const profile = await resolveProfile(userId);
  const row: Record<string, unknown> = {
    profile_id: profile.id,
    locale,
    manually_edited: true,
    source_updated_at: profile.content_updated_at,
    updated_at: new Date().toISOString(),
  };
  for (const field of TRANSLATABLE_FIELDS) {
    row[field] = cleanText(values[field] ?? null, FIELD_MAX[field as TranslatableField]);
  }
  if (isReady !== undefined) row.is_ready = isReady;

  const { error } = await supabaseAdmin
    .from("member_profile_translations")
    .upsert(row as never, { onConflict: "profile_id,locale" });
  if (error) throw error;
  return await loadMyProfileTranslations(userId);
}

/** Publish or unpublish one language. */
export async function setMyTranslationReady(
  userId: string,
  locale: string,
  isReady: boolean,
): Promise<MyProfileTranslations> {
  const profile = await resolveProfile(userId);
  const { error } = await supabaseAdmin
    .from("member_profile_translations")
    .update({ is_ready: isReady } as never)
    .eq("profile_id", profile.id)
    .eq("locale", locale);
  if (error) throw error;
  return await loadMyProfileTranslations(userId);
}

export async function deleteMyProfileTranslation(
  userId: string,
  locale: string,
): Promise<MyProfileTranslations> {
  const profile = await resolveProfile(userId);
  const { error } = await supabaseAdmin
    .from("member_profile_translations")
    .delete()
    .eq("profile_id", profile.id)
    .eq("locale", locale);
  if (error) throw error;
  return await loadMyProfileTranslations(userId);
}
