## Next step: finish Milestone B — Directory projection layer

Milestone B's database foundation is in place (verified): `public.coach_directory_public` exists with the four eligibility flags, the eligibility guard trigger is live, and 205 of 501 active TEST members are directory-eligible. Four pieces remain. The public site keeps the mock directory throughout (decision 1) — this ships the read model, not the swap.

### 0. Locked rule: imported location is NOT service area

Canton/region in this project means **where a member wants to work in person**, is **multi-select**, and is **member-declared**. It is not their address.

- Imported ICF address fields (`city`, `country`, and the `zip` / `state` values kept in `members.diagnostics`) stay **read-only reference data**. They are never written into `cf_regions` assignments, never inferred, never used as a default.
- `member_profile_regions` is only ever populated by a member (Milestone E) or by staff acting on their behalf before claim opens.
- New draft profiles therefore start with **no regions selected**.
- Public directory region filtering matches only declared service-area regions; imported city/country never participates in filtering or matching.

### 1. Profile auto-creation in the sync

Verified: `member_directory_profiles` currently holds 0 rows, so nothing is projected yet.

- After each sync run, create a `draft` profile for every active member that has none (decision 2). Batched, idempotent, never touching existing rows.
- **No vocabulary mapping from imported location.** New profiles get zero regions, zero languages, zero specialisations, zero formats. Credential stays where it already is, on `members.credential_slug`.
- Mentor/supervisor accreditation stays untouched by import (decision 3).
- The existing eligibility reconcile then runs as it does today, so ineligible members' new profiles never sit in a publishable state.
- Consequence to accept openly: since `published` requires at least one region (completeness gate, section 4 of the plan), no auto-created profile can be published until a member or staff member declares a service area. That is intended under decision 1.

### 2. Public read grant on the view

Verified: the view currently has no `anon` grant, so the public path cannot read it yet.

- Migration granting `SELECT` on `coach_directory_public` to `anon` and `authenticated` only — never on the base tables beyond the narrow column grants already in place.
- Confirm the view exposes only declared `region_slugs`; imported city/country remain reference columns on the card, clearly distinct from service area, and are not filterable.
- Re-confirm through an anonymous query that no email, phone, `cst_recno` or membership date is reachable, and that only `is_directory_visible` rows come back.

### 3. Public directory query function

- New `src/lib/directory.functions.ts`: a public (unauthenticated) server function using the publishable-key server client, querying the view with filters for service, region, language, specialisation, format and credential, plus paging from `coach_finder_config.page_size`. Filters only, no full-text search (decision 7).
- The region filter matches `region_slugs` (declared service areas) exclusively. A member with no declared region is unreachable by region filter by design.
- Returns the safe projection shape the directory cards will later consume. Not yet wired into `/find-a-coach`.

### 4. Admin member detail view

Gap 7 in the plan: there is currently no per-member screen.

- New route `/members/$id` in the CMS, admin-only, linked from the members list.
- **Imported ICF panel (read-only reference):** name, email, credential, award/expiry dates, membership dates, activity state, last sync, plus city / state / zip / country labelled explicitly as imported address data, not service area.
- **Service-area panel (editable, separate):** multi-select over `cf_regions`, empty by default, with a note that this is where the member offers in-person work. Staff may set it before member claim opens; it is the same field members will own in Milestone E.
- Eligibility diagnostics: the four concepts shown separately (active member / has directory credential / eligible / visible) with the reason when not eligible.
- Staff controls: mentor and supervision accreditation flags, and a visibility override that can set or clear `hidden_admin`. Publishing controls are disabled with an inline reason when the member is ineligible or has no declared service area — the database trigger remains the real boundary.
- Every staff change audited into `member_sync_events`.
- Localised strings for DE/FR/IT/EN.

### Future Member Area (Milestone E) — recorded now

Service-area regions are a member-owned, multi-select field in the Member Area, prefilled with nothing and never derived from the imported address. The read-only ICF panel there shows the imported address as reference with the "contact ICF to correct this" note, visually separated from the service-area selector.

### Verification before calling B done

Run a sync against TEST; confirm ~501 draft profiles created, that every one has zero regions, and that a re-run creates none. Confirm the view returns 0 rows for anon (nothing published yet), that a manually completed and published eligible profile appears, and that an ineligible one is rejected by the trigger. Typecheck clean; admin detail view exercised in the browser.

### Technical notes

- No new tables in this milestone; `cf_regions` and `member_profile_regions` are used as-is, just never auto-filled.
- `src/lib/directory-eligibility.ts` stays the single source for explaining decisions in the UI; the database stays the enforcement boundary.
- After this, Milestone C (cutover readiness rehearsal) is next; C → D remain strictly serial.
