# Operational structure: clearer project list

## Answer to your question first

The up/down arrows are **not decorative** — `sort_order` is read by the public site:

- `/team` uses it to order the project filter chips and the grouping of members.
- `/communities` and the About-page preview list communities in the same order.

So the ordering has a real function, but it is exposed in the wrong place: 22 rows of arrows dominate the sidebar even though reordering is a rare, once-a-year action.

## What changes

### 1. Split the sidebar into two labelled groups

The list is a flat mix of committees and local communities. It becomes two sections with small uppercase headings:

```text
GENERAL PROJECTS          LOCAL COMMUNITIES
Board                     Community Zürich
Events                    Community Basel
Communication & Marketing Community Bern
...                       ...
```

Inactive projects keep the dimmed style. Each community row gets a small pin/map marker icon so the type is readable even when scrolling.

### 2. Reordering moves out of the way

Arrows are no longer permanently visible. Instead, a single **Reorder** toggle sits above the list. Off (default): a clean, calm list. On: arrows appear on each row, scoped to its own group, with a one-line hint that the order controls how projects appear on the public team and communities pages.

### 3. Project type becomes an explicit choice

The "This project is a local community" checkbox — currently buried in a separate card below project details — is promoted into **Project details** as a two-option segmented control:

- **General project** — committee or working group, appears on /team only
- **Local community** — regional community, also published on /communities

Choosing "Local community" reveals the community content fields (description, cadence, contact, sign-up link, languages, regions, translations) inside the same card, so the two cards stop looking like unrelated settings. "Feature on the About page" stays a checkbox but only inside the community branch.

## Technical notes

- Files: `src/routes/_staff/operational-structure.tsx` (sidebar grouping, reorder toggle, type control) and `src/components/cms/CommunityPanel.tsx` (drop the standalone header/checkbox; expose the fields as a section driven by the parent's type control).
- `move()` already swaps `sort_order` between two adjacent rows. With grouping, the swap must use the neighbour **within the same group**, so the two groups sort independently while still writing to the same `sort_order` column. No schema change, no migration.
- New i18n keys in `cms.json` for all four locales: group headings, reorder toggle, hint text, and the two type labels. Existing `ops.community.*` keys are reused.
- No change to any public page, query, or RLS policy.

## PR note

**Summary** — Makes the staff operational-structure screen easier to read by grouping projects vs. local communities, hiding rarely-used reorder arrows behind a toggle, and turning the community flag into an explicit project-type choice.

**Changes** — Staff CMS UI only: sidebar grouping + reorder toggle (`operational-structure.tsx`), community panel folded into project details (`CommunityPanel.tsx`), new locale keys in four `cms.json` files.

**Backend / schema changes** — None.

**Testing & verification** — Switch a project between general and community and confirm it moves group and that /communities reflects it; reorder inside each group and confirm /team chip order follows; check an inactive project still renders dimmed; typecheck.

**Risks & rollback** — Presentation-only, revert by reverting the two components and locale keys.

**Follow-ups** — Drag-and-drop reordering instead of arrows, if the toggle still feels clunky.
