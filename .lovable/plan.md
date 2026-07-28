## Scope

Only `src/components/site-chrome.tsx` (the shared public header used by every public page, including event detail) plus the four `common.json` locale files. No route, auth, or data-model changes.

## Change 1 — Single compact language control

The header today renders two language UIs: a four-link inline row shown from `lg` up, and an already-built `CompactLanguageSwitcher` dropdown shown only below `lg`.

- Delete the inline `DE / FR / IT / EN` row.
- Promote `CompactLanguageSwitcher` to all breakpoints (drop its `lg:hidden`), keeping its existing behaviour: trigger shows the current code with a globe icon (add a chevron so it reads `EN ▾`), opens a menu listing DE · FR · IT · EN in the required order, current language marked and still selectable in the list rather than filtered out.
- Language links keep using `localizePath(useCanonicalPath(), locale)` — so the current page is preserved and switching works identically from the homepage and event detail pages. No localization logic changes.
- Accessibility stays as built: `aria-haspopup`/`aria-expanded`, Escape to close, outside-click close, ≥44px touch targets; add arrow-key/`aria-current` handling on the menu items.

## Change 2 — Member Login / account control

Add an `AccountControl` component in the same file, rendered next to the language control (desktop) and inside the mobile menu.

- Session state: a small `useQuery(["auth-user-id"])`-style read of `supabase.auth.getUser()` plus the existing `supabase.auth.onAuthStateChange` invalidation that `useMyRoles()` already owns — reuse `useMyRoles()` for both session presence and role flags so sign-in/sign-out update the header without a refresh.
- Because the header renders during SSR, the control renders the logged-out state until the client session resolves (no hydration mismatch, no layout jump).
- **Logged out:** pill button `Member login` → `LocaleLink`/link to the existing `/auth` route. No new auth surface.
- **Logged in:** same pill becomes an account menu (same dropdown pattern as the language control) labelled `My account`, containing:
  - `My profile` → `/my-profile`
  - `Insights CMS` → `/articles`, only when `roles.isEditor` (mirrors `MemberShell`)
  - `Sign out` → `supabase.auth.signOut()` then return to the current page.
- Guests are never redirected; the guest RSVP path, claim rules, and nav items are untouched.

## Layout

Desktop: `[nav pills] [language ▾] [account] [Find a coach]`. To avoid crowding, `Find a coach` keeps its accent styling and the account control uses the same subtle `bg-white/10` pill as the language trigger.

Mobile: hamburger menu gains a divider plus the account entry (login link, or profile/CMS/sign-out rows); the language control stays in the top bar where it already is.

## Copy

New `common.nav` keys — `memberLogin`, `myAccount`, `myProfile`, `signOut`, `accountMenu` (aria) — added to `en/de/fr/it common.json` in existing sentence case.

## Verification

Playwright: homepage + an event detail page, logged out (Member login visible, four inline links gone) and signed in as the QA member (`qa.member@icfswitzerland-test.ch`) — account menu shows My profile/Sign out, sign-out flips the header back without reload; language switch from `/events/<slug>` lands on `/de/events/<slug>`; mobile viewport check.
