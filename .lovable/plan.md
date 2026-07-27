## Planning docs update — record the staff/member split

Two documentation changes only. No application code, schema, or route changes.

### 1. New file: `.lovable/plan-rev5.md`

A new revision rather than an append, because rev. 4 describes the pre-split world as a coherent whole (single `/auth` CMS shell, staff-only sign-in) and rewriting it in place would make its cutover runbook harder to read against history. Rev. 5 supersedes rev. 4 on access control and routing only; everything else in rev. 4 (cutover runbook, email safety, claim gate) stands.

Contents:

**Access-control defect that triggered the split.** `has_role` and `is_editor` had `EXECUTE` revoked from `authenticated` during earlier security hardening. RLS policies on `members` and `member_directory_profiles` call those helpers as the caller, so every staff read of the Members screen failed with "permission denied for function is_editor". Grants restored; the helpers are `SECURITY DEFINER` and only reveal whether the caller holds a role, so this is not the vulnerability the revoke was aiming at.

**Role model.** `app_role` now has five values: `admin`, `editor`, `contributor`, `member`, `user`. Definitions of each, plus `is_staff` (admin/editor/contributor) alongside `is_editor` (admin/editor). Contributor limits: own drafts only, no publish/schedule/unpublish, no Categories/Vocabularies/Members/Integration/Coach Finder — enforced in RLS, mirrored in the editor UI.

**Two authenticated layouts.** `src/routes/_authenticated/` is gone, replaced by:
- `_staff/` — Articles (+ new/edit/categories), Vocabularies, Coach Finder, Members (list + detail), Integration. Guarded to staff roles.
- `_member/` — `/my-profile` only, rendered in `MemberShell` (logo, language switcher, sign out) with no path to any staff screen.

**Routing rules.** `/auth` and `/auth/callback` resolve the destination from `user_roles`: staff → `/articles`, member-only → `/my-profile`, neither → `/no-access`. An account holding both grants lands in the CMS and reaches the Member Area at `/my-profile`.

**Binding rule (carried forward into Milestone D).** Email nominates a candidate; the boundary is the explicit `members.auth_user_id` link plus the granted `member` role. Admin bind grants the role and refuses ambiguous email matches; unbind revokes the role unless another member row is still linked. The claim flow must refuse ambiguous or already-linked addresses rather than assume email uniqueness.

**Impact on rev. 4.** Note explicitly that rev. 4 §4's "`/auth` keeps serving staff CMS sign-in only" is superseded — `/auth` is now the shared entry point with role-based dispatch — while the claim hard-disable, the trigger invariants, and the cutover runbook are unchanged.

### 2. Reconcile `.lovable/plan.md` (Milestone B)

Targeted edits so the doc matches reality:

- §4 heading and route reference: `/members/$id` now lives at `src/routes/_staff/members.$id.tsx`; describe it as a staff-CMS screen under the `_staff` layout, reachable by admin/editor and not by contributors or members.
- §4 "linked from the members list": state that the link and the whole Members section render only for staff roles, via the role-filtered sidebar, not merely hidden nav.
- "Future Member Area (Milestone E)" block: retitle to reflect that the Member Area shell and `/my-profile` already exist under `_member/`, so Milestone E is the member-owned service-area editing on top of an existing area rather than a new area.
- Closing line: keep C → D strictly serial, and restate them as C = cutover readiness rehearsal, D = claim flow activation, with a pointer to rev. 5 for the role/binding preconditions D depends on.
- Add a short "Status" note at the top recording that B's four pieces landed and what changed underneath them since B was written.

### Technical notes

Both files live in `.lovable/` and are documentation only; nothing imports them.
