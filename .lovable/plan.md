# Cleanup & documentation pass

Scope: consolidate genuinely duplicated logic, give the articles CMS the same server-function boundary every other domain already has, and write current-state docs. No redesign, no cosmetic churn, no behaviour change.

## Part 1 — Assessment (already done, summarised)

Healthy: `src/lib` domain modules, `directory-eligibility.ts` as the eligibility source of truth, member/coach/admin server-function boundaries, `CoachProfile.tsx` and `coaches/directory.tsx` as presentation-only.

Debt, in priority order:
1. `src/routes/_staff/articles.$id.tsx` (602 lines) is the only domain with no server-function layer — direct Supabase reads, debounced autosave, status transitions, delete and image upload all inline in a route component.
2. Three independent signed-URL implementations with three different TTLs (24h / 1h / 10 years) and bucket names as magic literals in three files.
3. The publish gate ("directory-eligible + at least one region") is expressed three separate times: server, staff UI, member UI.
4. The anon Supabase client construction (publishable-key `apikey` workaround) is copy-pasted across three `.functions.ts` files.
5. `loadIntegrationConfigAdmin` — the config hub for sync, claim and cutover — lives in a file named `member-email.server.ts`.
6. No root README, no `docs/`; architecture knowledge sits in five point-in-time `.lovable/plan-rev*.md` files.

## Part 2 — Refactor pass

Each item is behaviour-preserving. Existing TTLs, route behaviour and the public data contract stay exactly as they are.

### 2.1 Storage helpers — `src/lib/storage.server.ts` (new) + `src/lib/storage.ts` (new)
- Server module owns bucket names and TTL constants as named exports (`PROFILE_IMAGE_BUCKET`, `ARTICLE_IMAGE_BUCKET`, `PROFILE_IMAGE_TTL`, …) plus `signOne()` / `signMany()` wrappers.
- `directory.functions.ts` `signProfileImages` becomes a thin call into it, keeping the 24h TTL.
- The browser-side path in `MemberProfileEditor.tsx` keeps calling the browser client (moving it server-side would change upload behaviour) but imports the shared bucket constant from a small client-safe `storage.ts` instead of re-declaring `PHOTO_BUCKET`.
- Article image signing moves behind the same helper once 2.4 lands.

### 2.2 Shared anon client — `src/lib/supabase-public.server.ts` (new)
One `publicSupabaseClient()` factory with the `apikey`-header workaround and its explanatory comment. `directory.functions.ts`, `deck-download.functions.ts` and `organisation-survey.functions.ts` each drop their copy.

### 2.3 Publish gate — one predicate
Add `canPublishDirectoryProfile({ eligible, regionCount })` (plus a reason enum) to the existing `src/lib/directory-eligibility.ts`. All three call sites use it. Same truth table as today.

### 2.4 Articles domain gets a server-function layer
- New `src/lib/articles.server.ts` — load article + categories + author options, save/patch, status transition, delete, image upload/sign.
- New `src/lib/articles.functions.ts` — `createServerFn` wrappers with `requireSupabaseAuth`, matching the `members.functions.ts` shape. Thin-wrapper rule respected (imports + exported server fns only).
- `src/routes/_staff/articles.$id.tsx` keeps its editor UI, debounce timing and autosave semantics but calls the server functions instead of Supabase directly. Target: roughly 350 lines, with the editor form extracted to `src/components/cms/ArticleEditorForm.tsx` if the split is clean.
- Explicitly out of scope: changing autosave cadence, status-machine rules, or the 10-year article image TTL.

### 2.5 Config module rename
`loadIntegrationConfigAdmin` moves from `member-email.server.ts` to a new `src/lib/integration-config.server.ts`; the four importing modules update. `member-email.server.ts` keeps only the email gate.

### 2.6 Not doing (deliberately)
- No split of `member-sync.server.ts` or `cutover.server.ts` — long but procedural by nature, well commented, and touching them before go-live is the wrong risk trade.
- No restructuring of `coaches/directory.tsx` beyond hoisting the repeated `"not-accepting"` literal to a named constant.
- No change to `translations.functions.ts` auth. Instead, its RLS-only boundary is verified against the actual policies and the result is written into `docs/architecture.md` — flagged as debt if the policies turn out weaker than the explicit-check pattern.

## Part 3 & 4 — Documentation deliverables

### `README.md` (root, new)
What ICF Switzerland's site is; the four functional areas (public site, coach directory, member area, staff CMS + member backend); high-level architecture; stack (TanStack Start on Cloudflare Workers, Supabase, Tailwind v4); folder layout; where to start reading; env/config concepts including the TEST/LIVE `integration_config` switch; links into `docs/`; a status section separating shipped from gated/pending for go-live.

### `docs/` (new)
- `docs/architecture.md` — layers and boundaries, the public-safe / member-only / staff-only trichotomy and exactly where each is enforced (RLS, the `coach_directory_public` view, `requireSupabaseAuth`, `assertAdmin`), Supabase surface (tables, the public view, security-definer functions, buckets, key policies), image-handling strategy and why the buckets are private.
- `docs/code-map.md` — module-by-module ownership table: every `*.functions.ts`, `*.server.ts`, route group and key component, with its responsibility and auth boundary.
- `docs/auth-and-claim-flow.md` — the role model, the `members.auth_user_id` binding rule (never email equality), the custom hashed-token claim state machine, and the flags that keep it switched off.
- `docs/public-directory.md` — finder flow end to end: filters, mode tabs, pagination, eligibility/visibility states, the detail page, signed images.
- `docs/operations-and-go-live.md` — sync job and cron, integration modes, cutover and rehearsal, email suppression, lifecycle/anonymisation, plus the outstanding go-live checklist distilled from `.lovable/plan.md`.
- `docs/tech-debt.md` — known follow-ups, including the ones this pass deliberately skips.

The `.lovable/plan-rev*.md` files stay as historical record; `docs/` becomes the living reference and the README points there.

## Verification

After the refactor: typecheck, then a Playwright pass over `/find-a-coach`, a coach detail page, `/my-profile` (photo upload + publish gate) and the staff article editor (load, autosave, status change, image upload) to confirm identical behaviour. Public directory JSON shape compared before/after.

## Deliverables

Refactored code as above; README; six docs files; a written summary of what changed and why; a tech-debt list.
