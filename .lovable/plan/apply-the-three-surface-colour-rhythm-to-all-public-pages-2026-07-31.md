# Apply the three-surface colour rhythm to all public pages

The "For organisations" page now follows one rule. This applies the same rule everywhere else on the public site.

## The rule (unchanged)

- Base: soft lavender (`bg-background`) — default for content sections.
- Raised: white (`bg-card`) — only for bands that are made of cards, lists or forms.
- Anchor: indigo (`bg-hero`) — hero and closing CTA only, nothing else.
- Never `bg-muted`, `bg-white`, `bg-primary` or `bg-secondary` as a section background.
- Sections alternate base / raised; two identical surfaces never sit next to each other.

## Pages and what changes

**Home** — five off-rhythm bands: two `bg-muted` sections, one full `bg-primary` "organisations" band, and untinted sections that inherit whatever is behind them. Retag as base/raised alternating; the organisations band drops the indigo fill and keeps indigo accent chrome (eyebrow, headline accent, button), leaving indigo to the hero and the closing CTA.

**About** — "Our mission" is currently `bg-white`; it becomes the raised white surface properly tokenised, with the following sections alternating and the closing CTA staying indigo.

**For coaches** — two `bg-muted` bands become raised white (they are card grids); the interleaving sections become explicit base.

**Events** — list band becomes raised white, surrounding sections explicit base, closing CTA stays indigo.

**Event detail, Insights, Insight detail, Find a coach, Communities, Community detail, Team, Europe pulse, Coach profile** — currently mostly untagged sections that inherit the page background. Each gets an explicit base or raised tag so the alternation reads deliberately: card/list/filter/form bands go raised white, prose and intro bands stay base.

**Shared components** — sections rendered from `src/components/` for these pages (coaches sections, event and insight cards, community and team grids) get the same treatment, including the stronger card border used on white bands.

## Consistency details

- Cards on a white band get the stronger `border-border` treatment; cards on lavender keep the softer border.
- Section vertical rhythm and spacing are untouched — this is a surface-colour pass only.
- No content, copy, layout or data changes.

## PR note

**Summary** — Extends the three-surface background rhythm (lavender base / white raised / indigo anchor) already adopted on "For organisations" to every public page, removing ad-hoc `bg-muted`, `bg-white`, `bg-primary` and `bg-secondary` section fills.

**Changes** — UI only: section wrapper classes across `src/pages/*` public pages and the shared section components they render; card border strength adjusted per surface.

**Backend / schema changes** — None.

**Testing & verification** — Visual pass over each public route in DE/FR/IT/EN at desktop and mobile widths; check no two adjacent sections share a surface and that indigo appears only in hero and closing CTA.

**Risks & rollback** — Presentation only; revert is a straight revert of the class changes.

**Follow-ups** — Authenticated staff/member areas keep their own surface conventions and are out of scope.
