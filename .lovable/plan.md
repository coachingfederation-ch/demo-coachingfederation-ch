# Deferred refactor pass

Execute the four items left open by the maintenance pass. No behaviour, copy, styling or data changes — every phase is a pure move/extract, verified by typecheck, build and a route smoke check.

Phases ship in order, each as its own reviewable batch, so a regression can be traced to one phase.

## Phase 1 — Extract localized copy into `src/content/*`

`src/content/` does not exist yet. Create it and move the inline four-language `copy` dictionaries out of the page and route files that carry them. Text is moved verbatim; keys keep their current names.

```text
src/content/
  privacy/{en,de,fr,it}.ts     legal copy, one file per locale
  home.ts, coach-profile.ts, events.ts, event-detail.ts, insights.ts, ...
```

Biggest wins: `Privacy.tsx` (1474 lines, mostly legal prose), `Home.tsx` (468), `CoachProfile.tsx` (540), plus the 380-406 line borderline files where the dictionary is the only bloat.

## Phase 2 — Unify the three translation panels

`cms/TranslationsPanel.tsx` (240), `cms/EventTranslationsPanel.tsx` (231) and `member/ProfileTranslationsPanel.tsx` (359) share the same locale tabs, AI-translate call and dirty tracking. Replace with one generic panel plus a small per-entity adapter describing the translatable fields, load/save calls and labels. The three existing component names stay as thin wrappers so no call site changes.

## Phase 3 — Shared `useEditorRecord` hook for staff editors

`articles.$id`, `manage.events.$id`, `roles` and `members.$id` each repeat "load record, mirror into local state, track dirty, save, toast", each with its own `exhaustive-deps` disable. One hook in `src/hooks/use-editor-record.ts` covers the pattern; each route keeps its own validation and field layout.

## Phase 4 — Split the large files

In descending priority, after Phase 1 has already shrunk several of them:

| File | Now | Split into |
|---|---|---|
| `components/cms/MemberProfileEditor.tsx` | 863 | `useMemberProfileForm`, `ProfilePhotoField`, section components (identity / practice / languages / visibility) |
| `routes/_staff/operational-structure.tsx` | 659 | route keeps loader + layout; group list, project dialog, role editor into `components/cms/ops/*` |
| `components/coaches/directory.tsx` | 648 | `CoachCard`, `CoachFilters`, `CoachResultsGrid`, `useCoachDirectoryFilters` |
| `components/site-chrome.tsx` | 469 | `components/chrome/{Header,MobileMenu,LanguageSwitcher,Footer}.tsx`; `site-chrome.tsx` re-exports |
| `lib/europe-pulse.server.ts` | 587 | crawl/fetch, AI summarisation, persistence — same exports |
| `lib/member-claim.server.ts` | 475 | state machine / token issuing / email dispatch |
| `lib/member-sync.server.ts` | 472 | SOAP mapping / diffing + change-kind / snapshot writing |
| `routes/_staff/manage.events.$id.tsx` | 579 | one component per existing visual section |
| `routes/_staff/{roles,members.$id}.tsx`, `manage.europe-pulse.tsx` | 581 / 522 / 414 | dialogs, table rows, review card, run-controls bar |
| `pages/CoachProfile.tsx` | 540 | hero, "How I work", sidebar subcomponents |

`Privacy.tsx` becomes a thin renderer over the Phase 1 content files.

## Technical notes

- Server-boundary naming is preserved: split modules keep the `.server.ts` suffix, and no server-only module becomes reachable from a client import chain.
- Every file declaring `createServerFn` stays a thin wrapper — extracted helpers move into imported modules, never left as runtime siblings.
- New files get the 2-4 line header comment already used across the codebase.
- Route files keep their existing `head()` metadata and loaders untouched.
- Prettier-formatted, lint-clean; formatting stays out of these commits.

## PR note

- **Summary** — Structural refactor of the four items deferred by the maintenance pass: locale copy extraction, unified translation panel, shared staff-editor hook, and large-file splits. No functional change.
- **Changes** — UI: new `src/content/*` modules, `src/components/chrome/*`, `src/components/cms/ops/*`, subcomponents for the coach directory, member profile editor and event editor. Logic: one generic translations panel with per-entity adapters; `useEditorRecord` hook; server libs split by concern behind unchanged exports.
- **Backend / schema changes** — None.
- **Testing & verification** — Typecheck and build after each phase; browser smoke pass on home, privacy, find-a-coach, coach profile, events + event detail, insights, and the staff article / event / member / roles / operational-structure editors plus the three translation panels as staff.
- **Risks & rollback** — Medium overall, low per phase. Highest risk is Phase 2 (behaviour convergence between three similar panels) and the server-lib splits (import-boundary regressions). Each phase is a separate commit and reverts independently.
- **Follow-ups / known debt** — Unused shadcn `ui/*` files stay in place by earlier decision; `pages/*` section-wrapper markup is not yet consolidated into a shared `Section` primitive.
