## Audit: how roles work today (verified)

**Source of truth:** `public.user_roles` (`user_id`, `role app_role`), enum `admin | editor | contributor | user | member`. Nothing role-like sits on `profiles` or `members`, and roles are not in JWT claims. That foundation is correct.

**End-to-end flow**

```text
sign-in (Supabase)
   ├─ browser: fetchMyRoles() -> select role from user_roles where user_id = me
   │     ├─ _staff/route.tsx  beforeLoad -> isStaff gate
   │     ├─ _member/route.tsx beforeLoad -> isMember gate
   │     ├─ useMyRoles() in cms/Shell.tsx, articles.$id.tsx -> nav + buttons
   │     └─ landingPathForSession() -> /articles | /my-profile | /no-access
   ├─ server fns: requireSupabaseAuth -> assertStaff/assertEditor/assertAdmin (src/lib/authz.ts)
   ├─ MCP tools: OAuth bearer -> user-scoped client, no role checks (RLS only)
   └─ RLS: 24 policies inline `EXISTS (SELECT 1 FROM user_roles ...)`
           24 policies call `private.has_role / is_editor / is_staff`
```

**How roles change today:** `member` is granted/revoked in code via the admin client (`member-claim.server.ts` on claim, `member-admin.server.ts` on staff bind/unbind, `cutover.server.ts` on reset). `admin` and `editor` are only ever set by hand-written SQL — there is no UI and no server function.

**Findings**

1. **Duplicated vocabulary.** `AppRole` / `STAFF_ROLES` declared twice (`src/lib/roles.ts`, `src/lib/authz.ts`) plus a third time as string literals in SQL. Three edits per change.
2. **Two RLS dialects.** Half the policies inline a `user_roles` subquery hardcoding `IN ('admin','editor')`; half call `private.is_editor`. "Editor" can drift between them.
3. **Guard drift.** `articles.functions.ts` re-wraps `assertStaff`; every call site passes `context as never`, so the guard is never type-checked.
4. **No write policy on `user_roles`.** Only `users read own roles` (SELECT) exists — all writes are service-role, with no audit trail on grants.
5. **Refetch storm.** `fetchMyRoles` runs per route guard *and* per `useMyRoles` mount, with no cache and no `onAuthStateChange` invalidation, so a freshly granted `editor` doesn't appear until a hard reload.
6. **`contributor` and `user` are effectively dead** — `contributor` has RLS policies but no assignment path; `user` is never granted or checked.

## Recommendation, revised for the additive model

**Roles are additive grants, never a state machine.** A claimed member who is granted `editor` is a member *and* an editor: `members.auth_user_id` is untouched, the `member` row in `user_roles` stays, `/my-profile` and the member portal keep working exactly as before. `editor` only adds Insights CMS access. Revoking `editor` deletes one row and changes nothing about membership.

**Scope of the new Roles UI:** `editor` only, granted and revoked by an `admin`, and only on accounts that already hold `member` (i.e. a claimed member). `admin` stays out of the UI and keeps being provisioned by migration — self-service admin grants are how a single compromised admin session becomes permanent. `contributor` and `user` are not surfaced; their existing RLS policies stay in place, unused, and are documented as dormant rather than deleted.

**No changes at all to:** the claim flow, `member-claim.server.ts`, `/my-profile`, `_member/route.tsx`, or member sync. Members continue to arrive by API import and self-claim.

**Where roles live:** `user_roles` only. `members.auth_user_id` remains the identity link, never an authorization source. No custom JWT claims — this app revokes `member` at cutover/unbind, and a stale claim would be a live privilege leak.

**Loading and caching:** one `useMyRoles` backed by TanStack Query (`["my-roles", userId]`, ~5 min stale time), invalidated from the root `onAuthStateChange`. Route guards read the same cache via `ensureQueryData`, so navigation costs zero extra requests and a new `editor` grant appears on next sign-in or refetch.

**Centralized checks:** a single `src/lib/roles/model.ts` exporting `AppRole`, `STAFF_ROLES`, `toRoleSet` and the predicates. `roles.ts` and `authz.ts` both import it. `AuthedContext` gets a real type so the `as never` casts disappear.

**RLS vs app code:** RLS is the boundary, and only via `private.*` helpers after normalization. App-side guards (`assertEditor`, `beforeLoad`, nav filtering) are for early failure and UX, never the sole defence.

## Dual-access UX (the one real consequence)

An account holding both `member` and `editor` can reach two shells. Today `landingPathForSession` sends staff to `/articles` and the member shell is only reachable by typing the URL. With `editor` explicitly designed to sit on top of membership, that becomes the normal case:

- After sign-in, a member+editor lands on `/my-profile` (their primary identity) — the CMS is the added capability, not the default home.
- The member shell gains an "Insights CMS" link when `isEditor`; the CMS shell gains a "My profile" link when `isMember`. Both gates keep redirecting only when the required role is genuinely absent.

## Implementation steps

1. **Migration A — normalize RLS.** Rewrite the 24 inline `EXISTS (... user_roles ...)` policies to call `private.is_editor / is_staff / has_role`. Semantic no-op, verified by re-reading `pg_policies`.
2. **Migration B — govern `user_roles`.** Admin-only INSERT/DELETE policy via `private.has_role(auth.uid(),'admin')`, restricted so `admin` cannot be granted through the Data API (only `editor`), plus a `role_grants` audit table (`user_id`, `role`, `action`, `actor_user_id`, `created_at`) written by trigger.
3. **Shared model module.** Add `src/lib/roles/model.ts`; re-export from `roles.ts` and `authz.ts`; delete the duplicate constants and the local `assertStaff` in `articles.functions.ts`; type `AuthedContext` and drop the casts.
4. **Cached role loading.** `useMyRoles` on TanStack Query; `_staff/route.tsx` and `_member/route.tsx` `beforeLoad` use `ensureQueryData` on the same key; invalidate on `onAuthStateChange`.
5. **Editor administration.** `src/lib/roles.functions.ts` with `listClaimedMembersWithRoles`, `grantEditor`, `revokeEditor` — all behind `assertAdmin`, all refusing any role other than `editor`, all refusing accounts without an existing `member` grant. Admin-only `/roles` page in the staff shell listing claimed members with an editor toggle and the audit trail.
6. **Cross-shell links.** Update `landingPathForSession` to prefer `/my-profile` for member+editor, and add the reciprocal shell links described above.
7. **MCP.** Add a shared `requireMcpRole` helper for future non-public tools; document that today's four read-only tools are intentionally RLS-only.
8. **Docs.** Update `docs/auth-and-claim-flow.md` and `docs/architecture.md` with the additive-role rule, the "editor never touches membership" invariant, and the dormant status of `contributor`/`user`.

Steps 1–2 are database-only and reversible; step 3 is mechanical; 4–6 are behavioural. No existing grant, session, or member binding is invalidated at any point.
