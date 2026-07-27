## 1. Are the three docs reconciled?

Verified by reading all three in full. **Yes, they are consistent — with two small residues.**

- `plan-rev5.md` explicitly supersedes rev. 4 only on access control/routing, lists what stays unchanged, and adds the binding rule and redirect table.
- `plan.md` (Milestone B) is marked delivered and correctly places `/members/$id` under `_staff/`, notes the Member Area already exists, and points forward to C → D.
- Residue A: rev. 4 §4's sentence "`/auth` keeps serving staff CMS sign-in only" is still present in rev. 4's own text; it's corrected only by rev. 5 §6. Fine if rev. 5 is always read alongside, worth an inline "superseded" marker otherwise.
- Residue B: rev. 4 §6 step 4 still says the purge deletes auth users with no `user_roles` row. Rev. 5 §6 flags that TEST member bindings now *do* carry a role row — but the code (`src/lib/cutover.server.ts`) still implements only the orphan sweep, so the bound test member's `member` role would survive the cutover. Doc-level noted, code-level unfixed.

## 2. `integration_config` singleton

**Built and live.** One row exists: `mode=test`, `emails_suppressed=true`, `account_claim_enabled=false`, `cutover_in_progress=false`, `cutover_completed_at=null`, `soap_endpoint_key=test`, last successful sync today.

The trigger `integration_config_guard` **is attached** to the table and enforces all three invariants: TEST forces email suppression and claim off, claim requires `mode='live'` + a recorded cutover, and live→test reversion raises. Admin panel exists at `/integration` under `_staff`.

## 3. Claim / set-password flow

**Architecture built, correctly inert. No UI exists.**

- `src/lib/member-claim.server.ts` short-circuits to `{status:"disabled"}` unless claim is enabled, mode is live, and no cutover is in progress; it also rejects TEST-shaped emails, ambiguous email matches, and already-linked records — matching rev. 5 §5.
- Exposed only through a server function in `src/lib/members.functions.ts`; **no route or component calls it**, and there is no set-password/claim page in `src/routes`.
- Gap: `attemptMemberClaim` writes a `member_profile_links` row and sends a claim email, but there is **no token-consumption / set-password half** yet — that's the missing part of Milestone D, not a defect in the disable gate.

## 4. Recommended next steps, in order

**Step 1 — Close the cutover/binding gap (small, blocks C).**
Extend `runCutover` purge to explicitly unbind TEST member bindings and revoke the `member` role for accounts that are not staff, instead of relying on the orphan sweep. Add a validation assertion "zero `member` roles remain". Reconcile the wording in rev. 4 §6 step 4.

**Step 2 — Milestone C: cutover readiness rehearsal (dry-run mode).**
Add a `dryRun` path to `runCutover` that performs pre-flight, archive, and a full counts/validation report **without** freeze, purge, mode switch, or LIVE import — surfaced as a "Rehearse cutover" action on `/integration` with a step-by-step result table. This is the piece that lets the chapter see exactly what would be deleted before anyone types the confirmation.

**Step 3 — Repoint `/find-a-coach` at real member rows.**
Confirmed still on mock data (`src/lib/coaches.ts`); `src/lib/directory.functions.ts` already queries `coach_directory_public` with filters and paging but is unused. Wire the page to it, keep the mock as an explicit fallback behind a config flag until LIVE data exists. This is rev. 4 build-order item 7 and the last non-claim delivery.

**Step 4 — Milestone E: member-owned service-area editing.**
Let the bound member set their own `cf_regions` multi-select (and languages/specialisations/formats) from `/my-profile`, since no auto-created profile can be published without a declared region today. Small scope, unblocks any real published directory row.

**Step 5 — Milestone D: claim flow completion (still hard-disabled).**
Build the missing second half — token consumption, set-password page, `member` role grant on completion, expiry/replay handling — behind the same `account_claim_enabled` gate, with no linked UI until the post-cutover human decision. Deliberately last: it depends on the binding rule, on LIVE data existing, and on emails being un-suppressed.

Nothing is implemented yet; tell me which step to start with (or reorder) and I'll build it.