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
 */
import { weekStart, PULSE_TYPES, type PulseType } from "./europe-pulse";

const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";
/** Chapters are scraped in small batches so one slow site cannot stall the run. */
const BATCH_SIZE = 5;

type ChapterRow = {
  id: string;
  chapter: string;
  country: string;
  country_code: string;
  base_url: string;
};

type ExtractedItem = {
  title: string;
  description: string | null;
  url: string;
  type: PulseType;
  event_date: string | null;
};

type PoolItem = ExtractedItem & { chapter: string; country: string; country_code: string };

type CuratedItem = PoolItem & {
  title_de: string | null;
  title_fr: string | null;
  title_it: string | null;
  description_de: string | null;
  description_fr: string | null;
  description_it: string | null;
};

function asType(value: unknown): PulseType {
  const v = String(value ?? "").toLowerCase();
  return (PULSE_TYPES as readonly string[]).includes(v) ? (v as PulseType) : "news";
}

function asDate(value: unknown): string | null {
  const v = String(value ?? "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

function absoluteUrl(raw: unknown, base: string): string | null {
  try {
    const url = new URL(String(raw ?? ""), base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** One AI call, JSON mode. Throws with the gateway status on failure. */
async function askAi(system: string, user: string): Promise<unknown> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { choices: { message: { content: string } }[] };
  const text = body.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
}

/** Firecrawl scrape of one page, through the gateway. Returns markdown. */
async function scrape(url: string): Promise<string> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!lovableKey || !firecrawlKey) throw new Error("Firecrawl connector is not configured");
  const res = await fetch(`${GATEWAY}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": firecrawlKey,
    },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, waitFor: 1500 }),
  });
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { markdown?: string; data?: { markdown?: string } };
  return (body.markdown ?? body.data?.markdown ?? "").slice(0, 12000);
}

async function extractItems(chapter: ChapterRow, markdown: string): Promise<ExtractedItem[]> {
  if (markdown.trim().length < 200) return [];
  const parsed = (await askAi(
    "You read the homepage of a national chapter of the International Coaching Federation and " +
      "extract concrete, dated or clearly announced activities: events, webinars, workshops, " +
      "conferences and chapter news. Ignore navigation, membership boilerplate, cookie notices " +
      "and evergreen marketing copy. Translate every title and description into concise English. " +
      'Reply as {"items":[{"title","description","url","type","event_date"}]} with at most 5 items. ' +
      '"type" is one of event, news, webinar, workshop, conference. "event_date" is YYYY-MM-DD or null. ' +
      '"url" is the most specific link you saw for the item, or the page URL. ' +
      "Descriptions are at most 220 characters. Reply with JSON only, and an empty array if nothing qualifies.",
    `Chapter: ${chapter.chapter} (${chapter.country})\nPage URL: ${chapter.base_url}\n\n${markdown}`,
  )) as { items?: unknown[] };

  return (parsed.items ?? [])
    .map((raw) => {
      const item = raw as Record<string, unknown>;
      const title = String(item.title ?? "").trim();
      if (!title) return null;
      const description = String(item.description ?? "").trim();
      return {
        title: title.slice(0, 200),
        description: description ? description.slice(0, 300) : null,
        url: absoluteUrl(item.url, chapter.base_url) ?? chapter.base_url,
        type: asType(item.type),
        event_date: asDate(item.event_date),
      } satisfies ExtractedItem;
    })
    .filter((i): i is ExtractedItem => i !== null);
}

/** Rank the pooled items down to `cap` and translate them into DE/FR/IT. */
async function curate(
  pool: PoolItem[],
  cap: number,
  maxPerChapter: number,
): Promise<CuratedItem[]> {
  if (!pool.length) return [];
  const indexed = pool.map((item, index) => ({ index, ...item }));
  const parsed = (await askAi(
    "You curate a weekly digest of what ICF chapters across Europe are doing, for the Swiss " +
      "chapter's members. From the candidate list, pick the most relevant, concrete and " +
      `newsworthy items — at most ${cap} in total and at most ${maxPerChapter} per chapter — ` +
      "favouring upcoming events and genuine chapter news over generic pages, and spreading the " +
      "selection across as many countries as possible. Then translate each chosen title and " +
      "description into Swiss Standard German (never use ß), Swiss French and Swiss Italian; keep " +
      "chapter names, place names and the credentials ACC/PCC/MCC untranslated. " +
      'Reply as {"items":[{"index","type","title_en","description_en","title_de","description_de",' +
      '"title_fr","description_fr","title_it","description_it"}]} ordered best first, where "index" ' +
      "is the candidate's index. Keep descriptions under 220 characters. Reply with JSON only.",
    JSON.stringify(indexed),
  )) as { items?: unknown[] };

  const chosen: CuratedItem[] = [];
  const perChapter = new Map<string, number>();
  for (const raw of parsed.items ?? []) {
    const item = raw as Record<string, unknown>;
    const source = pool[Number(item.index)];
    if (!source) continue;
    const used = perChapter.get(source.chapter) ?? 0;
    if (used >= maxPerChapter) continue;
    if (chosen.length >= cap) break;
    perChapter.set(source.chapter, used + 1);
    const text = (key: string, fallback: string | null) => {
      const value = String(item[key] ?? "").trim();
      return value ? value.slice(0, 300) : fallback;
    };
    chosen.push({
      ...source,
      type: asType(item.type ?? source.type),
      title: text("title_en", source.title) ?? source.title,
      description: text("description_en", source.description),
      title_de: text("title_de", null),
      title_fr: text("title_fr", null),
      title_it: text("title_it", null),
      description_de: text("description_de", null),
      description_fr: text("description_fr", null),
      description_it: text("description_it", null),
    });
  }
  return chosen;
}

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
 * Run a full scan + curation cycle. Safe to call from cron or from the CMS
 * button; a run always closes out its `europe_pulse_runs` row.
 */
export async function runEuropePulse(options: {
  triggerSource: "cron" | "manual";
  triggeredBy?: string | null;
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

  const { data: chapterRows } = await supabaseAdmin
    .from("europe_pulse_chapters")
    .select("id, chapter, country, country_code, base_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
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
  const pool: PoolItem[] = [];

  try {
    for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
      const batch = chapters.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (chapter) => {
          try {
            const markdown = await scrape(chapter.base_url);
            const items = await extractItems(chapter, markdown);
            return { chapter, items, error: null as string | null };
          } catch (err) {
            return {
              chapter,
              items: [] as ExtractedItem[],
              error: err instanceof Error ? err.message : "scan failed",
            };
          }
        }),
      );

      for (const result of results) {
        if (result.error) failed += 1;
        else ok += 1;
        for (const item of result.items) {
          pool.push({
            ...item,
            chapter: result.chapter.chapter,
            country: result.chapter.country,
            country_code: result.chapter.country_code,
          });
        }
        await supabaseAdmin.from("europe_pulse_raw").insert({
          run_id: runId,
          chapter_id: result.chapter.id,
          chapter: result.chapter.chapter,
          country: result.chapter.country,
          source_urls: [result.chapter.base_url],
          status: result.error ? "failed" : "ok",
          error_message: result.error,
          extracted_items: result.items,
        });
        await supabaseAdmin
          .from("europe_pulse_chapters")
          .update({
            last_status: result.error ? "failed" : "ok",
            last_scanned_at: new Date().toISOString(),
          })
          .eq("id", result.chapter.id);
      }
    }

    const curated = await curate(pool, cap, maxPerChapter);

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