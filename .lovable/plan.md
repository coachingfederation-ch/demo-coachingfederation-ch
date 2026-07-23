## Goal
Create template landing pages for the five secondary nav destinations and wire the header nav to route to them. Each page reuses the existing hero header, footer, typography, mark palette, and card styling from the homepage so they feel like part of the same site — content is placeholder/template copy the user can refine later.

## New routes (file-based)
- `src/routes/for-organisations.tsx` → `/for-organisations`
- `src/routes/for-coaches.tsx` → `/for-coaches`
- `src/routes/insights.tsx` → `/insights` (Blog)
- `src/routes/events.tsx` → `/events`
- `src/routes/about.tsx` → `/about`

Each route defines its own `head()` with unique title, description, og:title, og:description (per project conventions). No `og:image` unless a hero image is wired.

## Shared chrome
Extract the current homepage `HeroHeader` + footer into `src/components/site-chrome.tsx` (exports `SiteHeader`, `SiteFooter`) so all six pages share them without duplication. The homepage keeps its existing large hero content; the new pages use a compact variant of `SiteHeader` (same indigo bar, logo, nav, lang switcher, Find a Coach CTA — no hero copy block).

Nav items become `{ label, to }` pairs and render as TanStack `<Link>` with `activeProps` for the active pill state. The "Home" pill is no longer hardcoded active.

## Page templates
Each new page follows this structure, styled with existing tokens (indigo/cream/blue/yellow marks, `CARD_SHADOW`, `eyebrow`, `section-label`, `btn-mono`):

1. **Compact indigo intro band** — eyebrow, H1, one-paragraph lede, primary CTA. Decorative `Mark` accent (cream on indigo).
2. **2–3 content sections** tailored to the page (see below), using the existing card/tile patterns and mark tiles.
3. **Closing CTA band** — same style as homepage "Join" section.

### For Organisations
- Intro: "Coaching for organisations that lead through change"
- Sections: Outcomes (3 stat/benefit cards), How we work (3-step process cards), Featured programmes (3 mark tiles). 
- CTA: "Talk to our organisations team".

### For Coaches
- Intro: "Grow your practice with ICF Switzerland"
- Sections: Membership benefits (4 cards), Credentialing pathway (ACC/PCC/MCC cards), Chapter communities (link over to About > Communities).
- CTA: "Become a member".

### Insights (Blog)
- Intro: "Insights from the Swiss coaching community"
- Sections: Featured article (large card, mark tile visual), Recent articles grid (6 placeholder posts with category chip, title, date, 2-line excerpt), Topics filter row (chips: Leadership, AI & Coaching, Diversity, Future of Work, Research).
- CTA: "Subscribe to the newsletter".

### Events
- Intro: "Upcoming events across Switzerland"
- Sections: Featured event (large mark tile + details), Upcoming list (reuses the 3-tile pattern already on the homepage, extended to 6 events with date, city, format chip), Past events (compact list).
- CTA: "Propose an event".

### About
- Intro: "About ICF Switzerland Charter Chapter"
- Sections in this order:
  1. **Why Coaching** (relocated here per request) — headline, 2-column explainer, 3 outcome cards.
  2. **Communities** — Zürich / Romandie / Ticino cards with lead names and meetup cadence.
  3. **Research & Partnerships** — partner logos placeholder row + 2 research highlight cards.
  4. Chapter board / mission short block.
- CTA: "Get involved".

## Homepage updates
- Swap inline header for `<SiteHeader variant="hero" />` (keeps the big hero copy).
- Remove the existing "Why Coaching" block from its current position above Events on the homepage (it now lives on About). Leave the rest of the homepage untouched.
- Update Events section link to point to `/events`; Communities/Coaches/Organisations mentions link to their pages.

## Files touched
- **New:** `src/components/site-chrome.tsx`, `src/routes/for-organisations.tsx`, `src/routes/for-coaches.tsx`, `src/routes/insights.tsx`, `src/routes/events.tsx`, `src/routes/about.tsx`
- **Modified:** `src/routes/index.tsx` (extract chrome, remove Why Coaching block, wire links)
- `src/routeTree.gen.ts` regenerates automatically.

## Out of scope
- No CMS, no real blog data — placeholder cards only.
- No auth, no forms wired to backend — CTAs are visual links.
- No new color tokens or font changes.
