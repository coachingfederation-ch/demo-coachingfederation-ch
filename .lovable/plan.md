## Your understanding — mostly right, with two corrections

Confirmed: the public directory + detail view are done, and the claim flow is built and verified end to end.

Two corrections, both verified just now:

1. **There is no email transport at all.** `sendMemberEmail` gates on suppression, then logs `no_transport` and returns "not sent". No email domain, no templates, no send call. So "send claim emails" is not a config flip — it is remaining build work.
2. **The directory will be empty on launch day.** Imported members get a `draft` profile with zero service regions, and publishing requires the member to act (region + tagline). Today's TEST data shows it: 501 active members → 204 `draft`, 296 `hidden_no_credential`, **1 published**. After the LIVE import the public directory shows ~0 coaches until members claim and publish. This needs a decision before launch, not after.

Also unverified/likely missing: **no pg_cron job exists in any migration**, so the nightly sync is probably not actually scheduled.

---

## 1. Complete in code

- Public directory (`/find-a-coach`): server-side pagination, DB-driven facets, signed image URLs; public coach detail at `/coach/$profileId` with SEO meta; DE/FR/IT/EN.
- Member Area (`/my-profile`): imported ICF fields read-only, member-editable tagline/description/regions/languages/formats/specialisations/links, photo upload + crop, eligibility-gated publish.
- Eligibility engine: active membership + valid ACC/PCC/MCC, enforced by trigger and by sync demotion into `hidden_inactive` / `hidden_no_credential` / `hidden_admin`.
- SOAP sync with full-snapshot replacement, feed-drop safety valve, run/event audit tables; sync endpoint authenticated by `apikey`, skips while `cutover_in_progress`.
- Claim flow: hashed one-time tokens, 7-day TTL, one open link per member (supersede verified), throttling, neutral responses, all state screens, auto sign-in to `/my-profile`, staff "Issue claim link", audit events.
- Roles + two separate shells (`_staff`, `_member`); binding via explicit `auth_user_id` + role, never email equality.
- Cutover machinery: archive snapshot, freeze, FK-ordered purge, role revocation, mode switch, validation — plus a non-mutating rehearsal on `/integration`.
- Email safety rails: suppression gate, TEST-shaped-address block, `member_email_log`.
- Auth trigger bug fixed (all sign-ups were failing).

## 2. Remaining in product/UI (code work)

| # | Item | Why |
|---|---|---|
| 2.1 | **Email transport** — set up sender domain, scaffold templates, wire the real send into `sendMemberEmail`'s final branch | Nothing can be emailed today |
| 2.2 | **Claim invitation template** (DE/FR/IT/EN) + **reminder** template | Members need the link |
| 2.3 | **Bulk claim invitation tool** on `/members`: select eligible cohort → mint links → send → progress/failure report, resumable, never re-sends to a completed member | Only one-at-a-time staff issue exists; ~500 members |
| 2.4 | **Launch-day directory decision** (see §3.1) — if we auto-seed regions from imported city/country, that is a sync/backfill change plus a member-facing "check your listing" prompt | Otherwise the directory launches empty |
| 2.5 | **Claim send status** column on the members list (invited / claimed / bounced / never) | Operators need to chase the tail |
| 2.6 | **Lifecycle queue processor** — nothing reads `member_lifecycle_queue`; grace-period notice + deletion never runs | GDPR/retention commitment unfulfilled |
| 2.7 | Copy pass: `/claim` closed-state text, invitation email copy, `/auth` member-vs-staff wording |

Non-blocking (can ship after launch): 2.5, 2.6, reminder emails.

## 3. Remaining in data / migration

- **3.1 Directory seeding decision.** Either (a) launch the directory empty and treat claiming as the fill mechanism, (b) auto-assign one region from imported city/country at import so eligible members are publishable immediately, or (c) staff pre-publish a curated set. This drives whether §2.4 is needed.
- **3.2 No backfill of TEST content.** Per the runbook there is nothing member-authored to carry; the purge is total. The one published TEST profile (9875144) and its photo are destroyed by design.
- **3.3 Rebinding.** Every TEST binding and `member` grant is revoked by the purge; the admin test account returns to staff-only and re-claims through the live flow like any member.
- **3.4 Revoked/inactive members.** LIVE feed drives `activity_state`; inactive/expired-credential members import but stay hidden. Confirm with ICF that the LIVE feed marks lapsed members rather than omitting them — omission looks like a feed drop and will trip the safety valve.
- **3.5 Freeze order.** Archive → freeze → purge → switch → first LIVE import (manual) → validate → unfreeze. Sync must not run during any of it; the endpoint already self-skips.
- **3.6 Scheduled sync.** Verify or create the nightly pg_cron job against the **production** URL; it appears in no migration.

## 4. Manual configuration you must do

**Before launch day**
1. Custom domain connected and primary (Lovable → Project Settings → Domains); publish first.
2. Email sender domain set up (Lovable → Cloud → Emails); NS records added at your DNS provider; wait for verification (up to 72h) — **start this early, it is the long pole**.
3. Supabase Site URL + allowed redirect URLs updated to the production domain (and the `www` variant) so Google sign-in and claim redirects don't bounce to preview.
4. Google OAuth: production domain added to authorised origins/redirects.
5. Confirm LIVE SOAP secrets are the real production credentials (four are stored; they have never been exercised against the LIVE endpoint).
6. Auth policy: leaked-password protection on; email signups disabled or restricted so the claim flow is the only member entry path.
7. Storage: `member-profile-images` stays **private** — the app mints signed URLs. Do not make it public.
8. Monitoring: decide who watches sync-run failures and the email log; the `/integration` panel is the only surface today.

**At cutover time only**
9. Run the cutover from `/integration` (typed confirmation).
10. Flip `mode = live` — one-way door, no revert.
11. Later, deliberately: `emails_suppressed = false`, then `account_claim_enabled = true`.

## 5. Where each thing happens

- **Lovable:** custom domain, publish, email domain setup, secrets, cron job creation, all app config surfaces.
- **Supabase (via Cloud UI):** Site URL, redirect allow-list, Google provider, auth password policy, user administration.
- **DNS provider:** A/TXT records for the domain, NS records for the email subdomain. Nothing else.
- **Email provider:** none — managed by Lovable; no SMTP, no API key, no third-party account.
- **Cutover-time only:** the cutover run, `mode=live`, `emails_suppressed=false`, `account_claim_enabled=true`, first manual LIVE import.

## 6. Launch sequence

**T-2 weeks:** email domain + DNS (verification is the long pole); custom domain; auth URLs; confirm LIVE credentials; build §2.1–2.4; run the cutover rehearsal and read every line.

**T-2 days:** full rehearsal on production config; send a claim invitation to two internal addresses on real infrastructure; confirm delivery, link, password set, `/my-profile`.

**Launch day, in order:**
1. Announce the maintenance window; freeze CMS publishing.
2. Archive + download the bundle. **Do not proceed without it.**
3. Run cutover (freeze → purge → `mode=live`).
4. First LIVE import, manually. If the feed-drop valve trips, stop.
5. Validate: count in range, zero `zz` emails, zero bound accounts, spot-check 5 members against the ICF portal, vocabularies unchanged.
6. Unfreeze; re-enable/create the nightly cron; stamp `cutover_completed_at`.
7. Smoke test public: `/find-a-coach` loads, facets work, a detail page renders, all four locales, `/insights` unaffected.
8. **Directory is live. Claim is still off. Stop here for at least a few hours.**
9. When calm: `emails_suppressed = false` → send **one** invitation to a staff member → verify claim end to end on production → then `account_claim_enabled = true`.
10. Send invitations in waves (~50 first), watch the email log and `member_account_claimed` events between waves.

## 7. Rollback / safety

- **Backed up first:** the archive snapshot bundle from step 2 — it is the only restore path, and steps 1–5 fail safe before the mode switch.
- **Safely toggled off, in increasing severity:** `account_claim_enabled` → stops new claims, existing members keep access, public site untouched. `emails_suppressed = true` → stops all sends, intents still logged. Disable the cron → freezes member data at last good sync. `cutover_in_progress` → puts the directory in maintenance without touching data.
- **Not reversible:** `mode = live` (trigger-blocked) and the purge (restore from archive only).
- **Disabling claim without affecting the public site:** flip `account_claim_enabled` off — `/claim` returns its closed state, `/auth` hides the entry point, the directory and detail pages are entirely unaffected.
- **If claims fail, check in this order:** `member_email_log` (was it even sent, suppressed, or blocked as test-shaped) → Cloud → Emails delivery events (bounce/suppression) → `member_sync_events` for `member_claim_link_issued_by_staff` / `member_account_claimed` → `member_profile_links` status and `attempts` → app logs for an auth error, which now surfaces properly instead of masquerading as "account already exists".
