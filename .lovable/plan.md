# Fix the background-colour rhythm on "For organisations"

## What's wrong today

The page walks through five different surface treatments with no rule behind them:

```text
Hero              indigo
Proof bar         white
Outcomes          lavender (page base)
Differentiators   lavender (page base)   <- two identical bands in a row
Deck section      indigo                 <- second heavy indigo block, mid-page
Steps             grey "muted"
Initiatives       grey "muted"           <- two identical bands in a row
Programmes        lavender (page base)
Culture survey    grey "muted"
Events strip      lavender (page base)
Closing CTA       indigo                 <- third indigo block
```

Two of the light tones (page base lavender and "muted" grey) are almost the same
value, so switching between them reads as accidental rather than intentional, and
the indigo blocks land in an uneven rhythm.

## The rule to apply

Three surfaces, each with one job:

- **Base** — the soft lavender page background. Default for content sections.
- **Raised** — white. Only for sections that are card/list/form surfaces, so white
  always means "something to read or interact with", never decoration.
- **Anchor** — indigo. Reserved for exactly two moments: the hero at the top and
  the closing CTA at the bottom. Nothing else in the page body goes full indigo.

Never place two identical surfaces back to back — the sequence alternates
base / raised.

## Resulting sequence

```text
Hero              anchor  (indigo)
Proof bar         raised  (white strip under the hero)
Outcomes          base
Differentiators   raised
Deck section      base    (was indigo)
Steps             raised
Initiatives       base
Programmes        raised
Culture survey    base
Events strip      raised
Closing CTA       anchor  (indigo)
```

The deck carousel keeps its weight without going full indigo: slide cards stay
white and the indigo is reduced to accent details (eyebrow, arrows, dot
indicators) so it no longer competes with the hero and the closing CTA.

The grey "muted" tone disappears from section backgrounds entirely; it stays in
use for small interior elements (progress bars, hover states, chips).

## Technical notes

- Files touched: `src/pages/ForOrganisations.tsx`,
  `src/components/organisations/sections.tsx`,
  `src/components/organisations/DeckSection.tsx`,
  `src/components/organisations/CultureSurvey.tsx`.
- No new colour values. The rhythm uses existing tokens (`bg-background`,
  `bg-card`, `bg-hero`); `bg-muted` is removed from section wrappers only.
- Cards sitting on a white section get a slightly stronger border so their edges
  stay legible on raised bands.
- Deck section: swap `bg-hero text-hero-foreground` for the base surface and
  recolour carousel chrome (arrows, dots, focus ring) to indigo/border tokens;
  the `bg-white/…` literals inside it become semantic tokens.
- Purely presentational — no copy, layout, data or logic changes.

## PR note

**Summary** — Establishes a consistent three-surface background rhythm on the
"For organisations" page (base lavender / raised white / indigo anchor) so colour
changes follow a rule instead of appearing random.

**Changes**
- UI: alternating surface assignment across all eleven sections of the page.
- UI: deck carousel demoted from a full indigo band to the base surface with
  indigo accent chrome.
- UI: `bg-muted` removed from section wrappers; card borders strengthened on
  white bands.

**Backend / schema changes** — None.

**Testing & verification** — Visual pass of the full page at desktop and mobile
widths; confirm no two adjacent bands share a surface; contrast checked on the
recoloured deck controls and the closing CTA buttons.

**Risks & rollback** — Low; presentation-only, revert by restoring the previous
class strings. The shared components are used only by this page.

**Follow-ups** — Apply the same surface rule to the other public landing pages so
the whole site reads consistently; not in this change.