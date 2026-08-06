/**
 * Europe Pulse — persistence.
 *
 * Reads and writes the `europe_pulse*` tables: pooling this week's raw scan
 * rows for curation, and the run result shape returned to callers. Database
 * access for the feature is kept out of the crawl/summarise modules.
 */
import { isStillRelevant } from "./summarise.server";
import type { ExtractedItem, PoolItem } from "./summarise.server";

export type PulseRunResult = {
  runId: string;
  status: "succeeded" | "failed";
  weekOf: string;
  chaptersOk: number;
  chaptersFailed: number;
  rawItems: number;
  curatedItems: number;
  error?: string;
};

/**
 * Candidate pool for curation: the newest successful scan per chapter for the
 * given week, across every run of that week. Building it from the stored raw
 * rows (rather than only this run's in-memory results) means a retry run that
 * re-scans three chapters still curates a complete week.
 */
export async function poolForWeek(week: string): Promise<PoolItem[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: runs } = await supabaseAdmin
    .from("europe_pulse_runs")
    .select("id")
    .eq("week_of", week);
  const runIds = (runs ?? []).map((r) => r.id as string);
  if (!runIds.length) return [];

  const { data: raws } = await supabaseAdmin
    .from("europe_pulse_raw")
    .select("chapter, country, chapter_id, extracted_items, scan_date")
    .in("run_id", runIds)
    .eq("status", "ok")
    .order("scan_date", { ascending: false });

  const { data: chapterRows } = await supabaseAdmin
    .from("europe_pulse_chapters")
    .select("id, country_code");
  const codeById = new Map(
    (chapterRows ?? []).map((c) => [c.id as string, c.country_code as string]),
  );

  const seen = new Set<string>();
  const pool: PoolItem[] = [];
  let dropped = 0;
  for (const raw of raws ?? []) {
    const key = (raw.chapter_id as string | null) ?? (raw.chapter as string);
    if (seen.has(key)) continue; // rows are newest-first, so keep the first
    seen.add(key);
    for (const item of (raw.extracted_items ?? []) as ExtractedItem[]) {
      // Rows stored by an earlier run of the same week can have aged out.
      if (!isStillRelevant(item.event_date ?? null)) {
        dropped += 1;
        continue;
      }
      pool.push({
        ...item,
        chapter: raw.chapter as string,
        country: raw.country as string,
        country_code: codeById.get(raw.chapter_id as string) ?? "",
      });
    }
  }
  console.log(`[europe-pulse] pool=${pool.length} dropped_past_or_undated=${dropped}`);
  return pool;
}
