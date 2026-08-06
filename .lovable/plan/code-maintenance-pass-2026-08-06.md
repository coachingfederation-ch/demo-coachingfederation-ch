# Code maintenance pass

A tidy-up, not a refactor. Three deliverables: a large-file inventory with split proposals, a smell report by area, and file-level comment headers. No behaviour changes.

## Scope

277 source files. Vendored/generated code is excluded from commenting and smell work: `src/components/ui/*` (shadcn), `src/components/ai-elements/*`, `src/routeTree.gen.ts`, `src/integrations/supabase/*`. That leaves ~180 hand-written files, 101 of which already have a top comment.

## 1. Large files (over ~300 lines, ours only)

| File | Lines | Proposed split |
|---|---|---|
| `src/pages/Privacy.tsx` | 1447 | Legal copy per locale into `src/content/privacy/{en,de,fr,it}.ts`; page becomes a thin renderer over `LegalPageShell`. |
| `src/components/cms/MemberProfileEditor.tsx` | 863 | Extract `useMemberProfileForm` (state + save), photo upload into `ProfilePhotoField`, and the section blocks (identity / practice / languages / visibility) into sibling components. |
| `src/routes/_staff/operational-structure.tsx` | 659 | Route keeps loader + layout; move the project group list, project form dialog and role-assignment editor into `src/components/cms/ops/*`. |
| `src/components/coaches/directory.tsx` | 648 | Split into `CoachCard`, `CoachFilters`, `CoachResultsGrid`, plus a `useCoachDirectoryFilters` hook for the URL-param sync. |
| `src/routes/_staff/articles.$id.tsx` | 609 | Extract `useArticleEditor` (load/save/status transitions); separate the metadata sidebar from the editor pane. |
| `src/lib/europe-pulse.server.ts` | 591 | Separate crawl/fetch, AI summarisation, and persistence into three modules behind the current exports. |
| `src/routes/_staff/roles.tsx` | 581 | Extract the invite dialog and the role table rows; keep mutations in one hook. |
| `src/routes/_staff/manage.events.$id.tsx` | 575 | Already sectioned visually — turn each section (details, content, location, hosts, publishing) into its own component; extract `useEventEditor`. |
| `src/pages/CoachProfile.tsx` | 540 | Split hero, "How I work", and sidebar into subcomponents; move localized copy to a strings module. |
| `src/routes/_staff/members.$id.tsx` | 520 | Extract sync-status panel and claim-status panel. |
| `src/pages/Home.tsx` | 483 | Section components already exist in `src/components/home/*`; move the remaining inline sections and the copy dictionary out. |
| `src/lib/member-claim.server.ts` | 475 | Split the claim state machine from token issuing and email dispatch. |
| `src/lib/member-sync.server.ts` | 472 | Split SOAP mapping, diffing/change-kind logic, and snapshot writing. |
| `src/components/site-chrome.tsx` | 441 | Split `Header`, `MobileMenu`, `LanguageSwitcher`, `Footer` into files under `src/components/chrome/`. |
| `src/routes/_staff/manage.europe-pulse.tsx` | 419 | Extract the item review card and the run-controls bar. |
| `EventDetail.tsx`, `Events.tsx`, `member-profile.server.ts`, `_staff/integration.tsx`, `member-admin.server.ts` | 380-406 | Borderline. Only the localized copy dictionaries need extracting; structure is otherwise fine. |
| `CultureSurvey.tsx`, `AssistantWidget.tsx`, `ProfileTranslationsPanel.tsx`, `icf-soap.server.ts`, `Insights.tsx`, `CommunityPanel.tsx` | 307-362 | Leave as-is; single responsibility, size comes from localized strings. |

Common thread: most oversized files are large because a four-language copy dictionary lives inline. Extracting those dictionaries alone takes roughly a third off many files with near-zero risk.

## 2. Code smells by area

**Staff routes (`src/routes/_staff/*`)**
- Repeated "load record, mirror into local state, save, toast" pattern in `articles.$id`, `manage.events.$id`, `roles`, `members.$id` — each carrying its own `eslint-disable react-hooks/exhaustive-deps`. Candidate for one shared `useEditorRecord` hook.
- Ad-hoc `toLocaleDateString` formatting in `articles.index.tsx` and `members.index.tsx` duplicates logic already in `src/lib/articles.ts`.

**Translation panels** — `cms/TranslationsPanel.tsx`, `cms/EventTranslationsPanel.tsx`, `member/ProfileTranslationsPanel.tsx` are near-identical (236 / 231 / 359 lines): same locale tabs, AI-translate call, dirty tracking. One generic panel with a per-entity adapter would remove the largest duplication in the codebase.

**Pages (`src/pages/*`)** — every page carries its own inline locale-keyed `copy` object. Consistent, but it inflates files and scatters copy. Several pages also repeat the same section-wrapper markup (padding, max-width, surface class) instead of a shared `Section` primitive.

**`src/lib/*`** — three naming conventions coexist: `*.server.ts`, `*.functions.ts`, and bare `*.ts` (e.g. `articles.ts` / `articles.server.ts` / `articles.functions.ts`). The rule is real but undocumented; a short `src/lib/README.md` fixes comprehension without moving files.

**Dead code**
- `src/lib/error-capture.ts` and `src/hooks/use-mobile.tsx` have no importers.
- Unused exports worth dropping: `MARK_NAMES` (marks), `HEX_CLIP` (TeamGrid), `PHOTO_BUCKET` (MemberProfileEditor), `initials` and `CoachCard` (directory), `excerpt` (CommunityCard), `Logo` and `SiteNav` (site-chrome).
- 12 stray `console.log` / `console.debug` calls outside vendored code.
- ~34 unused shadcn `ui/*` files plus their Radix dependencies. Removing them means future shadcn additions reinstall the same packages — recommend leaving them.

**Magic values** — hardcoded hex colours in `src/routes/staff-sign-in.tsx` bypass the ICF tokens. `src/lib/error-page.ts` also hardcodes hex, but it emits a standalone HTML string with no access to tokens, so that one is legitimate.

**Nesting / prop drilling** — no severe cases. `directory.tsx` and `operational-structure.tsx` pass filter state down three levels, which the proposed extractions resolve naturally.

## 3. File-level comments

Add a 2-4 line header to each hand-written source file that lacks one (~80 files), covering purpose, main exports, and place in the app. Existing headers stay untouched. Format:

```text
/**
 * Coach directory grid with canton/language/credential filters.
 * Exports: CoachDirectory. Reads filter state from URL params via finder-search.
 * Rendered by src/pages/FindACoach.tsx.
 */
```

## Prioritized summary

**Safe to do now (no behaviour change, no decision needed)**
1. File-level comment headers on the ~80 files missing them.
2. Delete `src/lib/error-capture.ts` and `src/hooks/use-mobile.tsx` after a final reference check.
3. Remove the seven unused exports listed above.
4. Remove the 12 stray console statements.
5. Replace hardcoded hex in `staff-sign-in.tsx` with existing tokens.
6. Add `src/lib/README.md` documenting the `.server` / `.functions` / plain-module convention.

**Needs your decision (real refactors, separate pass)**
- Unify the three translation panels behind one generic component.
- Extract localized copy dictionaries into `src/content/*` across pages.
- The 15 large-file splits in section 1, especially `Privacy.tsx`, `MemberProfileEditor.tsx`, `directory.tsx` and `site-chrome.tsx`.
- A shared `useEditorRecord` hook for the staff editors.

**Fine as-is**
- All `src/components/ui/*` and `src/components/ai-elements/*` vendored code, including unused files and dependencies.
- Files in the 300-360 line band marked "leave as-is".
- The `.server` / `.functions` split itself — correct for the server boundary, it just needs documenting.

## PR note (safe-to-do-now batch)

- **Summary** — Documentation and dead-code tidy-up; no runtime behaviour changes.
- **Changes** — File header comments across ~80 files; removal of two unused modules, seven unused exports and 12 console statements; token-based colours on the staff sign-in route; new `src/lib/README.md`.
- **Backend / schema changes** — None.
- **Testing & verification** — Typecheck and build; smoke-check home, find-a-coach, events, staff sign-in and the article editor.
- **Risks & rollback** — Low. Deletions are the only real risk; each is preceded by a reference search. Revert is a single commit.
- **Follow-ups** — Everything under "Needs your decision" stays open.