## Goal

Each CMS role only sees, and can only reach, the functions it should. Admin keeps everything; editor gets Articles only; organizer gets Events only. UI/routing layer only — no RLS or server authz changes.

## Access matrix (exact roles, admin bypass)

| Function | Non-admin roles allowed |
| --- | --- |
| Articles, New Article, Article detail | editor |
| Events (list + detail) | organizer |
| Categories, Vocabularies, Coach Finder, Members, Integration, Roles | (none — admin only) |

Contributor is not part of this matrix.

## Changes

**1. `src/lib/role-model.ts`** — add an exact-role helper:

```ts
export function hasExactRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}
```

The inherited `isEditor` / `isOrganizer` helpers stay untouched (other code depends on them) but are not used for nav or the new guards.

**2. `src/components/cms/Shell.tsx`** — replace `editorOnly` / `adminOnly` with an `allowedRoles` array holding non-admin roles only, and one filter mechanism with an admin bypass:

```ts
roles.isAdmin || item.allowedRoles.some((r) => roles.roles.includes(r))
```

Nav entries: Articles `["editor"]`, New Article `["editor"]`, Events `["organizer"]`, everything else `[]` (admin only).

**3. Route guards** — shared client-side helper (`src/lib/staff-guard.ts`) mirroring the `_staff/route.tsx` pattern: read the session user, `ensureQueryData(myRolesQueryOptions(userId))`, allow if admin or if the role set contains the required exact role, otherwise redirect.

Redirect priority for a denied route, evaluated in this order:

1. admin — never denied (bypass, no redirect path needed)
2. exact `editor` → `/articles`
3. exact `organizer` → `/manage/events`
4. `member` → `/my-profile`
5. otherwise → `/no-access`

An account holding both `editor` and `organizer` deterministically lands on `/articles` (editor precedes organizer in the order); this is documented in the helper's comment. Because a guard never redirects to a route the user is denied on, there is no redirect loop.

Applied via `beforeLoad` to:

- `articles.tsx`, `articles.index.tsx`, `articles.new.tsx`, `articles.$id.tsx` → admin or editor
- `articles.categories.tsx` → admin
- `manage.events.index.tsx`, `manage.events.$id.tsx` → admin or organizer
- `vocabularies.tsx`, `coach-finder.tsx`, `members.index.tsx`, `members.$id.tsx`, `integration.tsx`, `roles.tsx` → admin

`src/routes/_staff/articles.tsx` was verified to be a parent layout returning `<Outlet />`, so guarding it covers the whole `/articles/*` subtree in addition to the per-child guards. `roles.tsx` keeps its existing component-level admin check as defence in depth.

**4. Contributor behaviour (explicit).** `_staff/route.tsx` is unchanged and still admits `contributor` as staff, but contributor is in no route's allowed list, so a contributor passes the shell gate and is then redirected by the first child guard to `/my-profile` (if also a member) or `/no-access`. The nav would render empty for them. Nothing currently grants `contributor`, so this is dormant behaviour; changing the staff gate is out of scope for this task.

**5. Untouched:** `_staff/route.tsx`, `authz.ts`, all RLS policies and server functions.

## Verification

- Typecheck clean.
- Playwright against the running preview with editor, organizer and admin sessions: nav item lists, plus direct URL hits on `/manage/events` as editor and `/articles` as organizer redirect to the expected fallbacks.
- Admin sees the full nav; a member holding an extra staff grant still sees the Member Area link.

## Risk note

Guards are client-side (`_staff` is `ssr: false`), so they are navigation hygiene, not a security boundary — the database policies remain the real enforcement and are unchanged.
