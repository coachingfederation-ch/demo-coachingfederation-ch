## Decision

"Internal accounts" stays strictly non-member: it is the list of privileged accounts that have **no** imported ICF member record. Your hybrid account correctly belongs only in the main table. The fix is to make that main row show its full role picture instead of a faint "Administrator" note.

## What changes

Only the admin Roles screen (`/roles`) — presentation and one localisation key. No schema, RLS, or grant-logic changes.

**Main member table, "Access" column** — render one badge per held capability, in a fixed order:
- `Member` (always, these rows are claim-linked members)
- `Editor` — shown when the editor grant exists (unchanged)
- `Administrator` — new badge, shown when the account also holds `admin`, styled like the editor badge but distinct (shield icon, stronger emphasis) so a hybrid row reads "Member · Editor · Administrator" at a glance

**Right-hand action column** — drop the duplicated plain-text "Administrator" label. For admin rows, keep the grant/revoke control disabled with a short explanatory note ("Provisioned separately"), so the reason an admin row has no toggle is still visible without pretending to be a role badge.

**Intro copy** — one added sentence stating that an account can be both a member and an administrator, and that such accounts appear in the table above, not under "Internal accounts". This is the actual answer to the confusion.

**"Internal accounts" intro** — tighten to say explicitly "accounts with no imported member record; accounts that are both a member and an administrator are listed above."

## Technical details

- `src/routes/_staff/roles.tsx`: use the existing `m.isAdmin` field already returned by `listClaimedMemberRoles` — no server or data-model change needed. Add the admin badge inside the Access cell, replace the `m.isAdmin ? <span>…` branch in the action cell with a disabled button plus caption.
- `src/i18n/locales/{de,fr,it,en}/cms.json`: add `roles.adminBadge` and `roles.adminNote`; revise `roles.intro` and `roles.internalIntro`. All four locales updated in the same pass, sentence case per project copy rules.
- No migration, no change to `roles-admin.server.ts`, `roles.functions.ts`, or `role-model.ts`.
