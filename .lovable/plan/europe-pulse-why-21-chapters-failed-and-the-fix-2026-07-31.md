# Europe Pulse: why 21 chapters failed, and the fix

## What the run data shows

Failures from the 31 Jul manual run, grouped by cause:

| Cause | Chapters | Who |
|---|---|---|
| Firecrawl 429 rate limit | 18 | Greece, Hungary, Iceland, Ireland, Italy, Latvia, Lithuania, Luxembourg, Netherlands, Norway, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, Turkey, United Kingdom |
| Firecrawl 502 Bad Gateway | 2 | Finland, Poland |
| Firecrawl 503 upstream reset | 1 | Czech Republic |
| Succeeded | 8 | Austria, Belgium, Bulgaria, Cyprus, Denmark, Estonia, France, Germany |

So this is not 21 separate site problems. It is one systemic problem plus three transient ones.

**The systemic cause (18 of 21).** The Firecrawl error text is explicit: "Consumed (req/min): 11 … Remaining: 0 … retry after 22s". The account's scrape allowance is roughly 10 requests per minute. The scanner fires chapters in batches of 5 with no pause between batches and no retry, so after the first two batches every remaining chapter is refused within the same minute. The chapters that succeeded are simply the ones that happened to run first — alphabetically Austria through Germany. Nothing is wrong with the other 18 sites.

**The transient causes (3 of 21).** 502 and 503 are Firecrawl-side or origin-side hiccups on a single attempt. With no retry, one bad moment loses the chapter for the whole week.

## Remedy

### 1. Respect the rate limit (fixes the 18)

In `src/lib/europe-pulse.server.ts`:
- Add a small request pacer around the Firecrawl call: a shared queue that allows at most N scrapes per rolling 60 seconds, N configurable and defaulting to 8 (headroom under the observed 10).
- Reduce `BATCH_SIZE` to 2 and let the pacer, not the batch size, control throughput.
- Expected run time for 29 chapters goes from ~1 minute to roughly 4 minutes. That is fine for a weekly cron; the CMS "Run scan now" button gets progress feedback (below).

### 2. Retry with backoff (fixes the 3, and any future 429)

- Wrap `scrape()` in a retry helper: up to 3 attempts for 429, 502, 503, 504 and network errors.
- On 429, parse the `retry after Ns` value from the error body and wait that long; otherwise exponential backoff (2s, 6s, 15s) with jitter.
- Do not retry 4xx other than 429 — a 401/404 is a real configuration problem, not a blip.

### 3. Second-chance pass

After the main loop, re-attempt any chapter that still failed, once, at the end of the run. Cheap insurance against a site that was briefly down.

### 4. Make failures visible and actionable

- Store a short failure `kind` (`rate_limit`, `upstream_error`, `not_found`, `empty_page`, `other`) alongside the existing message in `europe_pulse_raw`, and keep `last_status` on the chapter row as that kind.
- In `/manage/europe-pulse`, show a "Failed chapters" list for the latest run with chapter, kind and message, plus a "Retry failed chapters" button that re-runs only those.
- Auto-flag chronic failures: if a chapter fails the same way three runs in a row, mark it in the CMS list so staff can fix or deactivate the URL.

### 5. Capacity note

If Firecrawl usage grows (more chapters, or sub-pages per chapter), the durable fix is a higher Firecrawl plan rather than ever-slower pacing. Current volume fits comfortably inside the free/low tier once paced.

## Not doing

No change to the AI curation pass, the schema of `europe_pulse`, the public feed, or the cron schedule. The weekly job simply takes a few minutes longer and returns ~29/29 chapters instead of 8/29.

## Technical detail

- `src/lib/europe-pulse.server.ts`: new `rateLimitedScrape()` (token-bucket pacer + retry/backoff + `Retry-After` parsing), `BATCH_SIZE` 5 → 2, second-chance pass over failed chapters, classify errors into a `kind`.
- Migration: add `failure_kind text` to `europe_pulse_raw`; optional `consecutive_failures int` on `europe_pulse_chapters`.
- `src/lib/europe-pulse.functions.ts`: server fn to retry only the failed chapters of a given run (admin-guarded, same pattern as the existing manual run).
- `src/routes/_staff/manage.europe-pulse.tsx`: failed-chapter panel + retry button.
- Logging already added: the paced run will emit per-batch progress so a long run is followable in the Logs section.

## PR note

**Summary** — The weekly Europe Pulse scan lost 21 of 29 chapters because it exceeded the Firecrawl per-minute rate limit; this paces requests, retries transient failures and surfaces the remainder in the CMS.

**Changes** — Backend: request pacer, retry/backoff, second-chance pass, error classification in the scan engine. UI: failed-chapter panel and retry action in the Europe Pulse control room.

**Backend / Schema changes** — One small migration adding `failure_kind` to `europe_pulse_raw` and a failure counter on `europe_pulse_chapters`. No RLS change.

**Testing & Verification** — Run a manual scan from the CMS and confirm chapters ok is ~29/29 with no 429 in the logs; confirm run duration and that the retry button clears any stragglers.

**Risks & Rollback** — Longer run time is the main tradeoff; if a run ever exceeds the request timeout, lower the chapter count or raise the Firecrawl plan. Revert the commit and migration independently — the code tolerates the extra column being present or absent.

**Follow-ups** — Chronic-failure flagging and per-chapter sub-page scanning (events pages, not just homepages) are deliberately out of scope here.
