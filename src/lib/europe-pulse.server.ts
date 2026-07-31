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
/**
 * Firecrawl allows roughly 10 scrapes per minute on this plan. The 31 Jul run
 * lost 18 of 29 chapters to HTTP 429 because five chapters were fired at once
 * with no pacing, so throughput is now governed by the pacer below and the
 * batch is only there to overlap network latency.
 */
const BATCH_SIZE = 2;
/** Scrapes allowed per rolling minute — headroom under the observed limit. */
const SCRAPES_PER_MINUTE = 8;
const MAX_SCRAPE_ATTEMPTS = 3;

export type FailureKind =
  | "rate_limit"
  | "upstream_error"
  | "not_found"
  | "empty_page"
  | "other";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Rolling-window pacer. Timestamps of the last minute's scrapes are kept and a
 * caller waits until the oldest one ages out before taking a slot, so bursts
 * cannot exceed the provider's per-minute allowance.
 */
const scrapeTimestamps: number[] = [];
async function takeScrapeSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (scrapeTimestamps.length && now - scrapeTimestamps[0] >= 60_000) scrapeTimestamps.shift();
    if (scrapeTimestamps.length < SCRAPES_PER_MINUTE) {
      scrapeTimestamps.push(now);
      return;
    }
    await sleep(60_000 - (now - scrapeTimestamps[0]) + 250);
  }
}

/** HTTP status carried on scrape failures so the retry logic can classify them. */
class ScrapeError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryAfterMs: number | null = null,
  ) {
    super(message);
    this.name = "ScrapeError";
  }
}

export function classifyFailure(error: unknown): FailureKind {
  const status = error instanceof ScrapeError ? error.status : null;
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (status === 429) return "rate_limit";
  if (status === 404 || status === 410) return "not_found";
  if (status !== null && status >= 500) return "upstream_error";
  if (/returned no readable content/i.test(message)) return "empty_page";
  if (status !== null && status >= 400) return "other";
  return "upstream_error";
}

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
  if (!res.ok) {
    const body = (await res.text()).slice(0, 400);
    throw new ScrapeError(`Firecrawl ${res.status}: ${body}`, res.status, retryAfterMs(res, body));
  }
  const body = (await res.json()) as { markdown?: string; data?: { markdown?: string } };
  return (body.markdown ?? body.data?.markdown ?? "").slice(0, 12000);
}

/** Prefer the provider's own hint: `Retry-After` header, else "retry after 22s". */
function retryAfterMs(res: Response, body: string): number | null {
  const header = Number(res.headers.get("retry-after"));
  if (Number.isFinite(header) && header > 0) return Math.min(header, 90) * 1000;
  const match = /retry after (\d+)\s*s/i.exec(body);
  return match ? Math.min(Number(match[1]), 90) * 1000 : null;
}

/**
 * Paced scrape with bounded retries. 429 waits out the provider's own hint;
 * 5xx and network errors back off exponentially. Other 4xx are configuration
 * problems (bad URL, revoked key) and fail immediately.
 */
async function pacedScrape(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_SCRAPE_ATTEMPTS; attempt += 1) {
    await takeScrapeSlot();
    try {
      return await scrape(url);
    } catch (err) {
      lastError = err;
      const status = err instanceof ScrapeError ? err.status : null;
      const retryable = status === null || status === 429 || status >= 500;
      if (!retryable || attempt === MAX_SCRAPE_ATTEMPTS) break;
      const hinted = err instanceof ScrapeError ? err.retryAfterMs : null;
      const backoff = hinted ?? [2000, 6000, 15000][attempt - 1] ?? 15000;
      const wait = backoff + Math.floor(Math.random() * 750);
      console.warn(
        `[europe-pulse] retry ${attempt}/${MAX_SCRAPE_ATTEMPTS - 1} in ${wait}ms url=${url} status=${status ?? "network"}`,
      );
      await sleep(wait);
    }
  }
  throw lastError;
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