# Operations and go-live

## The TEST / LIVE switch

The system's entire posture is one row in `integration_config`. It decides
which ICF feed the sync talks to, whether member email may be delivered, and
whether account claiming is open.

`tg_integration_config_guard` enforces three invariants in the database, so
they hold no matter which code path writes the row:

1. **TEST mode cannot send email or open claiming.** Both flags are forced off
   on write. Rehearsing against test data cannot spam real members.
2. **Claiming requires LIVE mode plus a recorded cutover.** Setting
   `account_claim_enabled` before `cutover_completed_at` exists raises an
   exception.
3. **LIVE → TEST is refused.** The cutover is a one-way door; reverting after
   real members hold accounts would be incoherent.

Treat these as the safety net that makes the rest of the runbook survivable —
not as something to work around.

## The nightly sync

A cron job (`icf-member-sync-daily`, 03:15 UTC) calls
`/api/public/member-sync`, which runs `member-sync.server.ts`:

The endpoint authenticates the caller with a dedicated token in the
`x-cron-token` header. The token lives in exactly two places: the
`MEMBER_SYNC_CRON_TOKEN` server env var, and `private.app_config` (key
`member_sync_cron_token`), which the cron job reads when it builds the request.
It is deliberately **not** the Supabase publishable key — that key is shipped to
every browser, so using it would let anyone on the internet trigger a full ICF
re-sync. To rotate: update the `private.app_config` row and the env var together.

1. Pull the member feed over SOAP from netFORUM xWeb.
2. **Feed sanity check.** If the record count has dropped by more than
   `feed_drop_threshold_pct` against the previous successful run, abort without
   writing. A truncated or failing feed would otherwise deactivate the entire
   membership in one pass — the check exists because that failure is silent and
   catastrophic.
3. Normalise each record and diff it against the stored row.
4. Create, update, or deactivate members; demote directory profiles that lost
   eligibility.
5. Write a `member_sync_runs` row plus per-event rows and per-member snapshots.

Everything is auditable after the fact. When member data looks wrong, start
with the most recent `member_sync_runs` row, then `member_sync_events` filtered
to that run, then `member_import_snapshots` for the specific member's
`changed_fields`.

A manual run can be triggered from `/integration`, which is also where the
rehearsal simulation lives — it reports what a cutover _would_ do without
writing.

## The weekly Europe Pulse scan

A second cron job (`icf-europe-pulse-scan-weekly`, Monday 06:00 UTC) calls
`/api/public/europe-pulse-scan` using the same `x-cron-token` shared-secret
pattern as the member sync. It scrapes the European chapter websites, curates
the week's items with AI and rebuilds the public feed.

Operationally it differs from the sync in one respect: it is rate-limited by
the Firecrawl plan, so a full run is paced across several minutes and a run
that fails partially is normal rather than alarming. Failed chapters are
classified and listed in `/manage/europe-pulse`, which offers a retry that
re-scans only those. Full detail in `docs/europe-pulse.md`.

### Lifecycle and deletion

Members who go inactive enter a grace period (`member_lifecycle_queue`) with a
scheduled deletion date rather than being removed immediately. Membership
lapses and renewals are routine; immediate deletion would destroy
member-authored profile content over an administrative gap.

## Go-live checklist

### Code — done

- [x] Sync engine, feed guard, audit trail
- [x] Directory eligibility rules enforced in the database
- [x] Member Area with self-service publishing
- [x] Public directory and coach detail pages on real data
- [x] Insights CMS with translations and scheduling
- [x] Claim flow, built end to end and gated off
- [x] Accessibility pass (WCAG 2.2 AA on public routes)

### Blocked on external configuration

- [ ] **Email domain.** Until one is configured, no member email can be
      delivered — which blocks the claim invitations, which blocks members
      getting into their profiles. This is the critical-path item.
- [ ] **Custom domain** for the public site.
- [ ] **LIVE ICF credentials** verified against the production feed.

### Cutover sequence

Do not reorder; each step depends on the previous one being verified.

1. Run the rehearsal simulation at `/integration` against LIVE credentials and
   review the projected create/update/deactivate counts. Numbers that look
   surprising are a stop signal.
2. Take an archive snapshot (`member_archive_snapshots`).
3. Flip `mode` to `live` and run a full sync.
4. Verify the directory: spot-check a sample of published coaches, and confirm
   the total count is plausible against ICF's own figure.
5. Record the cutover (`cutover_completed_at`). Only now does the database
   permit claiming to be opened.
6. Configure email delivery and send a small pilot batch of claim invitations
   before the full send.
7. Open `account_claim_enabled`.

### After go-live

- Watch `member_sync_runs` for the first several nightly runs.
- Watch `member_email_log` for failures during the invitation wave.
- Watch claim conversion; a low rate usually means invitations are landing in
  spam rather than that the flow is broken.

### Migration hygiene

- Do not reorder the migration history while the project is in TEST/cutover.
- Replaying the 46 existing migrations in order is correct, but many files are
  follow-up hardening passes on the same objects. If you need to understand the
  final RLS shape, read the last few migrations rather than the whole chain.
- Squashing the migration history into a single initial file is safe **only** for
  fresh environments. The current database already contains 501 test members and
  member-authored profiles, so any squash must be applied as metadata-only and
  verified against a throwaway copy. After go-live, the migrations can be squashed
  as a cleanup step; before go-live, keep them intact because they are the audit
  trail for the cutover rehearsal.

## Troubleshooting

| Symptom                                 | Look at                                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A coach is missing from the directory   | Their `member_directory_profiles.visibility`; if `hidden_*`, the reason is in the state name. Then check `credential_expires_on`, then that they have ≥1 region. |
| Sync aborted                            | `member_sync_runs.error_message`. An abort is usually the feed drop guard doing its job — check the feed before overriding.                                      |
| Member can't publish                    | `publishBlockReason` gives the exact cause; the editor already displays it.                                                                                      |
| Profile image not loading               | Signed URL expired, or the path was never signed. Check `storage.server.ts` and the TTLs in `storage.ts`.                                                        |
| Article visible in CMS but not publicly | Status is not `published`, or the locale has no `article_translations` row.                                                                                      |
