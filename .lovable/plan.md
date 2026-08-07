# Coach Finder: random unfiltered sample, filtered results, pagination

## What changes for visitors

- Opening **Find a coach** with no filters shows **8 randomly chosen** published coaches out of all available ones, instead of the first alphabetical page. The selection reshuffles on each page load, so every coach gets exposure.
- As soon as any filter is used (region, language, credential, specialisation, format, free text, availability, or a mode tab switch), the list switches to the normal, complete, alphabetically sorted result set.
- Pagination (prev/next) stays for filtered results and appears whenever there are more matches than fit one page (page size 12, from the Coach Finder config). The random showcase itself has no pagination — it is a single set of 8.
- The result count line reads as a showcase in the unfiltered state (e.g. "Showing 8 of 47 coaches") and as an exact count when filtered.

## Technical notes

**Server (`src/lib/directory.functions.ts`)**
- Add an optional `sample` number to the filter schema. When set and no facet filters are active:
  1. Select only `profile_id` from `coach_directory_public` (mode filter still applied) with `count: 'exact'`.
  2. Shuffle those ids in the handler and take `sample` (max 8).
  3. Re-query full rows for those ids, sign only their images, resolve locale.
  4. Return `{ entries, total, page: 0, pageSize: sample }` plus a `sampled: true` flag so the UI knows not to paginate.
- Filtered path is unchanged (server-side facets, alphabetical order, ranged pagination).

**Hook (`src/components/coaches/directory/useCoachDirectoryFilters.ts`)**
- Derive `isUnfiltered` from the existing `dirty` flag plus `page === 0`; pass `sample: 8` in the query input when unfiltered.
- Include a per-mount shuffle seed in the query key so React Query doesn't reshuffle on every re-render but does on reload/mode change.
- `hasMore` / prev-next visibility: false while sampled; unchanged otherwise.
- Count label: new i18n key for the showcase wording, existing keys for the filtered case.

**UI (`CoachResultsGrid.tsx`)**
- Hide pagination controls when the result set is a random sample (prop passthrough only, no layout change).

**i18n**
- Add `directory.results.sample` (and its mode-specific variant) to `en`, `de`, `fr`, `it` directory namespaces.

## PR note

- **Summary** — Unfiltered Coach Finder now shows a random 8-coach showcase; filtered searches keep the full paginated, alphabetical result set.
- **Changes** — UI: hide pagination for sampled results, new count wording, 4 locale files. Backend: `queryCoachDirectory` gains an optional random-sample path.
- **Backend / Schema changes** — None (no migration; reads the existing `coach_directory_public` view).
- **Testing & Verification** — Load `/find-a-coach` unfiltered (8 cards, no pager, reshuffles on reload), apply each facet (full results, pager appears above 12 matches), switch mode tabs, verify all four locales and the empty state.
- **Risks & Rollback** — Low; isolated to the public finder read path. Revert the two files plus locale strings.
- **Follow-ups** — If a stable daily rotation is preferred over per-load randomness, seed the shuffle by date instead.
