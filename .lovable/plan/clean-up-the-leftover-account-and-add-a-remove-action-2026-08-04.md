# Clean up the leftover account and add a "Remove" action

## What's actually wrong

The row `39282f38-…` under **Internal accounts** is not an account at all. Its sign-in account was deleted on 4 Aug, but the `editor` grant it held was left behind: `user_roles` has no link to the accounts table, so deleting an account does not clean up its role rows. The Roles screen lists every privileged role row, so the ghost grant keeps showing up — and there is no button to clear it, because the internal table is read-only by design.

Confirmed by reading the data: `user_roles` holds `39282f38-… / editor`, and no sign-in account with that id exists.

## The fix

1. **Delete the leftover grant** — one data change removing the orphaned `editor` row for `39282f38-…`. The row disappears from Internal accounts immediately.
2. **Sweep any other orphans** in the same step (currently none besides this one).
3. **Prevent it happening again** — link role rows to the accounts table so that deleting an account removes its role rows automatically.

## New "Remove" action

Per your answer, removing means *taking away the staff grants*, not deleting anyone's account or membership.

**Member table** (claimed members): a "Remove access" button appears only on rows that currently hold editor and/or organizer. It asks for confirmation ("Remove editor and organizer access for <name>? They keep their membership and Member Area access."), then revokes both grants in one go. Rows with no staff grant, and admin rows, show nothing — admin stays provisioned outside the app.

**Internal accounts table**: same button, revoking editor/organizer for that account. Once the last of those grants is gone the row leaves the table, which is exactly the "stop filling up the table" behaviour you asked for. Admin-only rows stay read-only.

Every removal is written to the existing grant history, so "editor revoked (by …)" still shows in Recent changes.

## Technical notes

- Cleanup: one data change deleting orphaned `user_roles` rows, plus a migration adding a cascading link from `user_roles.user_id` to the accounts table.
- New server function `revokeAccountRoles` in `src/lib/roles.functions.ts`, admin-guarded, taking an auth user id and revoking `editor` + `organizer` through the caller's own RLS-scoped client. Existing "admins revoke managed roles" policy already permits exactly this, so no policy change is needed.
- `src/lib/roles-admin.server.ts` gains nothing new; the read model already returns `isEditor` / `isOrganizer` and internal `roles`.
- `src/routes/_staff/roles.tsx` gets the button plus a confirm dialog; new i18n keys in all four `cms.json` files.
- Existing per-role Grant/Revoke buttons stay as they are.

## PR note

**Summary** — Removes a leftover editor grant belonging to a deleted account, stops such orphans recurring, and gives admins a single "Remove access" action on both role tables.

**Changes** — UI: remove-access button + confirmation on the member and internal tables in Roles; i18n keys in EN/DE/FR/IT. Backend: `revokeAccountRoles` server function.

**Backend / schema** — Data change deleting orphaned `user_roles` rows; migration adding a cascading account link on `user_roles.user_id`. No RLS change.

**Testing** — Verify the ghost row is gone from Internal accounts; grant editor to a claimed member, use Remove access, confirm both grants clear, the member keeps Member Area access, and the revoke appears in Recent changes; confirm admin rows offer no Remove.

**Risks & rollback** — Low. The cascading link only affects rows whose account no longer exists. Reverting the UI is safe; the deleted ghost grant would need re-granting only if it was ever wanted, which it isn't.

**Follow-ups** — Fully deleting a QA sign-in account from the UI is still out of scope; that stays a manual operation.
