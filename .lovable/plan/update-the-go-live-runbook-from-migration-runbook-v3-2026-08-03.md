# Update the go-live runbook from migration runbook v3

`docs/operations-and-go-live.md` currently describes a single-step go-live: verify, cut over, open claiming. The v3 runbook changes the shape of the migration in a way the doc does not reflect — the public DNS switch now happens **last**, weeks after the cutover, while the Bubble site stays the public face and members build profiles on `new.coachingfederation.ch`. This update rewrites the operational parts of the doc around that sequence.

## What stays

The document's existing explanatory sections are accurate against the code and remain:

- The TEST / LIVE switch and its three database-enforced invariants
- The nightly sync, the feed drop guard, and the `x-cron-token` authentication note (v3 explicitly confirms this and corrects a competing document that claimed `apikey`)
- The weekly Europe Pulse scan
- Lifecycle and grace period
- Migration hygiene
- The troubleshooting table

## What changes

**1. Replace the "Cutover sequence" section with a phased model.**

```text
A Preparation      reversible    public sees Bubble
Gate 1             go / no-go
B Cutover          IRREVERSIBLE  public sees Bubble  (data event on new. only)
Gate 2             data validated
C Claim waves      pausable      public sees Bubble  (the long phase)
Gate 3             threshold AND hard date
D Public switch    partly rev.   public sees new site
E Monitoring
F Containment
```

Make the point v3 makes explicitly: the irreversible line sits at Phase B, not at the DNS switch.

**2. Expand the blocked-on-external-configuration list** into a Phase A preparation section with the items the current doc omits:

- Email sending domain is the long pole (NS delegation, up to 72h) — already flagged, but reframed as "start this first"
- Email transport is **not wired**: `member-email.server.ts` logs `no_transport` and returns not-sent. Writing that provider call is a hard prerequisite for claim invitations
- LIVE SOAP secrets are stored but never exercised — the cutover preflight only checks that the variables exist, so a real LIVE `authenticate()` call must succeed before Gate 1
- `SITE_URL` in `src/i18n/config.ts` is hardcoded to the Lovable preview host and drives sitemap, canonical and hreflang; it must point at `new.` during the window and at the apex after
- `noindex` posture on `new.` for the whole window (headers, meta, robots.txt), removed as one deliberate step in Phase D
- Supabase Site URL / redirect allowlist and Google OAuth origins should include `new.`, apex and `www` up front, so Phase D needs no auth change under time pressure
- `/integration` does not expose `emails_suppressed` or `account_claim_enabled` — either add guarded toggles or write the exact SQL into the runbook in advance
- LIVE feed audit: total active, no-email, duplicate-email and credentialed counts, plus confirming with ICF whether lapsed members are marked or omitted (omission looks like a feed drop and trips the safety valve)
- `member_lifecycle_queue` has no reader — the grace-period notice and deletion never run. Record it as an unimplemented retention commitment, not a tuning gap
- Content migration and the old-site redirect map, due before Gate 3 rather than before cutover

**3. Add the three gates as explicit checklists**, with Gate 3 carrying both a published-profile threshold and a hard date (whichever comes first wins).

**4. Add the directory ceiling.** TEST data: 501 active produce 204 draft, 296 hidden_no_credential, 1 published — roughly 40% of members can ever appear. Note it must be re-measured after the first LIVE import.

**5. Add a "claimed is not published" note.** The funnel is invited → claimed → completed → published, and only the last step fills the directory.

**6. Replace the thin "After go-live" list with a containment table** covering email, claims, sync and site failures, including the honest line that the cutover has no automated recovery, and that the archive bundle must be downloaded out of the database before Phase B, since it is written into the database that is about to be purged.

**7. Add an appendix "where the rules actually live"**, mapping each invariant to the trigger or module that enforces it, so a future reader knows the database wins over the runbook.

## What is deliberately left out

Owner-name blanks, party/ownership tables, wave date tables, the EBM action list and the decisions register (D1–D8) are project-management artefacts that belong in the runbook itself, not in the repository's operations doc. The doc will reference the runbook as the authoritative migration plan and keep only what an engineer or operator needs when working on the system.

## Files touched

- `docs/operations-and-go-live.md` — rewritten from the go-live checklist onward; the explanatory sections above it are kept

No code, schema, or configuration changes.

## PR note

**Summary** — Updates the go-live runbook to match migration runbook v3, in which the public DNS switch happens last and the cutover becomes a data-only event on a staging hostname.

**Changes** — Documentation only: phased migration model, three gate checklists, Phase A prerequisites (email transport, LIVE credential exercise, SITE_URL/noindex, auth allowlists), directory ceiling, containment table, enforcement appendix.

**Backend / schema changes** — None.

**Testing & verification** — Claims about the code (SITE_URL hardcoded to the preview host, `no_transport` in `member-email.server.ts`, `x-cron-token` on the sync endpoint) were verified by reading the source before writing the plan.

**Risks & rollback** — None; documentation only.

**Follow-ups / known debt** — Email transport implementation, `member_lifecycle_queue` processor, `emails_suppressed` / `account_claim_enabled` admin toggles, and the bulk invitation tool. Each is engineering work, tracked separately from this doc change.