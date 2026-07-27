## Goal

Two valid ways to be signed in:

1. **Internal admin** — a plain account with the `admin` role and **no** imported member record.
2. **Claimed member** — an account bound to an imported ICF member record via `members.auth_user_id`, optionally with the additive `editor` grant.

Everything else stays as-is: `editor` remains member-only, `admin` stays a provisioning step done by migration, and the claim flow, `/my-profile` and Member Area access are untouched.

## What is already true (verified)

- `landingPath()` already sends an admin with no member record to `/articles`, and the `_staff` gate only checks staff roles — so **sign-in and CMS access already work** for an internal admin.
- The database rule for granting `editor` (`admins grant editor`) already requires the target to hold `member`, matching the decision that editors stay member-only. No schema change needed.

## What is actually missing

The gaps are all in the **admin Roles screen and its supporting reads**, which assume every privileged account is a claimed member:

- `listClaimedMemberRoles()` reads only rows from `members` with an `auth_user_id`. An internal admin never appears, so an admin cannot see who else holds admin.
- The audit log resolves names through `members` first, then `profiles`. An internal admin with no profile row shows as a bare UUID in the grant history.
- The screen's copy explains only the member case, so an internal admin has no signal about why they are not listed.

## Changes

**1. Roles read model** (`src/lib/roles-admin.server.ts`)

- Add `listInternalStaffAccounts()`: every account holding `admin` or `editor` in `user_roles` whose id is **not** present as `members.auth_user_id`. Resolve name from `profiles` and email from the auth admin API. Returns `{ authUserId, name, email, roles[] }`.
- Extend `namesByAuthUser()` to fall back to the account's email when neither `members` nor `profiles` yields a name, so the audit log never renders a raw UUID.

**2. Roles RPC** (`src/lib/roles.functions.ts`)

- `listRoleAdminData` returns an extra `internal` array alongside `members` and `audit`. `grantEditor` / `revokeEditor` are unchanged — still member-only, still enforced by the database policy.

**3. Roles screen** (`src/routes/_staff/roles.tsx`)

- Add a second, read-only "Internal accounts" table below the members table: name, email, role badges, and a note that these accounts have no ICF member record and are provisioned outside the app.
- Reword the intro so the two entry cases are explicit: internal admins vs. claim-linked members.

**4. Copy** (`src/i18n/locales/{en,de,fr,it}/cms.json`)

- New keys: `roles.internalTitle`, `roles.internalIntro`, `roles.internalEmpty`, `roles.colRoles`, plus the revised `roles.intro`. Localised for all four languages.

**5. Documentation** (`docs/auth-and-claim-flow.md`)

- Add a short "Two kinds of account" section stating the rule: admins may exist without a member record; every other privileged role requires a claim-linked `members.auth_user_id`.

## Not doing

- No new grantable roles in the UI, and no ability to mint admins from the app.
- No relaxation of the member requirement for `editor`.
- No change to the claim flow, sync pipeline, or Member Area.

## Technical notes

Listing accounts that are not members requires reading `auth.users`, which only the service role can do — this stays inside `roles-admin.server.ts` behind `assertAdmin`, matching how the existing member list already works. No migration is required.
