# Plausible Analytics across the whole site

Add privacy-friendly Plausible Cloud tracking for `new.coachingfederation.ch`, covering every page plus the key conversion goals.

## What you get

- A page view recorded on every route change, including language-prefixed routes (`/de/...`, `/fr/...`, `/it/...`), the member area and the staff CMS.
- Custom goal events for the moments that matter:
  - Coach funnel: coach search performed, coach profile viewed, coach contact clicked
  - Events: event viewed, event registration submitted
  - Membership & organisations: slide deck downloaded, organisation survey completed
  - Content: insight article viewed, article shared (LinkedIn, X, email, copy link), Europe Pulse viewed
- No cookies, no personal data, no consent banner needed — consistent with the Swiss data-protection posture of the site (fonts already self-hosted, no cookie tracking).

## How it works

The Plausible script is loaded once in the app shell with the site domain set to `new.coachingfederation.ch`. Because the site is a single-page app, automatic page views are handled through the manual pageview API on each router navigation, so language switches and in-app navigation are counted correctly.

Goal events reuse the same call sites that were previously instrumented, so the coverage is already mapped out.

## Technical detail

- `src/lib/plausible.ts` (new): loads `https://plausible.io/js/script.manual.outbound-links.js` once in the browser with `data-domain="new.coachingfederation.ch"`, exposes `initPlausible()`, `trackPageView(path)`, `trackGoal(name, props?)`, and a `useTrackView(name, key, props?)` hook for detail pages. All functions no-op during SSR.
- `src/components/plausible-analytics.tsx` (new): mounts the script once and reports a page view on `useRouterState` location changes.
- `src/routes/__root.tsx`: render the new component inside `RootComponent`.
- Domain is read from `VITE_PLAUSIBLE_DOMAIN` with `new.coachingfederation.ch` as the default, so preview and production can diverge later without a code change. The script URL is likewise overridable via `VITE_PLAUSIBLE_SRC`.
- Goal call sites (event name in quotes):
  - `src/components/coaches/directory/useCoachDirectoryFilters.ts` — "Coach Search" on settled filter/query changes (debounced via the existing filter signature).
  - `src/pages/CoachProfile.tsx` — "Coach Profile View"; `CoachProfileHero.tsx` / `CoachProfileSidebar.tsx` — "Coach Contact".
  - `src/pages/EventDetail.tsx` — "Event View" and "Event Registration".
  - `src/components/organisations/DeckDownload.tsx` — "Deck Download"; `CultureSurvey.tsx` — "Organisation Survey".
  - `src/pages/InsightDetail.tsx` — "Insight View"; `src/components/share-buttons.tsx` — "Article Share" with a `channel` property; `src/pages/EuropePulse.tsx` — "Europe Pulse View".
- Custom properties are limited to non-identifying values (channel, slug, category) — never emails, member IDs or free-text search queries.
- Privacy pages: add a short Plausible entry to the third-party/analytics sections of `src/pages/privacy/ThirdParties.tsx` and `src/pages/privacy/Cookies.tsx`, stating cookieless, EU-hosted, no personal data.

## PR note

**Summary** — Adds cookieless Plausible Cloud analytics site-wide (SPA page views) plus custom goal events for the coach, events, organisations and content funnels.

**Changes**
- Frontend: new `src/lib/plausible.ts` and `src/components/plausible-analytics.tsx`; mounted in `__root.tsx`; goal calls added at the nine call sites listed above.
- Content: privacy policy analytics/cookie sections mention Plausible.

**Backend / schema changes** — None.

**Testing & verification** — Load the preview and confirm the script request to plausible.io fires once and a pageview is sent per route change; navigate between locales and to a coach profile, event and article to confirm goals fire; confirm no console errors and no requests during SSR.

**Risks & rollback** — Very low blast radius; analytics is additive and fails silently. Rollback is removing the two new files, the root mount and the goal calls.

**Follow-ups / known debt** — Goals must be created in the Plausible dashboard to appear as conversions. If the site later moves to the apex domain, update `VITE_PLAUSIBLE_DOMAIN`. A cloud proxy to reduce ad-blocker loss can be added later.
