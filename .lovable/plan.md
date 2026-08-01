# Swap yellow for chapter light blue on deep blue surfaces

Yellow (#EFCB30) is the global ICF accent. On our deep blue surfaces it currently carries the
headline highlight words, the eyebrow labels and the primary CTA buttons. Those move to the
national chapter Light Blue (#5778FA), in three accessible steps so nothing drops below WCAG AA.

## The three blues

Light Blue at its exact hex reaches 3.9:1 on Deep Blue — fine for large display type and
decoration, not for 11px labels or button text. So we use one exact value plus two derived ones:

- Headline accent words (large display type): exact #5778FA
- Eyebrows and small uppercase labels on deep blue: #6886FA (4.5:1 on Deep Blue)
- Filled CTA buttons on deep blue: #4F6CE2 fill with white label (4.6:1)

All three read as the same chapter blue; only the small-text and button variants are nudged.

## What changes

1. New semantic tokens in `src/styles.css` (OKLCH, alongside the existing palette):
   - `--hero-accent` = oklch(0.6540 0.1751 270.08) — small labels on deep blue
   - `--cta` = oklch(0.5733 0.1819 269.48) with `--cta-foreground` = white — filled CTAs
   - the exact light blue already exists as `--highlight` / `--mark-blue`; reuse it
   Register each in the `@theme inline` block so `text-hero-accent`, `bg-cta` and
   `text-cta-foreground` become available.

2. Deep blue heroes and closing CTA bands:
   - `text-accent` on headline accent spans becomes `text-highlight`
     (Home, About, Team, Insights, Events, Communities, Europe Pulse, Find a Coach, For Coaches,
     For Organisations, plus the shared `PageHero` in `src/components/site-chrome.tsx`)
   - `eyebrow !text-accent` becomes `eyebrow !text-hero-accent` (same files plus the Insights
     newsletter band, the Home join band and the Events/Coaches/Organisations CTA bands)
   - `bg-accent text-accent-foreground` buttons become `bg-cta text-cta-foreground`
     (shared header "Find a coach" CTA desktop and mobile, `PageHero` CTA, Home hero CTA,
     CoachProfile hero and sidebar CTAs)
   - the header active-nav underline `after:bg-accent` becomes `after:bg-highlight`
   - the coach "accepting clients" status dot on the deep blue hero becomes `bg-highlight`

3. Decorative marks sitting on deep blue (`text-mark-yellow` on indigo tiles in Home and Events,
   the Home hero star) switch to `text-mark-blue`.

## What stays yellow

Yellow keeps its global-ICF role where it is not on a deep blue surface: the markdown
`highlight` callout shade, the yellow mark tiles on light backgrounds, and the soft
`bg-accent/15` icon chips on bone and white sections. No i18n, route or data changes.

## PR note

**Summary** — Replace the global-ICF yellow accent on deep blue surfaces with the chapter
Light Blue, using AA-safe variants for small text and filled buttons.

**Changes**
- Styling: three light-blue tokens added to `src/styles.css`; yellow accent classes swapped on
  deep blue heroes, CTA bands and the site header.
- Backend / schema: None.

**Testing & Verification** — Visual pass over every public route at mobile and desktop widths;
contrast re-checked for headline accents, eyebrows, button labels and focus rings on deep blue;
hover and focus states confirmed on the header CTA and hero buttons.

**Risks & Rollback** — Presentation only, no logic touched; revert is a straight revert of the
token block and the class swaps.

**Follow-ups** — The `accent` token still means yellow globally; a later pass could rename it so
its reserved global-ICF role is obvious in code.