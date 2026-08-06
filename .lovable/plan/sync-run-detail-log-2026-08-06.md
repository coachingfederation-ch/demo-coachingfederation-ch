# Sync run detail log

Today the integration page only shows the counts per run (+created / ~updated / −deactivated). This adds a per-run drill-down so you can see exactly which members were affected and what failed.

## What you get

- Each row in "Recent sync runs" becomes clickable and opens a run detail view.
- The detail view shows:
  - Run header: mode, trigger (cron/manual/cutover), start/finish, duration, status, and the full error message when it failed.
  - **New members** — name, ICF number, email.
  - **Updated members** — name, ICF number, and the list of fields that changed (e.g. `email, city, credential_expires_on`).
  - **Deactivated members** — name, ICF number, and the scheduled deletion date (grace window).
  - **Events / problems** — the run's log entries (aborts, failures, directory profiles created, visibility demotions), with severity.
- Long lists are paged (50 per page) and filterable by name/ICF number.
- All strings localized DE · FR · IT · EN, following the existing CMS i18n.

## Gaps in the current recording (fixed as part of this)

Two things aren't recorded today, so the log would be incomplete without small backend changes:

1. Import snapshots don't say whether a row was **created** or **updated** — both look the same.
2. Deactivations write no audit row at all; only the count survives.

Fix:
- Migration: add `member_import_snapshots.change_kind text not null default 'updated'` (values `created` / `updated`). Historic rows keep `updated` and the UI labels them "changed" so nothing is misreported.
- `runMemberSync` sets `change_kind` when building snapshots, and writes one `member_deactivated` event per member entering grace (with `member_id`, `cst_recno` and `scheduled_deletion_at` in `details`).

Runs that happened before this change will show their counts and events, but no per-member breakdown — that is expected and stated in the UI.

## Technical notes

- Read path: new `getSyncRunDetail` server function in `src/lib/members.functions.ts` (admin-guarded, same `assertAdmin` pattern as the existing sync actions). `member_sync_runs`, `member_import_snapshots` and `member_sync_events` are all service-role only, so the read must go through a server function, not the browser client.
- It joins snapshots to `members` for name/email, and returns `{ run, created[], updated[], deactivated[], events[] }` with paging params.
- UI: new `src/components/cms/SyncRunDetail.tsx` rendered as an expandable panel below the clicked row in `src/routes/_staff/integration.tsx`; reuses the existing `CARD` / table styling on that page rather than introducing a new visual pattern.
- No change to `fetchRecentSyncRuns` or the existing counts.

## PR note

**Summary** — Adds a per-run drill-down to the integration page so admins can see which members were created, updated (with changed fields) or deactivated in a sync run, plus the run's error/event log.

**Changes**
- UI: clickable sync-run rows, new `SyncRunDetail` panel with four sections, search + paging, four-locale strings.
- Backend: `getSyncRunDetail` admin server function; `runMemberSync` now stamps `change_kind` and logs a `member_deactivated` event per member.

**Backend / schema changes** — One additive migration: `member_import_snapshots.change_kind` (text, default `'updated'`, not null). No RLS or grant changes; the table stays service-role only.

**Testing & verification** — Check a succeeded run (created/updated/deactivated sections populate, changed-field lists match the snapshot rows), the two failed runs (error message and `sync_failed` event visible, empty member sections), and a pre-migration run (counts + events only, with the "no per-member detail" note). Verify as admin and confirm a non-admin staff account gets denied.

**Risks & rollback** — Read-only feature plus one additive column; reverting the code leaves the column harmless. Blast radius limited to the integration page and the snapshot write in `runMemberSync`.

**Follow-ups / known debt** — No CSV export of a run's detail; no retention/pruning of snapshots (the table grows with every changed member per run).
