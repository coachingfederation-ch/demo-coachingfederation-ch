## Phase 2 (rev. 5) — Role model and the staff/member area split

Supersedes rev. 4 **on access control and routing only**. Everything else in rev. 4 — the data classification, the purge-and-reimport cutover runbook, email suppression, and the claim hard-disable with its trigger invariants — stands unchanged.

---

### 1. The defect that forced this revision

Earlier security hardening revoked `EXECUTE` on `public.has_role` and `public.is_editor` from the `authenticated` role. Both are `SECURITY DEFINER` helpers, but the RLS policies on `members`, `member_directory_profiles` and the member sync/audit tables call them **as the caller**. With the grant removed, every staff read of the Members screen failed with `permission denied for function is_editor`.

Fixed by restoring `EXECUTE` to `authenticated` on `has_role`, `is_editor` and the new `is_staff`. This is not the exposure the revoke was aiming at: the helpers answer only "does this user hold this role" for a user id the caller already supplies, and they remain revoked from `PUBLIC`/`anon`.

The failure was also a symptom of a structural problem: staff and members shared one authenticated shell, so a member-scoped session could reach an admin-scoped screen at all. That is what the rest of this revision fixes.

---

### 2. Role model

`app_role` now has five values:

| Role          | Area        | Scope                                                                                                                                  |
| ------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `admin`       | Staff CMS   | Everything, including Integration, cutover, member binding, CSV export                                                                 |
| `editor`      | Staff CMS   | All articles and taxonomy; publish rights; Members read/manage; no cutover                                                             |
| `contributor` | Staff CMS   | **Own articles, drafts only.** No publish/schedule/unpublish. No Categories, Vocabularies, Members, Integration or Coach Finder config |
| `member`      | Member Area | Own directory profile only                                                                                                             |
| `user`        | —           | Legacy/no area; lands on `/no-access`                                                                                                  |

Helpers: `is_editor(uuid)` = admin ∪ editor (unchanged meaning), `is_staff(uuid)` = admin ∪ editor ∪ contributor (new). Roles continue to live only in `public.user_roles` — never on `profiles` or `members`.

**Contributor enforcement** is in RLS, not the UI: `contributors read own articles`, `contributors insert/update/delete own drafts` all require `auth.uid() = author_id AND has_role(auth.uid(),'contributor')` and, for writes, `status = 'draft'`. The editor simply hides the publish/schedule/unpublish controls and shows a "drafts only" note; the database is the boundary. Admin/editor retain full publish rights over contributor drafts through `editors manage all articles`.

---

### 3. Two authenticated layouts

`src/routes/_authenticated/` no longer exists. It is replaced by two pathless layouts with independent guards and no shared navigation:

**`src/routes/_staff/`** — the Insights CMS shell.
`articles.tsx` (+ `articles.index`, `articles.new`, `articles.$id`, `articles.categories`), `vocabularies.tsx`, `coach-finder.tsx`, `members.index.tsx`, `members.$id.tsx`, `integration.tsx`. `_staff/route.tsx` admits staff roles only; a member-only session is redirected out. The sidebar is role-filtered, so contributors never render links to editor-only screens.

**`src/routes/_member/`** — the Member Area.
`my-profile.tsx` only, rendered inside `MemberShell` (logo, language switcher, sign out). No sidebar, no link of any kind to a staff screen. `_member/route.tsx` admits the `member` role only.

**`/my-profile` relocation.** "My coach profile" was removed from the CMS sidebar entirely and moved from the shared shell to `/my-profile` under `_member/`. The staff CMS no longer renders or routes to member-scoped content.

`src/routes/no-access.tsx` is the landing page for an authenticated account with neither a staff role nor `member`; it offers only sign-out.

---

### 4. Role-based redirect rules

Destination is resolved from `user_roles`, never from email, path history, or which button was pressed. `landingPathForSession(userId)` in `src/lib/roles.ts` is the single decision point, used by both `/auth` and `/auth/callback`:

| Roles held                                | Lands on      |
| ----------------------------------------- | ------------- |
| any staff role (with or without `member`) | `/articles`   |
| `member` only                             | `/my-profile` |
| neither                                   | `/no-access`  |

Staff wins when an account holds both grants — the CMS is the working surface — and the Member Area stays directly reachable at `/my-profile`. An already-signed-in visitor to `/auth` is dispatched the same way rather than being pushed to `/articles` unconditionally.

Client-side role reads (`useMyRoles`) gate navigation and affordances only. The layout `beforeLoad` guards and RLS are the boundary.

---

### 5. Binding rule — precondition for Milestone D

**Email equality is never the binding or access boundary.** An address only nominates a candidate member record; the durable link is `members.auth_user_id` plus the granted `member` role.

- **Admin bind** (staff-support path, audited to `member_sync_events`) looks the account up by email, then refuses when several member rows share that address and none is the record the admin explicitly selected. On success it sets `auth_user_id` **and** upserts the `member` role, so the link and the access grant can never drift apart.
- **Admin unbind** clears `auth_user_id` and revokes the `member` role, unless that account is still linked to another member row.
- One auth user may deliberately hold both staff roles and a member link for controlled testing and support. §4 decides where they land; it does not blur the two areas.
- **Milestone D (claim flow activation) inherits this rule**: a verified email must be refused when it matches more than one member record or a record already linked to an account. The claim flow may not assume email uniqueness, and it must grant the `member` role as part of completing the link. It stays inert while `account_claim_enabled` is false, which rev. 4 §4's trigger invariants still enforce.

---

### 6. What this changes in rev. 4

- **Superseded:** rev. 4 §4's "`/auth` keeps serving staff CMS sign-in only". `/auth` is now the shared entry point for both areas, with role-based dispatch.
- **Unchanged:** the claim hard-disable and its trigger invariants (§4), email suppression and `member_email_log` (§5), the full cutover runbook (§6), operational visibility (§7), and the data classification (§1). The cutover's "delete every `auth.users` row with no `user_roles` entry" step still holds — with the caveat that a TEST member bound for testing now _does_ carry a `user_roles` row, so the cutover must unbind and revoke the `member` role for TEST bindings explicitly rather than relying on the orphan sweep.

---

### 7. Sequencing

Milestone C (cutover readiness rehearsal) is next, then D (claim flow activation); C → D remain strictly serial. D depends on §5 of this revision, not on the pre-split assumption that one authenticated shell serves everyone.
