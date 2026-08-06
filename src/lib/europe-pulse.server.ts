/**
 * Europe Pulse — weekly scan and AI curation.
 *
 * Stage 1 (scan): Firecrawl scrapes each active chapter's homepage through the
 * Lovable connector gateway; the markdown is handed to a small AI extraction
 * pass that pulls out up to five concrete items per chapter. Everything it
 * finds is stored verbatim in `europe_pulse_raw` so a bad week can be audited
 * without re-scraping.
 *
 * Stage 2 (curate): one AI pass ranks the pooled items down to the configured
 * cap, normalises the type, and translates title + description into DE/FR/IT.
 * The result is written to `europe_pulse`, published straight away in
 * `automatic` mode or held as `pending` in `manual` mode.
 *
 * Kept out of any `*.functions.ts` module scope on purpose: that scope is
 * bundled for the browser and this file holds server-only credentials.
 *
 * The crawl, AI summarisation and persistence concerns are split into
 * `europe-pulse/{crawl,summarise,store}.server.ts`; this module is the
 * orchestrator that wires them together into one run.
 */
import { weekStart } from "./europe-pulse";
import {
  BATCH_SIZE,
  pacedScrape,
  classifyFailure,
  type ChapterRow,
  type FailureKind,
} from "./europe-pulse/crawl.server";
import {
  extractItems,
  curate,
  type ExtractedItem,
  type PoolItem,
} from "./europe-pulse/summarise.server";
import { poolForWeek, type PulseRunResult } from "./europe-pulse/store.server";

export type { FailureKind } from "./europe-pulse/crawl.server";
export { classifyFailure } from "./europe-pulse/crawl.server";
export type { PulseRunResult } from "./europe-pulse/store.server";

/**
 * Run a full scan + curation cycle. Safe to call from cron or from the CMS
 * button; a run always closes out its `europe_pulse_runs` row.
 */
export async function runEuropePulse(options: {
  triggerSource: "cron" | "manual";
  triggeredBy?: string | null;
  /** Retry mode: scan only these chapters, then re-curate the whole week. */
  chapterIds?: string[];
}): Promise<PulseRunResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const week = weekStart();

  const { data: config } = await supabaseAdmin
    .from("europe_pulse_config")
    .select("publish_mode, item_cap, max_per_chapter")
    .eq("id", true)
    .maybeSingle();
  const cap = config?.item_cap ?? 30;
  const maxPerChapter = config?.max_per_chapter ?? 2;
  const publishMode = config?.publish_mode ?? "automatic";

  let chapterQuery = supabaseAdmin
    .from("europe_pulse_chapters")
    .select("id, chapter, country, country_code, base_url")
    .eq("is_active", true);
  if (options.chapterIds?.length) chapterQuery = chapterQuery.in("id", options.chapterIds);
  const { data: chapterRows } = await chapterQuery.order("sort_order", { ascending: true });
  const chapters = (chapterRows ?? []) as ChapterRow[];

  const { data: runRow, error: runError } = await supabaseAdmin
    .from("europe_pulse_runs")
    .insert({
      week_of: week,
      trigger_source: options.triggerSource,
      triggered_by: options.triggeredBy ?? null,
      chapters_total: chapters.length,
    })
    .select("id")
    .single();
  if (runError || !runRow) throw runError ?? new Error("Could not start a Europe Pulse run");
  const runId = runRow.id as string;

  let ok = 0;
  let failed = 0;
  const stillFailing: ChapterRow[] = [];
  let pool: PoolItem[] = [];

  console.log(
    `[europe-pulse] run=${runId} week=${week} chapters=${chapters.length} trigger=${options.triggerSource}`,
  );

  /** Scan one chapter and record the outcome; returns true when it worked. */
  const scanChapter = async (chapter: ChapterRow): Promise<boolean> => {
    let items: ExtractedItem[] = [];
    let error: string | null = null;
    let kind: FailureKind | null = null;
    try {
      const markdown = await pacedScrape(chapter.base_url);
      items = await extractItems(chapter, markdown);
    } catch (err) {
      error = err instanceof Error ? err.message : "scan failed";
      kind = classifyFailure(err);
      console.warn(
        `[europe-pulse] chapter failed chapter=${JSON.stringify(chapter.chapter)} kind=${kind} error=${JSON.stringify(error.slice(0, 200))}`,
      );
    }

    await supabaseAdmin.from("europe_pulse_raw").insert({
      run_id: runId,
      chapter_id: chapter.id,
      chapter: chapter.chapter,
      country: chapter.country,
      source_urls: [chapter.base_url],
      status: error ? "failed" : "ok",
      error_message: error,
      failure_kind: kind,
      extracted_items: items,
    });

    // A run-over-run failure counter makes a chronically broken URL obvious in
    // the CMS, instead of it looking like this week's transient blip.
    const { data: current } = await supabaseAdmin
      .from("europe_pulse_chapters")
      .select("consecutive_failures")
      .eq("id", chapter.id)
      .maybeSingle();
    await supabaseAdmin
      .from("europe_pulse_chapters")
      .update({
        last_status: kind ?? "ok",
        last_scanned_at: new Date().toISOString(),
        consecutive_failures: error ? (current?.consecutive_failures ?? 0) + 1 : 0,
      })
      .eq("id", chapter.id);

    return !error;
  };

  try {
    for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
      const batch = chapters.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map((chapter) => scanChapter(chapter)));
      results.forEach((succeeded, index) => {
        if (succeeded) ok += 1;
        else stillFailing.push(batch[index]);
      });
      failed = stillFailing.length;
      console.log(
        `[europe-pulse] scanned ${Math.min(i + BATCH_SIZE, chapters.length)}/${chapters.length} ok=${ok} failed=${failed}`,
      );
    }

    // Second chance: a site that was briefly down should not cost the whole
    // week. One extra attempt per still-failing chapter, after the main pass.
    if (stillFailing.length) {
      console.log(`[europe-pulse] second-chance pass chapters=${stillFailing.length}`);
      const retries = [...stillFailing];
      stillFailing.length = 0;
      for (const chapter of retries) {
        if (await scanChapter(chapter)) ok += 1;
        else stillFailing.push(chapter);
      }
      failed = stillFailing.length;
    }

    pool = await poolForWeek(week);
    const curated = await curate(pool, cap, maxPerChapter);
    console.log(
      `[europe-pulse] curated items=${curated.length} from pool=${pool.length} mode=${publishMode}`,
    );

    // Only the current week is shown, so this week's rows are replaced
    // wholesale rather than merged — a re-run is idempotent.
    await supabaseAdmin.from("europe_pulse").delete().eq("week_of", week);
    if (curated.length) {
      const status = publishMode === "automatic" ? "published" : "pending";
      const { error: insertError } = await supabaseAdmin.from("europe_pulse").insert(
        curated.map((item, index) => ({
          run_id: runId,
          week_of: week,
          chapter: item.chapter,
          country: item.country,
          country_code: item.country_code,
          type: item.type,
          title_en: item.title,
          title_de: item.title_de,
          title_fr: item.title_fr,
          title_it: item.title_it,
          description_en: item.description,
          description_de: item.description_de,
          description_fr: item.description_fr,
          description_it: item.description_it,
          url: item.url,
          event_date: item.event_date,
          status,
          sort_rank: index,
        })),
      );
      if (insertError) throw insertError;
    }

    await supabaseAdmin
      .from("europe_pulse_runs")
      .update({
        status: "succeeded",
        chapters_ok: ok,
        chapters_failed: failed,
        raw_items: pool.length,
        curated_items: curated.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return {
      runId,
      status: "succeeded",
      weekOf: week,
      chaptersOk: ok,
      chaptersFailed: failed,
      rawItems: pool.length,
      curatedItems: curated.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Europe Pulse run failed";
    console.error(`[europe-pulse] run=${runId} failed error=${JSON.stringify(message)}`);
    await supabaseAdmin
      .from("europe_pulse_runs")
      .update({
        status: "failed",
        chapters_ok: ok,
        chapters_failed: failed,
        raw_items: pool.length,
        error_message: message.slice(0, 1000),
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    return {
      runId,
      status: "failed",
      weekOf: week,
      chaptersOk: ok,
      chaptersFailed: failed,
      rawItems: pool.length,
      curatedItems: 0,
      error: message,
    };
  }
}
