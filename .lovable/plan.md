## Phase 2 (rev. 4) — Member backend, TEST-only build, full-reset cutover

Simplified per your call: no member-authored content survives TEST, no claim flow goes live in TEST, and the cutover is a clean purge of the member domain followed by a fresh LIVE import.

The database today has no member tables — only the Phase 1 `cf_*` vocabularies, `coach_finder_config`, and the articles/profiles/roles set. So Phase 2 builds the member schema plus the safety rails around it.

---

### 1. Data classification

| Class | Data | Cutover rule |
|---|---|---|
| **Preserve** | `cf_*` vocabularies, `coach_finder_config`, `categories`, `user_roles`, staff `profiles`, schema, RLS, grants, storage buckets, cron jobs, server routes | Untouched by cutover |
| **Purge** | `members`, `member_directory_profiles`, member↔vocabulary joins, `member_import_snapshots`, `member_sync_runs`/`member_sync_events`, `member_lifecycle_queue`, `member_email_log`, `member_profile_links`, TEST-created `auth.users`, TEST profile images in storage | Archived once, then wiped before first LIVE import |

No third "migratable" class — there is nothing member-authored to carry.

---

### 2. No carryover

The optional enrichment-carryover staging table and reconciliation step are removed. If real local content ever accumulates before a future re-cutover, we add a whitelist export at that point; it is not part of this build.

---

### 3. `imported_in_mode` dropped

Agreed — with a hard purge between TEST and LIVE, a per-row mode flag is dead weight that every query would have to filter on forever. Dropped from `members`.

Kept instead, at negligible cost: `member_sync_runs.mode` (`test`/`live`). That's a run-level audit stamp, not an operational filter — it lets the status panel and the post-cutover validation show "all surviving rows came from LIVE run #1" without polluting the member schema or the Coach Finder query.

The cutover's validation step asserts `members` is empty immediately before the first LIVE import, which is the real guarantee that no TEST row survives.

---

### 4. Auth and claim: built, hard-disabled

`integration_config` singleton (one row, admin-write, admin/editor read):

- `mode` — `test` | `live`
- `soap_endpoint_key` — selects the TEST vs LIVE credential set
- `emails_suppressed boolean` — default true
- `email_redirect_to text` — optional internal catch-all
- `account_claim_enabled boolean` — default **false**
- `cutover_completed_at`, `cutover_completed_by`
- `last_successful_sync_at`, `last_failed_sync_at`, `last_sync_run_id`

Trigger-enforced invariants: `mode='test'` forces `emails_suppressed=true` **and** `account_claim_enabled=false`; `account_claim_enabled` can only be set true when `mode='live'` and `cutover_completed_at` is set. So claim cannot be switched on in TEST even by mistake.

The claim architecture is built now but inert: the server function short-circuits with a "not available" result whenever `account_claim_enabled` is false, and no claim/set-password UI is linked from the public site or member area. `/auth` keeps serving staff CMS sign-in only, exactly as today.

**TEST auth rule:** no member auth users are created during TEST at all, because claim never runs. If any appear (manual testing), the cutover deletes every `auth.users` row that has no `user_roles` entry. Staff/admin accounts are preserved.

**Claim enablement gate (post-cutover, explicit human decision):** first LIVE import succeeded → member count in the expected range (~500) → no email matches the TEST `zz` wrapper pattern → chapter decides to open the Member Area. Only then does an admin flip `account_claim_enabled` and `emails_suppressed`.

---

### 5. Email safety

Every member-facing send goes through one helper that reads `integration_config` first. With `emails_suppressed=true` no provider call is made — the intent is written to `member_email_log` as `suppressed`. With `email_redirect_to` set, it goes to that single internal inbox with the real recipient in the header. There is no email queue table, so nothing can drain into LIVE later; the suppressed log is archived and wiped at cutover regardless.

---

### 6. First LIVE cutover runbook (one-time, admin-only, typed confirmation)

1. **Pre-flight** — caller `has_role('admin')`; assert `mode='test'`, `cutover_completed_at is null`, LIVE credentials present.
2. **Archive** — full JSONB dump of all member-domain tables into `member_archive_snapshots` plus a downloadable bundle.
3. **Freeze** — disable the sync cron, set `cutover_in_progress`; Coach Finder member queries return a maintenance state. CMS/vocabularies stay editable.
4. **Purge** — delete in FK order: `member_profile_links` → member↔vocabulary joins → `member_directory_profiles` → `member_import_snapshots` → `member_sync_events` → `member_lifecycle_queue` → `member_email_log` → `members`. Delete non-staff `auth.users`. Remove orphaned profile images (bucket preserved).
5. **Switch** — `mode='live'`, `soap_endpoint_key='live'`; `emails_suppressed` stays true, `account_claim_enabled` stays false.
6. **First LIVE import** — run manually, not on cron. Feed-drop safety valve aborts without writing if the feed returns implausibly few members.
7. **Validate** — `members` was empty before import; count within expected range; zero `zz`-pattern emails; zero non-null `auth_user_id`; spot-check N records against the ICF portal; `cf_*` rows and `coach_finder_config` checksum-identical before/after; `/find-a-coach` renders LIVE rows against Phase 1 vocabularies.
8. **Go live (directory only)** — clear the freeze, re-enable the sync cron, stamp `cutover_completed_at`/`_by`. Emails and claim stay off.
9. **Later, separately** — flip `emails_suppressed=false` and `account_claim_enabled=true` when the §4 gate is met.

Steps 1–5 fail safe: anything before the switch leaves TEST state intact and restorable from step 2.

---

### 7. Operational visibility

Admin "Integration status" panel (read admin+editor, write admin): current mode with a loud TEST badge, email suppression + redirect target, claim-enabled state, last successful sync, last failed sync with error summary, cutover timestamp + actor, recent sync-run history. The TEST badge also renders in the CMS shell so nobody mistakes TEST data for production.

---

### 8. Build order

1. `integration_config` + `member_email_log` + status panel + email gate (rails first).
2. Member schema — `members` (unique `cst_recno`, `member_activity_state`, no mode column), `member_directory_profiles` with the four-state visibility model, service-facet columns, vocabulary joins, `member_import_snapshots`, `member_sync_runs`/`member_sync_events`, `member_lifecycle_queue` — with GRANTs and RLS.
3. SOAP sync against TEST with full-snapshot replacement semantics (rev. 3 null rule) and the feed-drop valve.
4. Admin members list: sortable/filterable table, admin-only CSV export, admin-only Clean up action.
5. Claim/auth architecture built but hard-disabled.
6. Cutover routine + runbook screen.
7. Coach Finder repointed from mock data to real member rows.

Chapter still owes DE/FR/IT copy for the Phase 1 vocabularies and for member-facing email templates.
