# Fix the language notice: broken link after login, and show it only once

## What's wrong today

`src/components/language-notice.tsx` is rendered from the root route, so it appears on **every** page — including account pages like `/my-profile`, `/auth` and the staff CMS. Those pages exist only in English; there is no `/de/my-profile` route. The notice builds its link as `/{locale}{current path}`, so clicking it on the member area lands on the router's "Not Found" screen (exactly the state currently visible at `/de/my-profile`).

Second problem: dismissal is component state only. The notice reads the stored language preference (`icf-locale`, written by the header language switcher) and re-appears on the next page load or navigation, forever.

## The fix

1. **Only offer a language that actually leads somewhere.** Before rendering, ask the router whether the localized target path resolves to a real route. If it does not (account pages, CMS, claim/auth screens), the notice does not render at all. This is durable: no hand-maintained list of "public pages" to keep in sync — new localized pages are covered automatically, and non-localized ones are excluded automatically.
2. **Show it at most once per browser.** Introduce a dedicated key, separate from the language-switcher preference. Once the visitor either follows the suggestion or dismisses it, that key is written and the notice never renders again. Dismissal survives reloads and logins.

## Technical notes

- `src/components/language-notice.tsx`:
  - Use `useRouter()` and `router.matchRoutes(localizePath(path, preferred))` to verify the localized path matches a concrete route (no not-found match) before showing the banner; skip rendering otherwise.
  - Add `const DISMISS_KEY = "icf-locale-notice-seen"`; read it in the same `useEffect` that reads `icf-locale` and bail out when present.
  - Write `DISMISS_KEY` both in the dismiss handler and in the accept handler (on click, before navigation), wrapped in try/catch like the existing storage read.
  - Keep reading `icf-locale` as the source of the preferred language; no change to `src/components/site-chrome.tsx`.
- No backend, schema or routing changes.

## PR note

**Summary** — The post-login language notice linked to non-existent localized account routes (`/de/my-profile`), producing a "Not Found" page, and reappeared on every navigation. It now renders only where the localized route exists and is shown at most once per browser.

**Changes**
- UI: `src/components/language-notice.tsx` — router-verified target path; persisted one-time dismissal.

**Backend / Schema Changes** — None.

**Testing & Verification**
- Signed-in member on `/my-profile` with a stored `de` preference: notice does not render.
- Public page (e.g. `/about`) with a stored `de` preference: notice renders, CTA navigates to `/de/about`.
- Dismiss, then reload and navigate: notice does not return.
- Accept, then navigate back: notice does not return.

**Risks & Rollback** — Isolated to one component; revert the single file to restore previous behaviour. Visitors who already saw the notice will simply not see it again.

**Follow-ups / Known Debt** — Localized account/member routes are out of scope; if they are ever added, the notice picks them up automatically via the router check.
