/**
 * Europe Pulse — Firecrawl fetching.
 *
 * Handles pacing, retries and failure classification for scraping a chapter's
 * homepage through the Lovable connector gateway. Pure network I/O: no AI
 * calls and no database access live here.
 */
const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
/**
 * Firecrawl allows roughly 10 scrapes per minute on this plan. The 31 Jul run
 * lost 18 of 29 chapters to HTTP 429 because five chapters were fired at once
 * with no pacing, so throughput is now governed by the pacer below and the
 * batch is only there to overlap network latency.
 */
export const BATCH_SIZE = 2;
/** Scrapes allowed per rolling minute — headroom under the observed limit. */
const SCRAPES_PER_MINUTE = 8;
const MAX_SCRAPE_ATTEMPTS = 3;

export type FailureKind = "rate_limit" | "upstream_error" | "not_found" | "empty_page" | "other";

export type ChapterRow = {
  id: string;
  chapter: string;
  country: string;
  country_code: string;
  base_url: string;
};

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
export async function pacedScrape(url: string): Promise<string> {
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
