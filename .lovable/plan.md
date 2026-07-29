## What I verified first

I checked the live database before planning, and the diagnosis in the report is only partly right.

- **Layer 1 (code) — confirmed.** `revokeMemberRole` treats "no error" as success, so a 0-row delete reports success.
- **Layer 2 (private schema USAGE) — disproved.** The `private` schema indeed has no `USAGE` for `authenticated`, but that is *not* what breaks the delete. Both the grant and the revoke policies call `private.has_role(auth.uid(),'admin')`, and the audit table shows two grants today (editor at 10:31, organizer at 11:09) recorded with the acting admin's id. If that function call failed, grants would fail too. Postgres resolves function names when the policy is created and only re-checks `EXECUTE` at runtime, which `authenticated` has. So re-granting schema USAGE would not fix anything, and I don't want to loosen a deliberate lockdown for no reason.

## The actual root cause

`public.user_roles` has exactly one SELECT policy: `users read own roles` (`auth.uid() = user_id`). Postgres applies SELECT policies to the `WHERE` clause of `UPDATE`/`DELETE`. So when an admin deletes another member's role row, the row is invisible to them, the delete matches 0 rows, no error is raised — exactly the reported symptom. `INSERT` needs no SELECT visibility, which is why granting works and only revoking silently fails.

This also means the suggested `.select("id")` on the delete would *not* work on its own — `RETURNING` needs the same missing SELECT visibility.

## Plan

**1. Migration: admin read policy on `user_roles`**

Add a SELECT policy allowing admins to read all role rows:

```sql
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
```

Nothing else changes: existing grant/revoke policies, the audit trigger, table grants and the `private` schema lockdown all stay exactly as they are. No `GRANT USAGE ON SCHEMA private`.

Optionally the same for `public.role_grants` only if the audit read path turns out to need it — the Roles screen currently reads audit through a server-side admin path, so I'll leave it untouched unless the check shows otherwise.

**2. Code: make silent no-ops loud (`src/lib/roles.functions.ts`)**

- `revokeMemberRole`: add `.select("id")` and throw when zero rows come back, so a blocked delete can never again be reported as success.
- `grantMemberRole`: add `.select("id")`, keep ignoring the `23505` unique violation (already granted is a no-op, not a failure).
- Keep using `context.supabase` (the caller's RLS client) for both — the audit trigger must keep recording `auth.uid()`. No `supabaseAdmin`.

**3. Verification**

With the currently signed-in QA admin, in the preview: grant + revoke `editor`, grant + revoke `organizer`, confirming the badge disappears immediately, and then query `role_grants` to confirm `revoked` rows appear with the acting admin's `actor_user_id`.

## Note

The unused `GRANT USAGE ON SCHEMA private` step from the report is deliberately dropped. If you'd rather I add it anyway (it is harmless in isolation — USAGE without EXECUTE grants nothing), say so and I'll include it, but it is not needed for this bug.
