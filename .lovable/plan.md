## Verified current state

- `psql`: `public.user_roles` holds **0** rows with `role = 'contributor'` — removing it strands no account.
- `pg_policies`: `public.articles` has exactly the four contributor policies named in the request, plus `editors manage all articles` (ALL) and `public read published articles` (SELECT). Dropping the four leaves editors/admins and public reads intact.
- `private.is_staff` today reads `has_role(admin) or has_role(editor) or has_role(contributor)` — it does **not** include `organizer`.
- No RLS policy anywhere currently references `private.is_staff` (it is defined but unused by policies; app code gates through `src/lib/authz.ts`). So recreating it is a safe, no-behaviour-change edit at the database level — but it does align the SQL helper with `STAFF_ROLES`, which is the point.
- `rg` found contributor references in: `role-model.ts`, `authz.ts`, `roles-admin.server.ts`, `articles.server.ts`, `articles.functions.ts`, `coach-finder-config.functions.ts`, `_staff/route.tsx`, `_staff/roles.tsx`, `_staff/articles.$id.tsx`, the four `cms.json` files, and generated `types.ts`.

## Code changes

1. **`src/lib/role-model.ts`** — drop `"contributor"` from `AppRole` and `STAFF_ROLES`; drop `isContributor` from `RoleSet`, `EMPTY_ROLES` and `toRoleSet`; rewrite the dormancy docstring so it mentions only `user`.
2. **`src/lib/authz.ts`** — `assertStaff` JSDoc: "admin, editor or organizer".
3. **`src/lib/roles-admin.server.ts`** — `listInternalStaffAccounts` filter becomes `["admin", "editor", "organizer"]`.
4. **`src/components/cms/Shell.tsx`** — nav-array comment loses the contributor reference.
5. **`src/lib/articles.functions.ts`**, **`src/lib/articles.server.ts`**, **`src/lib/coach-finder-config.functions.ts`** — comments updated to describe the editor/admin boundary without contributor.
6. **`src/routes/_staff/articles.$id.tsx`** — remove the `{t("editor.contributorNote")}` span.
7. **`src/i18n/locales/{en,de,fr,it}/cms.json`** — remove `editor.contributorNote`.
8. Two comment-only references not in the task list but required for `grep -ri contributor src/` to come back clean: **`src/routes/_staff/route.tsx`** (line 4) and **`src/routes/_staff/roles.tsx`** (line 7). Comment text only, no logic.

Not touched: `src/integrations/supabase/types.ts` (generated), and no gate/guard logic changes beyond the `STAFF_ROLES` membership itself.

## Migration

One migration:

- `DROP POLICY IF EXISTS` for the four contributor policies on `public.articles`.
- `CREATE OR REPLACE FUNCTION private.is_staff(uuid)` as admin / editor / organizer (`sql`, `stable`, `security definer`, `set search_path = public`) — matching the new `STAFF_ROLES`.
- The `app_role` enum keeps its `'contributor'` value; dropping an enum value requires recreating the type and every dependent column, which is risky and buys nothing.

## Verification

- `tsgo --noEmit` clean, prettier applied.
- `rg -i contributor src/` returns only `src/integrations/supabase/types.ts`.
- Re-query `pg_policies` for `articles` to confirm only `editors manage all articles` and `public read published articles` remain, and re-read `private.is_staff`'s body.
- Playwright with the signed-in QA account (editor + organizer): `/articles` list and an article edit page load, sidebar unchanged, no console errors.
