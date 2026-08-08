# "Who we serve" segment picker on /for-organisations

Add an interactive audience-segment section between "The case for coaching" and "How we work", and let the chosen segment lightly adapt two later sections on the same page.

## What the visitor sees

- A new section, anchored at `who-we-serve`, with the eyebrow "Who we serve" and the heading "From intergovernmental Geneva to Swiss boardrooms and beyond."
- Five segment cards — Intergovernmental (IGO), Non-governmental (NGO / INGO), Governmental (Swiss), Commercial, Societal — each with a one-line definition and a short "how coaching fits" angle. A row on desktop, a swipeable horizontal strip on mobile (same touch pattern as the evidence deck).
- Picking one card highlights it; only one at a time. A "See all" control clears the selection. Cards are real buttons, so Tab/Enter/Space work and focus is visible.
- With a segment active:
  - "Ways to work with us" gains one short line above the three cards: "Common for [segment]: [route]". All three routes stay visible and unchanged.
  - "Featured programmes" reorders so the most relevant of the three cards comes first. All three stay visible.
- With nothing selected, both sections look exactly as they do today.

## Segment to downstream mapping

| Segment | Typical route | Programme shown first |
| --- | --- | --- |
| Intergovernmental | Pilot | Executive coaching |
| Non-governmental | Scale (team coaching) | Team coaching |
| Governmental (Swiss) | Pilot | Coaching cultures |
| Commercial | Embed | Executive coaching |
| Societal | Scale (team coaching) | Team coaching |

## Technical notes

- New component `src/components/organisations/WhoWeServe.tsx`, rendered from `src/pages/ForOrganisations.tsx` directly after `<DeckSection />`.
- Selection lives in `useState<SegmentId | null>` in `ForOrganisations.tsx` (page-session only, no persistence, no URL param). Passed down as an optional prop to `WhoWeServe`, to `Initiatives` (in `src/components/organisations/sections.tsx`) and to the inline programmes grid.
- `Initiatives` gains an optional `contextLine?: string` prop; when absent it renders unchanged, so nothing else importing it is affected.
- Programme reordering is a stable index reorder of the existing `organisations.programmes.items` list — no copy duplication, no card removal.
- Card styling reuses `CARD_SHADOW`, `rounded-2xl border border-border bg-card`, the `eyebrow` / `section-label` type utilities and existing marks, matching the "Why ICF" grid. Selected state = `border-primary` plus a light `bg-accent/10` tint and `aria-pressed`, not a full colour swap.
- Fixed card min-height and a reserved slot for the contextual line so switching segments causes no layout shift.
- Copy added under a new `organisations.segments.*` key in `src/i18n/locales/{en,de,fr,it}/organisations.json`, including the section heading, the five segments, the "See all" label and the "Common for {segment}: {route}" pattern. Sector-generic wording only — no named organisations, logos or testimonials.

## PR note

**Summary** — Adds a "Who we serve" segment picker to the organisations landing page and uses the selection to add a contextual line to "Ways to work with us" and reorder "Featured programmes".

**Changes**
- UI: new `WhoWeServe.tsx`; segment state and wiring in `ForOrganisations.tsx`; optional `contextLine` prop on `Initiatives`.
- Content: new `organisations.segments` block in all four locale files.

**Backend / schema changes** — None.

**Testing & verification** — Keyboard selection and reset, mobile swipe strip, desktop row, downstream line and reorder for each of the five segments, and the default (nothing selected) state across locales.

**Risks & rollback** — Additive and page-local; revert the component plus the two call sites. No data or auth impact.

**Follow-ups** — The segment could later filter case studies or the culture assessment; out of scope here.