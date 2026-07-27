## Confirmation of current state (verified)

- **Settings are admin-only today.** `/_staff/coach-finder` writes `coaching_enabled` / `mentoring_enabled` / `supervision_enabled` and their labels to `coach_finder_config`. `src/components/coaches/directory.tsx` never reads that table — it only reads the six vocabularies — so nothing on `/find-a-coach` reacts to the toggles.
- **No data/model changes are needed.** The `coach_directory_public` view already exposes a `services` text array derived from `coaching_available` / `mentoring_available` / `supervision_available`, and `queryCoachDirectory` already accepts and applies a `services` filter (`overlaps`). `coach_finder_config` already has a public read policy for `anon`, and `fetchCoachFinderConfig()` already exists in `src/lib/vocabularies.ts`. This is purely missing UI wiring.
- **Proposed connection:** the public page reads the same config row, derives the list of active modes, renders a switcher only when more than one is active, and passes the selected mode's slug as the `services` filter to the existing server function. Mode lives in the URL so it is shareable and back/forward works.

## What to build

**1. Mode source (no hardcoded tabs)**

Add a small helper in `src/lib/vocabularies.ts`:

```ts
export type FinderMode = { slug: "coaching" | "mentoring" | "supervision"; label: string };
export function activeFinderModes(config: CoachFinderConfig | null): FinderMode[]
```

It maps enabled flags to `{ slug, label }` using the configured label strings, in the fixed order coaching → mentoring → supervision. The public page renders whatever this returns — adding/renaming a mode in settings is the only place tabs change.

**2. Public switcher in `src/components/coaches/directory.tsx`**

- New `useQuery(["coach-finder-config"], fetchCoachFinderConfig)` alongside the existing vocabularies query, same 5-minute `staleTime`.
- New `ModeTabs` sub-component: a segmented control rendered as `role="tablist"` with `role="tab"` / `aria-selected` buttons, styled with the site's pill + `CARD_SHADOW` language (rounded-full track, active pill in `bg-primary text-primary-foreground`, inactive `text-muted-foreground`) rather than the prototype's underline tabs, per the site style rule. Keyboard arrow-key navigation between tabs.
- Rendered above the results column, spanning the grid, so it reads as a page-level control.
- **Rendered only when `activeFinderModes(...).length > 1`.** Zero or one active mode renders nothing.

**3. Wiring mode into search behavior**

- Selected mode slug is added to the `filters` memo as `services: [mode]`, so the existing server-side `overlaps("services", …)` does the filtering. When exactly one mode is active it is still applied as a filter (so the result set is correct) even though no tabs are shown.
- Changing mode resets `page` to 0 and clears the facet selections that are mode-specific (specialisations, credentials), matching the prototype's `setState({ tab, credentials: [], specialties: [] })`. Region/language/free-text persist.
- `clearAll()` clears filters but keeps the current mode (mode is navigation, not a filter).

**4. URL / query state**

- Add `validateSearch` with `zodValidator` + `fallback` to both `src/routes/find-a-coach.tsx` and `src/routes/$locale/find-a-coach.tsx`: `{ mode: fallback(z.string(), "").default("") }`.
- The directory reads it via `useSearch({ strict: false })` and writes with `navigate({ search: prev => ({ ...prev, mode }) })`. An empty or unrecognised `?mode=` falls back to the first active mode, so an old link to a since-disabled mode degrades gracefully instead of showing an empty list.

**5. Copy reflected consistently**

New keys in the four `directory.json` files (EN/DE/FR/IT):

- `modes.aria` — accessible label for the tablist.
- `results.manyMode` / `results.oneMode` — result count phrased with the mode label, e.g. "18 coaches" vs "3 mentors"; falls back to the existing generic strings when no mode is resolvable.
- `results.emptyModeBody` — empty-state line that names the active mode ("No {mode} match your filters yet — try widening canton or specialisation.").

The tab labels themselves are **not** translated in JSON: they come from the admin-configured label fields, as requested.

## Technical notes

- No migration, no view change, no new columns. The `services` array and its filter path already exist and are exercised by the server function's schema.
- Mode ordering and label text are owned entirely by `coach_finder_config`; the component contains no mode literals beyond the three slug names the view emits.
- Config fetch failure degrades to "no tabs, no services filter" — the directory keeps working exactly as today.

## Verification

- Toggle each mode in `/coach-finder` settings and confirm the public page shows 0, 2, or 3 tabs accordingly, with renamed labels appearing immediately after a reload.
- Switch tabs and confirm the URL gains `?mode=mentoring`, the result count and empty-state copy name the mode, pagination resets, and a reload restores the same tab.
- Confirm the single-mode case renders no tab strip but still filters results to that service.
