## Goal

A dedicated pure-member QA account with a known email/password, bound to one imported member record, with zero staff roles — created through the supported auth-admin path, without touching the existing hybrid admin/member account.

## What the current code makes necessary

Verified before planning:

- Exactly one member is claimed today: `9875144` (Hartmuth Gieldanowski), bound to auth user `706713f9…`. That is the hybrid account and stays untouched.
- All 501 imported members carry TEST-scrambled emails (`zz…zz`); 500 are active and unclaimed.
- The self-service claim flow is closed by design (`account_claim_enabled` requires LIVE + recorded cutover), and `completeClaim` creates the auth user with **the imported member's email** — so claiming would mint a `zz…zz` login. That is exactly what must be avoided.

So the QA account cannot come from the existing token flow as-is. It needs the same *binding contract* (`members.auth_user_id` + a `member` role grant) established through the auth admin API with an operator-chosen email.

## Plan

### 1. Server: QA test-account provisioning (admin only)

New helper `src/lib/qa-test-account.server.ts` and a server function in the existing `src/lib/roles.functions.ts`, guarded by `assertAdmin`, that:

1. Refuses unless the integration is in **TEST** mode (`integration_config.mode`). This makes it impossible to mint synthetic accounts against real LIVE member data.
2. Rejects an email that is test-shaped (`isTestShapedEmail`) — the login identity must be a real address you control.
3. Loads the chosen member: must exist, be `active`, and have `auth_user_id IS NULL`. Never overwrites an existing binding, so the hybrid account is structurally out of reach.
4. Creates the auth user with `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })`. A collision returns a clear "account already exists" message instead of taking over an identity.
5. Binds with `update members set auth_user_id = … where id = … and auth_user_id is null` (same conditional bind as `completeClaim`); on failure the just-created auth user is deleted, so no orphan.
6. Grants **only** `member` in `user_roles`. Nothing else.
7. Records a `member_sync_events` row (`member_qa_account_provisioned`, severity `warning`, actor = the admin) so the synthetic account is visible in the member history like the staff-issued claim link is.

The imported member's scrambled email is never read, changed, or exposed — the auth identity and the imported record stay separate, exactly as the claim flow already treats them.

### 2. Roles screen: minimal additions (`/roles`)

No new screen. Two small additions to the existing page:

- **Link-state column** on the member table: the imported record's ICF number (`cst_recno`) and a shortened auth user id, so claim linkage is verifiable at a glance. The existing badges already convey Member / Editor / Organizer / Administrator; the "Internal accounts" table already covers internal-only.
- **A collapsed "QA test member" panel**, admin-only and rendered **only while the integration is in TEST mode**: pick an unclaimed active member from a dropdown, enter email + password, submit. The result panel echoes the email and password once, in-session, for you to copy — nothing is persisted or emailed.

Read model in `src/lib/roles-admin.server.ts` extends `ClaimedMemberRole` with `cstRecno`, and adds a `listClaimableMembers()` list (id, name, ICF number) for the dropdown. Strings added to `cms.json` for DE/FR/IT/EN.

### 3. Not changed

- No change to `member-claim.server.ts`, the claim gate, RLS, or role-grant policies.
- No change to `handle_new_user`, `auth.callback.tsx`, or the `_member` / `_staff` layouts — the new account routes to `/my-profile` by the existing `landingPath` rules.
- No database migration: `members.auth_user_id`, `user_roles` and `member_sync_events` already carry everything needed.

## Verification I will run

1. Provision the QA account against a chosen active unclaimed member.
2. Confirm in the database: exactly one member row bound to the new auth user, `user_roles` holds only `member`, and `9875144` → `706713f9…` is unchanged.
3. Sign in headlessly as the QA user and confirm it lands on `/my-profile` and that `/roles` and `/articles` are refused.
4. Open a published event detail page as that user and confirm the RSVP form is in signed-in-member shape (prefilled identity, not the guest path).
5. Re-check `/roles` shows the QA account as Member-only with its link state.

## Technical notes

- The provisioning function lives beside the other admin RPCs and follows the same shape: `createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])` → `assertAdmin` → `await import()` of the `.server` helper inside the handler, so the service-role client never enters the client graph.
- Password is validated at ≥ 10 characters, matching `completeClaim`.
- The TEST-mode gate means this control disappears after the LIVE cutover; the real claim flow takes over then.
