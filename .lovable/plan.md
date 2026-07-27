## Member backend roadmap — rev. 5 (decisions locked)

Supersedes rev. 4 (archived at `.lovable/plan-rev4.md`). All eight open questions from
section 9 of the rev. 5 proposal are now decided and folded into scope below.

---

### 0. Locked decisions

| # | Decision |
|---|---|
| 1 | Directory content stays on the current mock until Milestone F. No imported-only thin listings, no staff-curated cohort. |
| 2 | First LIVE import creates every profile as `draft`. Publication is member opt-in. |
| 3 | Mentor/supervisor **accreditation** is staff-maintained locally. **Availability** stays a separate, member-editable field. Revisit only if the ICF feed proves it carries accreditation. |
| 4 | Profile photo optional, initials fallback in the directory card. |
| 5 | Grace period 60 days (already configured). Two notices: one on drop from the feed, one shortly before deletion/anonymisation. |
| 6 | No email provider chosen. Keep the transport seam ready; decide before Milestone G. |
| 7 | Filters only. No full-text search yet. |
| 8 | `/find-a-mentor` and `/find-a-supervisor` are standalone entry URLs that preset the service filter on the one canonical directory — no duplicated implementation. |

---

### Milestone A — TEST sync verification: COMPLETE (2026-07-27)

**Connection.** Three defects in the SOAP client were found and fixed:

1. `Authenticate` is served by `netFORUMXML.asmx`, not `Signon.asmx`.
2. The session token is the `<Token>` in the response's `AuthorizationToken`
   **SOAP header**, not `AuthenticateResult` in the body. The body value is
   rejected with an `InvalidTokenException` reading "Locked".
3. `ExecuteMethod`'s real signature is `(serviceName, methodName, parameters)`
   where `parameters` is an `ArrayOfParameter` of `Name`/`Value` pairs — the
   client was sending `objectName` and a bare string array. Authorised calls
   must go to the `/secure/` endpoint.

The base-URL secret is now normalised to the xweb directory (query string,
`.asmx` filename and `/secure` are all stripped), so a differently-shaped LIVE
URL needs no code change.

**Feed shape, confirmed against the live TEST endpoint.** 501 active
`<Individual>` records, no duplicate `cst_recno`. Fields supplied:
`cst_recno`, `Member_Status` (all `Active`), `Member_Type` (`Coach` 484 /
`CIO` 17), `First_Name`, `Last_Name`, `Email`, `Phone`, `City`, `Zip`, `State`,
`Country`, `Chapter_Start_Date`, `Membership_Join_Date`,
`Membership_Expiration_Date`, `Flagship_Credential` (ACC 108 / PCC 105 /
MCC 12), `Credential_Award_Date`, `Credential_Expire_Date`, optional
`ACTC_Credential` + dates (8 members), `Reinstate/Rejoin`, `Auto_Renewal`.

Consequences folded into the normaliser:

- Dates arrive as US `MM/DD/YYYY` and are now parsed explicitly.
- `credential_slug` is upper-cased, because `cf_credentials` slugs are
  `ACC | PCC | MCC`.
- The feed carries **no organisation** and **no composed full name**; the name
  is derived, organisation stays permanently null unless a later feed adds it.
- The feed carries **no mentor or supervisor accreditation**. ACTC is a team-
  coaching credential, not a mentor/supervisor one. **Decision 3 is confirmed:
  those flags stay staff-maintained.**
- Zip, State, credential dates, ACTC, chapter start and auto-renewal have no
  column of their own and are preserved in `members.diagnostics`, so a future
  column can be backfilled without re-querying ICF.
- All 501 TEST emails are obfuscated by ICF as `zz…zz`, which the email gate
  already refuses to send to — a useful second safety net during TEST.

**Runs.** Three syncs executed. Run 1 created 501 members in ~8s; runs 2 and 3
reported 0 created / 0 updated, so the pipeline is idempotent. Upserts are now
chunked (200 per round trip) instead of one request per member, which is what
makes a 500-row feed finish inside a serverless request budget. Snapshots are
only written when a field actually changed, so a daily run no longer appends
~500 identical audit rows; the duplicates from run 2 were removed.

**Cron.** `icf-member-sync-daily` (`15 3 * * *`) is active. The endpoint answers
on the stable preview URL and returns 401 without the key. It still points at
the preview host — repoint it at the production host as part of Milestone D.

**Not done here, by design:** no directory profiles were created (Milestone B),
mode remains `test`, emails and account claim remain off.

---

### 1. Already built

- Full member schema: `members`, `member_directory_profiles`, four vocabulary join tables,
  `member_sync_runs` / `member_sync_events` / `member_import_snapshots`,
  `member_lifecycle_queue`, `member_archive_snapshots`, `member_email_log`,
  `member_profile_links` (claim tokens), `integration_config`, seven `cf_*` vocabularies,
  `coach_finder_config`.
- Service flags already on `member_directory_profiles`: `coaching_available`,
  `mentor_accredited`, `mentoring_available`, `supervision_accredited`,
  `supervision_available`.
- Visibility enum: `draft | published | hidden_inactive | hidden_admin`.
- Sync engine with full-snapshot semantics, feed-drop and empty-feed valves, grace
  deactivation, admin anonymisation clean-up.
- netFORUM xWeb SOAP client; TEST and LIVE credentials stored, only the base URL differs.
- One-time cutover routine with archive → purge → LIVE → first import, trigger-guarded.
- Admin screens: `/members` (admin-only CSV export), `/integration`, `/vocabularies`,
  `/coach-finder`.
- Daily cron at 03:15 UTC against the authenticated `/api/public/member-sync` endpoint.
- Email gate (`sendMemberEmail`): refuses TEST-shaped addresses, honours suppression,
  logs every intent, no queue that could drain into LIVE.
- Claim flow built and inert.

### 2. Verified gaps

Resolved by Milestone A: gaps 1 and 2 below are closed (501 members imported, mapping verified). Gaps 3-8 remain open.

1. ~~SOAP field mapping is inferred~~ — verified against the real TEST response.
2. Sync never creates `member_directory_profiles` rows. (Still open — Milestone B.)
3. No public read path — every member table has a single `authenticated` SELECT policy.
4. `/find-a-coach` still reads the hardcoded `src/lib/coaches.ts` array and has no
   mentor/supervisor concept.
5. No Member Area.
6. Profile has only `website_url` + `linkedin_url`, not multiple links.
7. No per-member admin detail view, so no way to set service flags or override visibility.
8. `sendMemberEmail` has no transport; no lifecycle templates;
   `member_lifecycle_queue.notified_at` is never written.

---

### 3. Public directory read model — database view

`public.coach_directory_public`, a plain view. Not a direct joined query, not materialized.

- **Direct joined query** — rejected as the contract. The projection spans `members` +
  `member_directory_profiles` + four join tables; "which columns are safe for anon" would
  live in application code and be restated at every call site.
- **Plain view** — chosen. One explicit safe column list (no email, phone, `cst_recno`,
  membership dates) and one predicate (`visibility = 'published' AND activity_state =
  'active'`). `anon` gets SELECT on the view only, never on base tables, so the safety rule
  is enforced once at the database boundary. ~500 members with filters is well inside
  normal query cost.
- **Materialized view** — rejected for now. It adds a refresh obligation after every sync
  and every member edit, and puts a staleness window on a member's own visibility toggle,
  which is exactly the change a member expects to be immediate. Revisit only on measured
  slowness.

Filters run as `WHERE` clauses against the view inside a public server function using the
publishable key. Per decision 7, no full-text search; the view is shaped so a search vector
can be added later without changing the read contract.

### 4. Visibility model

Two independent axes: member intent (visibility) and lifecycle (activity state). The view
requires `published` **and** `active`, so nobody can publish out of an inactive state.
Precedence, first match wins:

| State | Set by | Meaning | Public |
|---|---|---|---|
| `hidden_admin` | Staff | Administrative suppression. Sticky; sync and member edits never clear it. | No |
| `hidden_inactive` | System | Dropped from the feed (grace) or anonymised. Set and cleared automatically. | No |
| `draft` | Member (default) | Profile exists, member has not opted in. **Default on first LIVE import** (decision 2). | No |
| `published` | Member | Opted in and complete. | Yes, while active |

- Returning to the feed restores the member's prior intent rather than force-publishing.
- Staff suppression is audited to `member_sync_events`.
- Completeness gate for `published`: at least one service, one region, one language.
  Photo is **not** required (decision 4).

### 5. Coach / Mentor / Supervisor

One directory, three lenses, driven by `coach_finder_config` so a lens can be switched off
without a code change.

- **Schema** — the five booleans already exist. Accreditation and availability stay
  separate: accreditation is a credential-style fact, availability is current willingness.
  Accreditation without availability shows as a badge but is excluded from "available now".
- **Ownership (decision 3)** — accreditation flags are staff-only, set in the admin member
  detail view; availability flags become member-editable in Milestone F. Import stays out
  of accreditation unless the feed later proves it supplies it, at which point the field
  flips to imported and the admin control becomes read-only.
- **Projection** — the view exposes the five booleans plus a derived `services` array so
  the frontend filters on one field.
- **Filters** — a service selector using the configurable labels, rendered only for enabled
  services, alongside region / language / specialisation / format / credential.
- **Routes (decision 8)** — `/find-a-coach` is canonical. `/find-a-mentor` and
  `/find-a-supervisor` are locale-aware routes that render the same page component with a
  preset service filter and their own `head()` metadata and hero copy. No duplicated
  directory implementation.

### 6. Member Area scope (Milestone F)

- **Read-only imported ICF fields**, labelled as ICF-owned with a "contact ICF to correct
  this" note: name, credential, member type, join and expiry dates, email of record.
  Mentor/supervisor accreditation appears here too, as staff-set and read-only.
- **Editable local fields**: tagline, description, availability label, specialisations,
  languages, regions, formats, and the coaching / mentoring / supervision availability
  flags.
- **Multiple links**: new `member_profile_link_items` table (label, url, sort order, capped
  count, https-only). `website_url` and `linkedin_url` migrate into it. The existing
  `member_profile_links` claim-token table is untouched.
- **Profile image**: optional (decision 4). Private bucket, member-owned path, size and
  type limits, signed URLs; only published profiles' images are publicly readable. Cards
  and profile pages fall back to initials.
- **Visibility controls**: member toggles `draft` ↔ `published` with the completeness gate
  explained inline; `hidden_admin` and `hidden_inactive` render read-only with an
  explanation.
- **Public profile preview**: renders exactly the public view projection.

### 7. Lifecycle emails

All through `sendMemberEmail`, all suppressed until after cutover. Grace window 60 days
(decision 5).

1. **Inactive notice** — on drop from the feed: profile now hidden, deletion date stated,
   renewal pointed at ICF Global.
2. **Deletion reminder** — shortly before `scheduled_deletion_at`, stamped into
   `member_lifecycle_queue.notified_at` so it can never double-send.
3. **Reactivation notice** — on return to the feed: profile restored, states whether it is
   publicly listed again.
4. **Claim invitation** — Milestone G only, gated on `account_claim_enabled`.

Work required: localised templates in DE/FR/IT/EN, a scheduled idempotent notice pass, an
admin view over `member_email_log`, and a transport wired into the current `no_transport`
branch. Per decision 6 the provider stays undecided; the seam is a single function so the
choice is a late, low-risk swap.

### 8. Milestone sequence

**A — TEST sync verification. DONE.** Confirm the TEST endpoint and token, run one manual sync,
inspect run/event/snapshot rows, correct the normaliser against the real response shape,
confirm whether the feed carries mentor/supervisor accreditation (decision 3 revisit
trigger), verify the cron reaches the endpoint, record the baseline count.
*Gate: the real response shape decides the detail of B.*

**B — Directory projection layer.** Auto-create `draft` profiles per active member, map
imported values into vocabularies, build `coach_directory_public` with the safe column list
and `anon` grant, add the public server function, add the admin member detail view with
visibility override and staff-set accreditation flags. The public site keeps the mock
(decision 1) — this milestone ships the read model, not the swap.

**C — Cutover readiness rehearsal.** Repeat syncs for idempotency, exercise grace and
anonymisation over the 60-day window, prove the feed-drop valve aborts, authenticate the
LIVE URL, review archive and purge contents, confirm emails and claim stay off.
*Gate: the cutover is irreversible.*

**D — LIVE cutover.** Execute reset and first LIVE import, all profiles `draft`, verify
counts, emails and claim stay off.

**E — Member Area.** Links table migration, optional image bucket, editable local fields,
read-only ICF panel, visibility controls, public preview, member-scoped RLS.

**F — Directory goes live on real data.** Swap `/find-a-coach` to the projection, add the
service filter and the `/find-a-mentor` + `/find-a-supervisor` entry routes, retire
`src/lib/coaches.ts` only after parity. Sequenced after E because decision 1 ties real
listings to members having opted in.

**G — Lifecycle emails and account claim.** Choose the provider, wire transport, localised
templates, scheduled notice pass, email log admin view, duplicate-email resolution, then
open claim.

Dependencies: A → B → C → D are strictly serial. E depends on D (real members to edit).
F depends on E (decision 1 + 2 mean published profiles only exist once members opt in).
G depends on D for the cutover gate and can run in parallel with E once the provider is
chosen.

Chapter still owes DE/FR/IT copy for the Phase 1 vocabularies and the member-facing email
templates.
