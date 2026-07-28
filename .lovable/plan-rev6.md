## Phase 2 (rev. 6) — Milestone C: cutover readiness rehearsal

Delivered. Builds on rev. 4 (cutover runbook) and rev. 5 (role model, binding rule).
Milestone B remains documented in `plan-milestone-b.md`; `plan.md` holds the current
state summary and forward sequencing.

### 1. Binding gap closed (precondition)

Rev. 5 §6 flagged that a TEST member binding now carries a `user_roles` row, so the
purge's "delete auth users with no `user_roles` entry" sweep would no longer catch it —
the account would survive with a stale `member` grant and no member record behind it.

`runCutover` now releases bindings explicitly, before the table purge:

- clears every `members.auth_user_id`;
- deletes every `user_roles` row with `role = 'member'` (after the purge, no member
  record exists that could justify one);
- the orphan sweep then computes staff identity from non-`member` role rows only, so a
  member-only account is correctly treated as deletable;
- validation asserts, in addition to the rev. 4 checks, that **zero `member` role grants
  survive**. The step fails the cutover if any remain.

Rev. 4 §6 step 4 is amended in place to match.

### 2. Rehearsal (dry run)

`runCutover(actorUserId, { dryRun: true })` performs pre-flight and the archive
snapshot, then **stops before the first irreversible action** and reports what the real
run would do:

| Step                 | Rehearsal behaviour                                                                    |
| -------------------- | -------------------------------------------------------------------------------------- |
| `preflight`          | Real check: TEST mode, no recorded cutover, LIVE credentials present                   |
| `archive`            | Real snapshot, labelled `cutover-rehearsal-*` with reason `cutover_rehearsal`          |
| `purge_preview`      | Per-table row counts that would be deleted                                             |
| `binding_preview`    | Bindings that would be released, `member` grants revoked, non-staff auth users deleted |
| `switch_preview`     | States the mode switch and first LIVE import that would follow                         |
| `rehearsal_complete` | Confirms nothing was changed and the integration is still in TEST                      |

Freeze, purge, mode switch and LIVE import never execute in rehearsal. The
`integration_config` guard trigger is untouched and still the real boundary.

Surfaced as an admin-only **"Rehearse cutover"** action on `/integration`
(`rehearseCutover` in `src/lib/members.functions.ts`, admin role re-verified
server-side), rendering the steps as a result table. The card is hidden once
`cutover_completed_at` is set. Strings localised DE/FR/IT/EN.

### 3. Verified

Rehearsal run against current TEST state as an admin session: archived 1805 rows;
reported 501 members, 501 directory profiles, 501 import snapshots, 298 sync events and
4 sync runs as deletable; 1 binding and 1 `member` grant as releasable; 0 non-staff auth
users. Afterwards `integration_config` was still `mode=test`, claim closed, emails
suppressed, and the test binding intact.

### 4. What is still pending

- **Milestone E** — member-owned service-area editing in `/my-profile`. No auto-created
  profile can be published without a declared region, so this gates any real published
  directory row.
- ~~**Coach Finder swap**~~ — done. `/find-a-coach` now reads
  `coach_directory_public` through `queryCoachDirectory`; the `src/lib/coaches.ts`
  fixture is deleted. Facets (region, language, credential, specialisation,
  format) filter server-side; free text and "accepting new clients" narrow the
  returned page client-side; paging uses `coach_finder_config.page_size`. Cards
  render initials rather than photos, since profile images live in a private
  bucket that anon cannot sign. The page correctly shows the empty state today —
  all 501 imported profiles are still `draft`, so nothing is directory-visible
  until Milestone E lets members complete and publish them.
- **Milestone D — claim flow completion.** `attemptMemberClaim` requests the link and
  sends the (currently suppressed) email; the token-consumption / set-password half does
  not exist yet. Still correctly inert: the function short-circuits unless claim is
  enabled in LIVE mode with a recorded cutover, no route or component calls it, and no
  claim UI is linked anywhere. D inherits the binding rule in rev. 5 §5.
