## Goal

Rework the public coach profile (`/coach/$profileId`, and the localised `/$locale/coach/$profileId`) into the "ICF journey detail" direction: bolder use of the ICF palette to separate sections, a visual flow for "How I work", and Fees / Service areas / Links relocated to the right column.

Presentation-only. No schema, no server-function, no query changes — the same `PublicCoachProfile` data is used.

## Layout changes (`src/pages/CoachProfile.tsx`)

Left column (main), each block a rounded-2xl card on the lavender page background, with a numbered mono eyebrow (`01 / About`, `02 / How I work`, …) so sections read as distinct panels instead of hairline-separated text:

1. About
2. How I work — flow (below)
3. Specialisation + Who I work with, side by side on desktop, each with a coloured left border (teal / lavender) as the palette accent
4. Credentials & training
5. Testimonial (kept as a highlighted quote card, indigo-tinted)

Right column (sticky), stacked cards in this order:

1. "Working with {name}" facts card + Book / Message CTAs + response-time note (existing)
2. Fees — moved from left
3. Service areas — moved from left, region chips
4. Links — moved from left, arrow-affordance list
5. "Profiles sourced from ICF Global" note (existing)

Hero stays structurally as-is (indigo band, avatar, name, credential badge, tagline, meta, availability dot, CTAs) but gets a soft teal radial accent shape for boldness.

## "How I work" as a flow

Replace the current numbered grid with a waypoint flow:

- Desktop: horizontal row of step nodes (numbered circles, alternating indigo / teal / lavender fills) with a connecting gradient line running behind them; heading-less steps show the paragraph text under each node.
- Mobile / 5–6 steps: falls back to a vertical timeline with the connector on the left, so long text stays readable.
- Keeps the existing parsing rule: paragraphs split on blank lines, max 6; fewer than 2 paragraphs still renders as plain prose (no half-built flow).

## Graceful degradation

Every card is already conditional on its field being present. Rules kept:

- Empty Fees / Service areas / Links simply omit those sidebar cards.
- If the whole sidebar would be empty apart from the ICF note, the main column widens rather than leaving a gap.
- The 3rd row (Specialisation / Who I work with) collapses to a single full-width card when only one of the two has values.

## Tokens and styling

- No hardcoded hex. The prototype's indigo `#2E3192`, cyan `#00AEEF`, lavender `#E6E6FA` and cream map to the existing semantic tokens (`--hero`/`--primary`, `--accent`, `--secondary`/`--muted`, background). If the flow needs a distinct lavender step fill not covered today, one token is added in `src/styles.css` under the existing `@theme inline` block.
- Reuses `CARD_SHADOW`, `eyebrow`, `btn-mono` conventions from `src/components/site-chrome.tsx`.

## Copy / i18n

No new user-facing strings expected — section titles reuse existing `directory.detail.*` keys. If the numbered eyebrows need a separate label, they are composed from the existing titles rather than new keys, so DE/FR/IT stay in sync automatically.

## Verification

- Render the current live profile (Hartmuth Gieldanowski, 4 "How I work" paragraphs, no fees/links) at desktop and mobile widths and screenshot both.
- Render a sparse profile to confirm no empty cards or orphan headings.
- Contrast check on the teal-on-indigo and lavender-on-white step nodes.
- Typecheck.
