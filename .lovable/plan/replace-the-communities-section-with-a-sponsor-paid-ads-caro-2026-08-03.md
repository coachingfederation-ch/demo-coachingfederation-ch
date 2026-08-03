# Replace the Communities section with a sponsor / paid ads carousel

The homepage section listing Zürich, Lausanne & Genève, Lugano and Online is replaced by a "Partners & sponsors" advertising band — the same idea as the looping ad carousel at the bottom of coachingfederation.ch, but built to our brand system instead of two banner images on repeat.

## What the user sees

- A calm section on the bone base surface with an eyebrow ("Advertisement"), a short heading, and one line explaining that partners support the chapter.
- A horizontally scrolling track of sponsor cards that loops seamlessly and pauses on hover or focus. Each card is an editorial tile: partner name, one-line claim, small category label, arrow CTA — not a stretched logo image.
- Six demo sponsors so the loop reads as variety rather than "two ads repeated". Cards use restrained ICF surfaces (white card, bone, one deep-blue tile) so the band has rhythm without competing with the rest of the page.
- Every card carries a small "Ad" tag, marking paid placement honestly.
- Reduced-motion users get a normal swipeable/scrollable row with no auto-animation; keyboard users can tab through each card.

## Content

Demo content is static and lives in the existing i18n files under a new `home.ads` key in EN/DE/FR/IT, replacing `home.communities`. Sponsor names are clearly fictional placeholders so nothing implies a real commercial relationship.

## Technical notes

- `src/pages/Home.tsx`: remove the `Communities` component and `COMMUNITY_LANGS`, add a `Sponsors` component in the same slot of the page order.
- New `src/components/home/SponsorMarquee.tsx`: CSS-only marquee (duplicated track, `translateX` keyframes, `animation-play-state: paused` on hover/focus-within, disabled under `prefers-reduced-motion` with an `overflow-x-auto` fallback). No new dependencies.
- Marquee keyframes added to `src/styles.css`; colours come from existing semantic tokens (`bg-card`, `bg-background`, `bg-hero`, `border-border`, `text-primary`) — no new hex values.
- i18n: add an `ads` block to `src/i18n/locales/{en,de,fr,it}/home.json` and remove the now-unused `communities` block there. Community content on other pages is untouched.
- Purely presentational: no database, no server functions, no route changes.

## PR note

**Summary** — Swaps the homepage local-communities grid for a static, brand-consistent sponsor/advertising carousel demo.

**Changes**

- UI: new `SponsorMarquee` component; `Home.tsx` section swap; marquee keyframes in `styles.css`.
- Content: `home.ads` added, `home.communities` removed, in four locales.

**Backend / schema** — None.

**Testing & verification** — Homepage in all four locales; desktop and mobile widths; hover/focus pause; reduced-motion fallback; keyboard tab order; contrast check on the deep-blue tile.

**Risks & rollback** — Low, presentational only. Revert the component and i18n edits to restore the communities grid. Local communities remain available at `/communities` and on the About page.

**Follow-ups** — CMS-managed sponsors (table, staff editor, image upload, active date ranges, click tracking) deliberately deferred; this phase is demo-static.

# Approval Note

Can you bring it below the "Upcoming Events" - meaning swaping place with Upcoming Events. 