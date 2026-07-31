# Cron job logging

Both scheduled endpoints currently produce no console output, so their runs are invisible in the Logs section — the only trace is the row written into the database run tables. This adds structured log lines to each run so a scan or sync can be followed in the logs.

Confirmed current state: `src/lib/member-sync.server.ts`, `src/lib/europe-pulse.server.ts` and both route handlers under `src/routes/api/public/` contain no `console.*` calls; the two jobs `icf-member-sync-daily` (03:15 daily) and `europe-pulse-scan-weekly` (Mon 06:00) are active in the scheduler.

## What changes

`src/routes/api/public/member-sync.ts`
- Log a start line when an authorised request arrives.
- Log a warning on a rejected (bad/missing token) call — no token values logged.
- Log the skip line when a cutover is in progress.
- Log a finish line with status, counts from the sync result, and elapsed ms; log a failure line with the error message when the run fails or throws.

`src/routes/api/public/europe-pulse-scan.ts`
- Same shape: start, unauthorised warning, finish with `chaptersOk`, `chaptersFailed`, `rawItems`, `curatedItems`, week, run id, elapsed ms; failure line with the error.

`src/lib/europe-pulse.server.ts`
- Per-batch progress line (chapters scanned so far) and a line per failed chapter with the chapter name and error, so a partial week can be diagnosed without opening the raw table.

`src/lib/member-sync.server.ts`
- Start/finish lines around the run and a line for each failure path already captured in the result.

## Log format

One line per event, prefixed with the job name so the Logs search filters cleanly:

```text
[member-sync] start trigger=cron
[member-sync] done status=succeeded processed=501 ms=8123
[europe-pulse] chapter failed chapter="ICF Austria" error="Firecrawl 504"
[europe-pulse] done status=succeeded items=27 chapters=28/29 ms=91422
```

No secrets, tokens, emails or member PII in any line.

## PR note

**Summary** — Adds structured console logging to the member-sync and Europe Pulse cron paths so their runs are visible and diagnosable in the Logs section.

**Changes** — UI: none. Backend: log lines in two public route handlers and the two server run modules.

**Backend / Schema changes** — None. No migration, no cron schedule change.

**Testing & Verification** — Trigger the Europe Pulse scan from the CMS "Run scan now" button and confirm start/progress/done lines appear in the logs; check an unauthorised POST logs a warning and still returns 401.

**Risks & Rollback** — Very low; logging only, no behaviour change. Revert the commit to remove.

**Follow-ups** — If run volume makes logs noisy, drop the per-batch progress lines and keep start/finish only.
