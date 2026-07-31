# Europe Pulse — weekly feed of ICF European chapter activity

A new public page `/europe-pulse` (plus `/de`, `/fr`, `/it`) showing a curated, translated weekly digest of what the ~29 other European ICF chapters are doing. A weekly job scans the chapter websites, an AI pass filters, de-duplicates and translates the best items, and staff can review or override the result in the CMS.

## How it works

```text
weekly cron -> scan (Firecrawl) -> europe_pulse_raw   (raw items per chapter)
                   |
                   v
             AI curation pass  -> europe_pulse        (~30 items, DE/FR/IT/EN)
                   |
                   v
     auto-publish  OR  hold for staff approval  (switch in CMS)
                   |
                   v
            public feed at /europe-pulse
```

## 1. Scanning

- The chapter list (29 sites, Switzerland excluded) lives in a `europe_pulse_chapters` table so staff can add, disable or fix a URL without a code change. Seeded with your list, including country name and ISO code for flag display.
- Scanning uses the **Firecrawl** connector: for each chapter we map/scrape the news and events sections and keep the extracted content, not full raw HTML (keeps the database small and avoids storing whole third-party pages).
- Per chapter we store one raw row: source URLs, extracted candidate items, and a status (`ok` / `failed` / `empty`) so failures are visible instead of silently dropping a chapter.
- Chapters are scanned with limited concurrency and a per-chapter timeout, so one slow site cannot stall the run.

## 2. Curation and translation

One AI pass per run (Lovable AI, the same gateway the article and event translations already use):

- keeps only genuine coaching activity — events, news, webinars, workshops, conferences — and drops navigation, footers, membership boilerplate and ads
- de-duplicates the same event appearing on several chapter sites
- picks the best **~30 items, at most 1–2 per chapter**
- writes a 1–2 sentence summary and translates title + summary into DE, FR, IT, EN
- normalises type and event date

Only the shortlist is translated, so the weekly AI cost stays in the low cents.

## 3. Feed page `/europe-pulse`

- Header: "Europe Pulse" + "Week of &nbsp;", short intro line.
- Filters: country dropdown, chapter dropdown, type (all / event / news / webinar / workshop / conference). Filters live in URL params so a filtered view is shareable.
- Cards in a responsive grid (1 / 2 / 3 columns) using the existing card and shadow conventions: country flag + chapter name, type icon and pill, title, date, 1–2 sentence summary, "Read more →" to the chapter's original URL (new window, `rel="noopener"`).
- Empty state: "No activity detected this week from &nbsp;." when a filter yields nothing, plus a general empty state before the first run.
- Footer line: "Powered by ICF Switzerland Intelligence · Updated weekly".
- Server-rendered from the published week; no client-side scraping. Mobile-first.
- Linked from the main navigation.

## 4. Staff CMS — "Europe Pulse" (admin)

- Mode switch: **automatic** (curated items publish as soon as the run finishes) or **manual** (items land as pending and go live only after approval). Default automatic.
- "Run scan now" button with the status of the last run (started, finished, chapters ok/failed, items kept).
- Review list for the current week: hide/show individual items, edit a title or summary in any of the four languages, re-run the AI translation for one item.
- Chapter management: add or disable a chapter, correct its URL, see which chapters failed in the last run.

## 5. Data model

Extends your sketch to cover chapter management, run visibility and approval:

- `europe_pulse_chapters` — chapter, country, country_code, base_url, sections to scan, is_active.
- `europe_pulse_runs` — week_of, status, trigger source (cron/manual), counts, error, timestamps.
- `europe_pulse_raw` — run_id, chapter_id, source url, extracted_items (JSONB), status. Kept a few weeks, then pruned.
- `europe_pulse` — run_id, week_of, chapter, country, country_code, type, title/description in de/fr/it/en, url, event_date, `status` (`pending` / `published` / `hidden`), sort rank, timestamps.
- `europe_pulse_config` — single row: automatic vs manual mode, item cap.

Access in plain language: visitors can read only published items of the current week and the active chapter list — nothing else. Raw scan data, runs and config are staff-only; only admins can change chapters, config or item status.

## 6. Scheduling

A weekly cron job (Monday early morning) calls a public scan endpoint protected by a dedicated server-only token — the same pattern the member sync already uses. A guard prevents two runs overlapping.

## 7. Prepared for later (not built now)

- Email subscription: the feed footer keeps room for the sign-up CTA.
- Chapter spotlight: the chapters table already carries the fields a rotation needs.
- Historical archive: every item keeps its `week_of` and run, so a week switcher is a UI-only addition later. The feed shows the latest published week.

## Technical notes

- Scan and curation run as TanStack server functions (`src/lib/europe-pulse.server.ts`, `europe-pulse.functions.ts`) plus a cron route `src/routes/api/public/europe-pulse-scan.ts` — no new Supabase edge functions, consistent with the rest of the project.
- Firecrawl is called server-side only; the connector must be linked to the project before the first run (I will open the connect card during build).
- Localised routes `src/routes/europe-pulse.tsx` and `src/routes/$locale/europe-pulse.tsx` with `localeMeta` / `localeLinkTags`, page in `src/pages/EuropePulse.tsx`, copy in `src/i18n/locales/{en,de,fr,it}/europe-pulse.json` (EN authored, the rest via the existing `bun run translate` script).
- CMS page `src/routes/_staff/europe-pulse.tsx`, admin-gated like the other admin-only screens, added to the CMS navigation.

## PR note

**Summary** — Adds Europe Pulse: a weekly Firecrawl-based scan of 29 ICF European chapter websites, an AI curation/translation pass, a public multilingual feed at `/europe-pulse`, and an admin CMS for chapters, runs and item approval.

**Changes**

- UI: public feed page and localised routes, nav entry, staff CMS screen.
- Backend: scan/curation server modules, cron route, Firecrawl connector wiring.
- i18n: new `europe-pulse` namespace in four languages.

**Backend / schema changes** — five new tables (chapters, runs, raw, items, config) with grants and RLS: public read limited to published items and active chapters, all writes admin/service-role only. One weekly cron job.

**Testing & verification** — manual scan run end to end; feed checked signed-out in all four languages, mobile and desktop; filters and empty states checked; approval mode toggled both ways; anonymous access to raw/runs/config confirmed denied.

**Risks & rollback** — self-contained; page and cron job can be removed without touching existing functionality. Third-party sites change layout, so scan quality degrades to "no items" for that chapter rather than failing the run. Firecrawl credits are consumed weekly.

**Follow-ups / known debt** — week archive UI, email subscription, chapter spotlight; raw-data pruning policy to be tuned after a few real runs.  


#   
Approval Notes

Integrate the europe-pulse on the /insights page as a preview from where you then can go to the detail page /europe-pulse. 