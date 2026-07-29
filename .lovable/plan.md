## Goal

An account that holds `member` + `organizer` must see a working link into the staff CMS from the Member Area, and a non-member organizer must land on the Events screen after sign-in.

## Changes

### 1. `src/components/member/MemberShell.tsx`

- Gate the CMS link on `roles.isStaff` instead of `roles.isEditor`, so admin, editor, contributor and organizer all see it.
- Compute the target with exact grant checks (no inheritance): if the account holds `organizer` and holds neither `editor` nor `admin`, link to `/manage/events`; otherwise `/articles`. Use the existing `hasExactRole` helper from `role-model.ts` for consistency with the CMS nav filtering.
- Label the link accordingly: keep `nav.insightsCms` for the articles target, and use the existing Events nav label for the events target (falling back to an added `cms.json` key per locale if none exists). Icon switches to a calendar for the events case.
- Comment updated to explain that the link follows the account's actual staff capability, not just the editor grant.

### 2. `src/lib/role-model.ts`

- Widen `landingPath`'s return type to include `/manage/events`.
- Order: members still go to `/my-profile` first (the CMS link lives there); then a non-member staff account that holds `organizer` but not `editor`/`admin` goes to `/manage/events`; other staff go to `/articles`; otherwise `/no-access`.

### 3. `src/lib/roles.ts`

- `landingPathForSession`'s declared return type must be widened to match (it currently hard-codes the three old paths), otherwise the new value fails typecheck at `auth.callback.tsx` and `auth-screen.tsx`, which both feed the value straight into `navigate({ to })`.

## Not touched

`src/routes/_member/route.tsx` and `src/routes/_staff/route.tsx` gates stay exactly as they are, as do the per-route `beforeLoad` guards.

## Verification

- `tsgo` typecheck for the widened return types.
- Playwright with the signed-in QA account (member + organizer per the current session): open `/my-profile`, confirm the CMS link renders and points at `/manage/events`, follow it and confirm no guard redirect bounces back.
