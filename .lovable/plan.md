# Europe Pulse: only show items with future relevance

Today the feed shows anything the weekly scan curated, including a May 2025 seminar and undated
recaps of past events. The fix filters on three levels: at extraction (so stale items never enter
the pool), at write time, and at read time (so items drop out of the live feed as their date passes).

## Rules

- An item is shown only if it has a date and that date is today or later.
- Items with no date are dropped. The extraction step is told to work the date out of the content
  first (explicit date, date range, "registration until", a year in the title), and to return
  nothing only when the content truly carries no date.
- Multi-day items count as future until their last day; when only a start date is known, that date
  is used.

## Changes

**Extraction (`src/lib/europe-pulse.server.ts`)**
- Tighten the extraction prompt: pass today's date, require a resolved `event_date`, and instruct
  the model to infer it from the page content and skip anything already past.
- Drop extracted items with a missing or past `event_date` before they reach the pool, and count
  them in the run log line so staff can see how many were filtered.
- Same guard on the curation output, in case the model reorders or invents entries.

**Public feed (`src/lib/europe-pulse.functions.ts`)**
- Add `.not("event_date", "is", null)` and `.gte("event_date", today)` to `listEuropePulse`, and
  order by `event_date` ascending so the nearest item leads.
- This is the durable part: an event that passes while the week's run is still current disappears
  from the public page without needing a re-scan.

**Staff CMS (`src/routes/_staff/manage.europe-pulse.tsx`)**
- Keep showing every curated row (admins should still see what was scanned), but mark rows whose
  date is past or missing with a small "not shown publicly" badge, so the difference between the
  CMS list and the live feed is obvious.

**Existing data**
- No migration. The filter applies immediately to rows already stored; the May 2025 seminar and the
  six undated items stop appearing on `/europe-pulse` as soon as this ships.

## PR note

- **Summary** — Europe Pulse now only publishes items with a confirmed, still-upcoming date;
  undated and past items are filtered at scan time and at read time.
- **Changes** — UI: past/undated badge in the staff item list. Backend: date-aware extraction
  prompt and pool filter, date filter and ordering on the public feed query.
- **Backend / schema changes** — None.
- **Testing & verification** — Load `/europe-pulse` and confirm the 2025 seminar and the six
  undated cards are gone and cards run in date order; confirm the staff page still lists them with
  the badge; run a manual scan and check the log line reports the filtered count.
- **Risks & rollback** — The feed gets smaller (roughly 24 of the 30 current rows remain). Revert is
  a code revert; no data is deleted.
- **Follow-ups** — If a chapter publishes date-less but valuable news, we could later allow a manual
  "keep visible until" date on the item instead of dropping it.