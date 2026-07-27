/**
 * Coach Finder controlled vocabularies.
 *
 * These lists (regions, specialisations, credentials, formats, languages,
 * availability labels) used to be hardcoded constants in `@/lib/coaches`.
 * They now live in the database so admins/editors can manage them from the
 * CMS, and every consumer — public filters and, later, member profiles —
 * reads the same rows.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n/config";

export const VOCAB_TABLES = [
  "cf_regions",
  "cf_specialisations",
  "cf_credentials",
  "cf_formats",
  "cf_languages",
  "cf_availability_labels",
  "cf_client_types",
] as const;

export type VocabTable = (typeof VOCAB_TABLES)[number];

export type VocabRow = {
  id: string;
  slug: string;
  name: string;
  name_de: string | null;
  name_fr: string | null;
  name_it: string | null;
  sort_order: number;
  is_active: boolean;
};

export const VOCAB_COLUMNS = "id, slug, name, name_de, name_fr, name_it, sort_order, is_active";

/** Admin-facing descriptor: drives the generic vocabulary editor screen. */
export const VOCAB_DESCRIPTORS: { table: VocabTable; key: string }[] = [
  { table: "cf_regions", key: "regions" },
  { table: "cf_specialisations", key: "specialisations" },
  { table: "cf_credentials", key: "credentials" },
  { table: "cf_formats", key: "formats" },
  { table: "cf_languages", key: "languages" },
  { table: "cf_availability_labels", key: "availability" },
  { table: "cf_client_types", key: "clientTypes" },
];

/** Locale-aware label with a graceful fallback to the English name. */
export function vocabLabel(row: VocabRow, locale: Locale): string {
  if (locale === "de") return row.name_de || row.name;
  if (locale === "fr") return row.name_fr || row.name;
  if (locale === "it") return row.name_it || row.name;
  return row.name;
}

export function slugifyVocab(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Rows for one vocabulary. `activeOnly` is what the public site uses. */
export async function fetchVocabulary(
  table: VocabTable,
  options: { activeOnly?: boolean } = {},
): Promise<VocabRow[]> {
  let query = supabase.from(table).select(VOCAB_COLUMNS).order("sort_order", { ascending: true });
  if (options.activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as VocabRow[];
}

export type CoachFinderVocabularies = Record<VocabTable, VocabRow[]>;

/** All lists in one round trip, active rows only — for the public filters. */
export async function fetchActiveVocabularies(): Promise<CoachFinderVocabularies> {
  const results = await Promise.all(VOCAB_TABLES.map((t) => fetchVocabulary(t, { activeOnly: true })));
  return Object.fromEntries(
    VOCAB_TABLES.map((table, i) => [table, results[i]!]),
  ) as CoachFinderVocabularies;
}

/**
 * Years-of-experience bands. A short fixed list rather than a vocabulary
 * table: it is a scale, not chapter-managed content, and it is labelled
 * through i18n like the other fixed enums.
 */
export const EXPERIENCE_BANDS = ["0-2", "3-5", "6-10", "10+"] as const;
export type ExperienceBand = (typeof EXPERIENCE_BANDS)[number];

export type CoachFinderConfig = {
  coaching_enabled: boolean;
  mentoring_enabled: boolean;
  supervision_enabled: boolean;
  coaching_label: string;
  mentoring_label: string;
  supervision_label: string;
  default_sort: string;
  page_size: number;
  feed_drop_threshold_pct: number;
  snapshot_retention_months: number;
  csv_export_row_cap: number;
};

export const CONFIG_COLUMNS =
  "coaching_enabled, mentoring_enabled, supervision_enabled, coaching_label, mentoring_label, supervision_label, default_sort, page_size, feed_drop_threshold_pct, snapshot_retention_months, csv_export_row_cap";

export async function fetchCoachFinderConfig(): Promise<CoachFinderConfig | null> {
  const { data, error } = await supabase
    .from("coach_finder_config")
    .select(CONFIG_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return (data as CoachFinderConfig | null) ?? null;
}

/**
 * Finder modes ("coaching" / "mentoring" / "supervision") are the service
 * slugs emitted by the `coach_directory_public.services` array. Which ones
 * exist publicly, and what they are called, is owned entirely by
 * `coach_finder_config` — the public UI never hardcodes tabs.
 */
export type FinderModeSlug = "coaching" | "mentoring" | "supervision";

export type FinderMode = { slug: FinderModeSlug; label: string };

const FINDER_MODE_FIELDS: {
  slug: FinderModeSlug;
  enabled: keyof CoachFinderConfig;
  label: keyof CoachFinderConfig;
}[] = [
  { slug: "coaching", enabled: "coaching_enabled", label: "coaching_label" },
  { slug: "mentoring", enabled: "mentoring_enabled", label: "mentoring_label" },
  { slug: "supervision", enabled: "supervision_enabled", label: "supervision_label" },
];

/** Enabled modes in fixed order, labelled from the configured label fields. */
export function activeFinderModes(config: CoachFinderConfig | null | undefined): FinderMode[] {
  if (!config) return [];
  return FINDER_MODE_FIELDS.filter((f) => config[f.enabled] === true).map((f) => ({
    slug: f.slug,
    label: String(config[f.label] ?? "").trim() || f.slug,
  }));
}