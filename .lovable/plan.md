Noted and locked in: **CSV export is admin-only** — the export server fn re-verifies `has_role(auth.uid(), 'admin')` server-side and returns 403 for editors; the button is hidden for non-admins. Editors keep read access to the admin members table (no bulk PII download); Clean up stays admin-only too. This replaces the `admin|editor` assumption in rev. 3 §8b and §11.

Everything else in the approved rev. 3 architecture stands unchanged (full-snapshot sync with explicit null rule, `member_activity_state` split from diagnostics, four-state visibility, service facets, per-run import snapshots, admin Clean up action, admin members list).

## Phase 1 — CMS-managed vocabularies + Coach Finder config

Goal: get the controlled filter vocabularies into the database and under admin management, and repoint `/find-a-coach` at them. No member data, no sync, no auth changes yet. Directory rows stay mock; only the *filter options* become real.

### Migration

Six vocabulary tables, all sharing the existing `categories` shape so one admin screen serves them all:

`cf_regions`, `cf_specialisations`, `cf_credentials`, `cf_formats`, `cf_languages`, `cf_availability_labels`

Each: `id uuid pk`, `slug text unique`, `name text`, `name_de`, `name_fr`, `name_it`, `sort_order int`, `is_active bool default true`, `created_at`, `updated_at` + touch trigger.

Plus `coach_finder_config` — a singleton row (`id` with a one-row check) holding scalars: per-facet enablement and labels (`coaching`/`mentoring`/`supervision`), default sort, page size, and the tunables the later phases read (feed-drop threshold, snapshot retention months, CSV row cap).

Per table, in order: CREATE TABLE → GRANTs (`SELECT` to `anon` + `authenticated`; `SELECT/INSERT/UPDATE/DELETE` to `authenticated`; `ALL` to `service_role`) → ENABLE RLS → policies:
- public read: `SELECT` to `anon, authenticated` where `is_active` (admins/editors see inactive rows too)
- writes: `has_role(admin)` or `has_role(editor)` via the existing inline `EXISTS` pattern already used by `categories`, matching the security memory's documented approach

Seed rows in the same migration: Swiss regions (the cantonal/linguistic groupings already implied by the directory, incl. Romandie and Ticino), the current specialisation keys from `src/lib/coaches.ts` (leadership, career, team, executive, transition, wellbeing, systemic, diversity), credentials ACC/PCC/MCC, formats in-person/online, languages DE/FR/IT/EN in that order, and availability labels (accepting / waitlist / not accepting). EN names are authored now; DE/FR/IT columns are seeded with the best available translation and flagged for chapter review.

### Admin UI

- New "Vocabularies" entry in the CMS sidebar (`src/components/cms/Shell.tsx`), following the existing Articles/Categories pattern.
- One generic list/editor screen driven by a table descriptor, reused for all six vocabularies: add, rename, edit the three translations, reorder via `sort_order`, toggle `is_active` (soft-disable rather than delete, so existing references never break).
- A small settings screen for the `coach_finder_config` singleton.
- All strings go through the existing `cms.json` dictionaries for EN/DE/FR/IT.
- Routes under `src/routes/_authenticated/`, reads/writes through the browser Supabase client with RLS doing the gating (consistent with how Categories works today).

### Coach Finder wiring

- `src/lib/coaches.ts` keeps its mock `COACHES` array for now, but the hardcoded `SPECIALIZATION_KEYS`, `CREDENTIAL_LEVELS`, `COACHING_FORMATS`, `COACH_LANGUAGES` and derived `CANTONS` constants stop being the source of the filter UI.
- A public server fn loads active vocabulary rows; the `/find-a-coach` route loader prefetches it via the existing query pattern, and `src/components/coaches/directory.tsx` renders filter options from that data with locale-aware labels.
- Mock coaches are mapped onto vocabulary slugs so filtering keeps working end to end; any mock value without a matching slug is dropped from the filters rather than silently shown.
- No visual redesign — same controls, same layout, same accessibility work already in place (labels, `role="status"` result count, focus rings).

### Verification

Migration applies with GRANTs and RLS on all seven tables; linter clean. Admin can create/edit/reorder/deactivate a term in each vocabulary and see it appear or disappear in the public filters. `/find-a-coach` filters populate from the database in all four locales, filtering still narrows results, and a Playwright pass confirms no console errors and no regression at 375px and 1280px.

### Out of scope for Phase 1

`members` and profile tables, sync pipeline, claim flow, Member Area, lifecycle, admin members list and CSV export — those are Phases 2-7 as approved.
