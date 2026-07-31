# PR: Europe Pulse — cron, logging, scan reliability and failure recovery

Everything landed after the initial Europe Pulse CMS UI.

## Summary

Europe Pulse now runs unattended: a weekly pg_cron job triggers the scan, both
cron pathways emit structured logs, and the scan engine paces and retries its
Firecrawl requests instead of losing two thirds of the chapters to rate
limiting. Failures that remain are classified and surfaced in the CMS with a
one-click retry.

## Changes

**Scheduling and navigation**

- Removed "Europe Pulse" from the public site navigation; the page is reached
  from the Insights preview teaser and by direct link.
- Added the `icf-europe-pulse-scan-weekly` pg_cron job (Monday 06:00 UTC),
  calling `/api/public/europe-pulse-scan` through `net.http_post` with the
  server-only `x-cron-token` secret — never the publishable key.
- Completed the DE/FR/IT UI strings for the page and re-ran the translation
  script.

**Observability**

- `src/routes/api/public/member-sync.ts` and
  `src/routes/api/public/europe-pulse-scan.ts`: log start, outcome, record
  counts and rejected (unauthorised) calls. The token is never logged.
- `src/lib/member-sync.server.ts`: run metrics and duration.
- `src/lib/europe-pulse.server.ts`: per-batch progress and per-chapter failure
  detail, so a multi-minute run is followable in the Logs section.

**Scan reliability** (`src/lib/europe-pulse.server.ts`)

- `takeScrapeSlot()`: rolling-60s pacer, 8 scrapes/minute.
- `pacedScrape()`: up to 3 attempts; honours `Retry-After` on 429, exponential
  backoff with jitter on 5xx/network, fails fast on other 4xx.
- `BATCH_SIZE` 5 → 2; throughput is now the pacer's responsibility.
- Second-chance pass over chapters that still failed at the end of a run.
- `classifyFailure()` → `rate_limit | upstream_error | not_found | empty_page |
  other`, persisted per raw row and mirrored onto the chapter.

**Recovery UI**

- `src/lib/europe-pulse.functions.ts`: `retryFailedChapters` server function
  (admin-guarded) re-scans only the failed chapters of a run and re-curates the
  week.
- `src/routes/_staff/manage.europe-pulse.tsx`: failed-chapters panel with a
  plain-language cause per chapter, plus a "Retry failed chapters" button and a
  chronic-failure flag in the chapter list.

**Documentation**

- New `docs/europe-pulse.md`; referenced from `README.md`, `docs/code-map.md`
  and `docs/operations-and-go-live.md`.

## Backend / schema changes

- New cron job `icf-europe-pulse-scan-weekly` and its `private.app_config`
  token row.
- Migration: `europe_pulse_raw.failure_kind text`,
  `europe_pulse_chapters.consecutive_failures int`. Additive only; no RLS or
  grant changes.

## Testing and verification

- Manual run from the CMS: chapters completing rose from 8/29 to a full pass,
  with no 429 remaining in the logs.
- Verified retry path: a run with induced failures, then "Retry failed
  chapters", rebuilt the week's feed without duplicating items.
- Verified the cron endpoint rejects a missing/incorrect `x-cron-token` with
  401 and logs the rejection without the token value.
- Type-check clean. Public feed checked in all four locales.
- Still pending: several unattended weekly runs to confirm steady-state
  behaviour, and observation of `consecutive_failures` on genuinely broken
  chapter URLs.

## Risks and rollback

- Main tradeoff is run duration — a paced full run takes minutes. If it ever
  approaches the request timeout, reduce the chapter count per run or move to a
  higher Firecrawl plan rather than pacing more slowly.
- Code and migration revert independently: the engine tolerates `failure_kind`
  and `consecutive_failures` being present or absent.
- Disabling the cron job is a one-line change and leaves the manual run intact.

## Follow-ups / known debt

- Per-chapter sub-page scanning (events pages, not just homepages).
- Automatic deactivation of chapters after N consecutive `not_found` runs;
  currently only flagged.
- Firecrawl capacity is the ceiling on chapter count; revisit if the list grows.
