## Goal

Turn `/auth` into a member-facing sign-in screen (email/password + "Claim your account"), and move Google sign-in to a separate, low-emphasis internal route. No changes outside the auth screens.

## Changes

### 1. `/auth` — member access (edit `src/routes/auth.tsx`)

- Title becomes "Member access"; helper text: "Members are imported into the system. First-time users need to claim their account before signing in."
- Remove the signup mode entirely: no "Create account", no "New here?" toggle, no `supabase.auth.signUp` branch. The form is sign-in only.
- Remove the "Continue with Google" button and the "or" divider from this route.
- Keep: email + password fields, primary "Sign in", locale chips, role-based redirect after sign-in (`landingPathForSession`), `next` preservation, back link to icf.ch.
- Secondary action: "Claim your account" linking to `/claim`. Currently that link only renders when `getMemberClaimStatus().enabled` is true. Proposal: always show it — `/claim` already renders its own "Member access isn't open yet" explanation while claiming is closed, so first-time members get a real answer instead of a dead end. (Say the word if you'd rather keep it hidden pre-cutover.)
- Tertiary, visually quiet link at the bottom: "Internal admin sign-in" → `/auth/staff`.
- Page title/meta updated to reflect member access; keep `noindex`.

### 2. New route `src/routes/auth/staff.tsx` (`/auth/staff`)

- Same card styling and locale chips as `/auth`.
- Contains the Google button (the existing `lovable.auth.signInWithOAuth("google", …)` call, unchanged, with the same `/auth/callback?next=` redirect) plus the same email/password form for staff who don't use Google.
- `noindex`, and a link back to member sign-in.
- The `_staff` gate keeps redirecting to `/auth` as today; an admin lands there and takes the "Internal admin sign-in" link. Nothing about role checks, redirects or the callback changes, so current admin access is preserved.

### 3. Translation keys

- Add member-access strings (`auth.memberTitle`, `auth.memberHelp`, `auth.claimAccount`, `auth.internalSignIn`, `auth.staffTitle`, `auth.backToMemberSignIn`) to `cms.json` for EN/DE/FR/IT, following the existing CMS dictionary pattern.
- Remove now-unused `auth.signUpSub`, `auth.newHere`, `auth.haveAccount`, `auth.createAccount` if nothing else references them.

## Technical note on "restrict Google to the internal path"

Google is a project-wide auth provider; it cannot be technically limited to one route — any provider that is enabled can in principle be invoked. What the app controls is where the flow is offered and where a user ends up: after Google sign-in, `auth/callback` routes strictly by roles, so a Google account with no roles lands on `/no-access` and gains nothing. So the enforcement is unchanged and already correct (roles, not provider); this change removes Google from the member flow's UI surface and confines the entry point to the internal route. Fully disabling Google for non-staff would require dropping the provider, which would break admin access.

## Accessibility

Labels/`aria-label` on inputs preserved, single H1 per screen, focus-visible rings kept, link hierarchy expressed with text and weight rather than colour alone.
