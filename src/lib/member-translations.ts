/**
 * Client-safe vocabulary for member profile translations.
 *
 * A coach profile is authored in one `primary_locale`. Every other language is
 * an *opt-in* row in `member_profile_translations`; nothing is generated
 * automatically. This module owns the two things both sides of the wire need:
 * which fields are translatable, and how a row's editorial state is derived.
 */
import type { Locale } from "@/i18n/config";

/** The free-text fields a coach can have in more than one language. */
export const TRANSLATABLE_FIELDS = [
  "tagline",
  "description",
  "approach",
  "qualifications",
  "fees_note",
  "session_length_note",
  "availability_note",
  "response_time_note",
  "testimonial_quote",
  "testimonial_attribution",
  // Volunteer bio for the public team page. Only members who hold `editor`
  // (i.e. are part of the operational structure) ever see or fill this in.
  "team_bio",
] as const;

export type TranslatableField = (typeof TRANSLATABLE_FIELDS)[number];

/** Fields that belong to the operational-structure (team) surface, not the coach profile. */
export const TEAM_FIELDS: TranslatableField[] = ["team_bio"];

/** Per-field character caps, mirroring the source-profile limits. */
export const FIELD_MAX: Record<TranslatableField, number> = {
  tagline: 160,
  description: 3000,
  approach: 2000,
  qualifications: 2000,
  fees_note: 2000,
  session_length_note: 120,
  availability_note: 120,
  response_time_note: 120,
  testimonial_quote: 400,
  testimonial_attribution: 120,
  team_bio: 2000,
};

/** Fields that get a multi-line control in the editor. */
export const LONG_FIELDS: TranslatableField[] = [
  "description",
  "approach",
  "qualifications",
  "fees_note",
  "testimonial_quote",
  "team_bio",
];

export type ProfileTranslationValues = Partial<Record<TranslatableField, string | null>>;

export type ProfileTranslation = ProfileTranslationValues & {
  locale: string;
  manually_edited: boolean;
  is_ready: boolean;
  source_updated_at: string;
  updated_at: string;
};

/**
 * Editorial state of one language.
 *
 * `outdated` is orthogonal to the others but wins in the badge, because it is
 * the only state that asks the coach to do something.
 */
export type TranslationState = "missing" | "auto_draft" | "edited_draft" | "published" | "outdated";

export function translationState(
  row: ProfileTranslation | undefined,
  contentUpdatedAt: string | null,
): TranslationState {
  if (!row) return "missing";
  if (contentUpdatedAt && new Date(row.source_updated_at) < new Date(contentUpdatedAt)) {
    return "outdated";
  }
  if (row.is_ready) return "published";
  return row.manually_edited ? "edited_draft" : "auto_draft";
}

type SourceLike = ProfileTranslationValues & {
  primary_locale?: string | null;
  translations?: unknown;
};

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Overlay a published translation on top of the primary-language row.
 *
 * Resolution is per field, so a partially translated profile is never shown
 * half-empty: any blank translated field simply falls back to the source.
 * `resolvedLocale` reports the language the visitor is actually reading.
 */
export function resolveProfileLocale<T extends SourceLike>(
  row: T,
  locale: Locale,
): T & { resolvedLocale: string; translatedLocales: string[] } {
  const bag = (row.translations ?? {}) as Record<string, ProfileTranslationValues>;
  const translatedLocales = Object.keys(bag);
  const primary = row.primary_locale ?? "en";
  if (locale === primary) {
    return { ...row, resolvedLocale: primary, translatedLocales };
  }
  const match = bag[locale];
  if (!match) return { ...row, resolvedLocale: primary, translatedLocales };

  const merged = { ...row } as T & Record<string, unknown>;
  for (const field of TRANSLATABLE_FIELDS) {
    if (nonEmpty(match[field])) merged[field] = match[field];
  }
  return { ...merged, resolvedLocale: locale, translatedLocales };
}
