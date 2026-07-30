# Operational structure & public team page

Four deliverables: an admin CMS screen for projects/roles/assignments, a translatable "Team role description" on the member profile, a public `/team` page with a honeycomb grid, and a preview section on About.

## 1. Data model (new tables)

- `op_projects` — slug, name + `name_de/fr/it`, `sort_order`, `is_active`. Same shape as the existing `cf_*` vocabularies so it can reuse the vocabulary editing patterns.
- `op_project_roles` — `project_id`, slug, name + `name_de/fr/it`, `sort_order`, `is_active`. Roles are defined per project.
- `op_assignments` — `member_id`, `project_id`, `role_id`, `sort_order`. Unique on (member, project, role).
- `member_directory_profiles.team_bio` (text, max 2000 enforced in the server function) plus `team_bio` added to `member_profile_translations` — the same translation table and AI panel the coach fields already use.

Access rules: projects/roles/assignments are admin-managed (write restricted to admin); public read comes through a **new view `public.team_directory_public**` granted to `anon`, exposing only member name, `profile_image_path`, `team_bio`, primary locale, project/role slugs + localized names, sort order, LinkedIn URL, contact email only when `contact_email_public` is true, and `profile_id` only when the member's coach profile is actually published and eligible (otherwise null, so the modal hides that link).

Seeding: the ~22 default projects from the reference site are inserted as normal rows — fully editable and deactivatable afterwards.

## 2. CMS: Operational structure (admin only)

New route `src/routes/_staff/operational-structure.tsx`, nav item in `Shell.tsx` with `allowedRoles: []` (admin-only, same as Vocabularies/Roles).

- Project list with add / rename (4 locales) / reorder / activate-deactivate.
- Selected project shows its roles (same controls) and its assignments.
- Assign a member: searchable picker over claimed/imported members; pick a role; reorder assignments.
- On assign: if the member's account lacks `editor`, grant it via the existing `grantMemberRole` path (reusing `editor`, no new role).
- On removing a member's **last** assignment: a confirm dialog asking whether to also revoke `editor`. Never auto-revoke.
- Server functions in `src/lib/operational-structure.functions.ts` + `.server.ts`, each guarded by `assertAdmin`, mirroring `roles.functions.ts`.

## 3. Member profile: Team role description

In `MemberProfileEditor`, a "Team role description" textarea (max 2000) rendered **only when the signed-in member holds `editor**`. Added to the update schema in `member-profile.functions.ts` and to `TRANSLATABLE_FIELDS`, so it appears automatically in the existing `ProfileTranslationsPanel` with AI translation, ready/outdated states and all.

## 4. Public team page

Routes `src/routes/team.tsx` (en) and `src/routes/$locale/team.tsx`, page in `src/pages/Team.tsx`, following the existing `find-a-coach` pattern (`CompactHero` + `SiteFooter`, `head()` with localized meta and hreflang links).

- Data via a public server fn reading the new view; photos signed with the existing `signProfileImages`, initials fallback.
- Filter pills: "All" + one per active project, localized, driven by a `?project=` search param.
- Honeycomb grid: hexagon tiles via CSS `clip-path`, offset rows, column count stepping down at breakpoints (e.g. 7 → 5 → 3 → 2). Reflows on filter change with a light transition.
- Hover/focus overlay: name + role title. Tap on touch opens the modal directly.
- Modal (existing dialog primitive): circular photo, name, project · role, localized `team_bio`, email icon only if opted in, LinkedIn icon if present, "View coach profile" link only when a published profile exists, close button, focus trap and Esc.
- One tile per member; primary (first-ordered) assignment on the tile, all pairs listed in the modal; a member matches any of their projects when filtering.

## 5. About page preview

A section on `src/pages/About.tsx` showing a handful of team tiles (same tile component, small honeycomb) plus a "More" link to `/team`, with copy in all four locale files.

## Technical notes

- All new UI strings go into `src/i18n/locales/{en,de,fr,it}/team.json` (+ `cms.json` keys for the admin screen).
- No new role: `editor` is reused exactly as specified.
- Public exposure is limited to the columns listed above; the view is the boundary, base member tables are never read from public paths.

---

# PR note

**Summary** — Adds an admin-managed operational structure (projects, roles, member assignments), a translatable team bio on member profiles, a public honeycomb team page at `/team` in four locales, and a team preview on About.

**Changes**

- UI: new `/team` page + honeycomb grid, tile and modal components; About preview section; new admin CMS screen and nav item; team bio field in the member profile editor.
- Backend: `operational-structure.functions.ts` / `.server.ts` (admin-guarded CRUD, reorder, assign/unassign with `editor` grant), public team read function.
- i18n: new `team.json` per locale, extra `cms.json` keys.

**Backend / Schema changes**

- New tables `op_projects`, `op_project_roles`, `op_assignments` with grants, RLS (admin write, no direct anon read) and updated_at triggers.
- New column `member_directory_profiles.team_bio` and `member_profile_translations.team_bio`.
- New public view `team_directory_public` granted SELECT to `anon`, projecting only public-safe columns.
- Seed insert of the default project list.

**Testing & verification**

- Admin: create/rename/reorder/deactivate projects and roles; assign and unassign members; confirm `editor` is granted on first assignment and that removal prompts rather than auto-revoking.
- Member with `editor`: team bio visible and saveable; translations panel handles the new field; member without `editor` does not see it.
- Public: `/team` and `/de|fr|it/team` render, filters narrow the grid, modal shows only opted-in email, coach-profile link hidden when no published profile.
- Responsive honeycomb at mobile/tablet/desktop; keyboard access to tiles and modal.

**Risks & rollback**

- Blast radius is mostly additive; the one shared touch point is `member_directory_profiles` / `member_profile_translations` (new nullable column, safe to leave if code is reverted). Reverting the code leaves the new tables and view unused but harmless.

**Follow-ups / known debt**

- Team members inherit full Article/New Article access via `editor` — accepted for now; a narrower `team` capability would be the ideal fix later.
- Admin-side bulk reordering is per-item arrows (matching the vocabulary screen), not drag-and-drop.

# Approval Notes

Approved with a few additions/validations before implementation.

The plan looks solid overall: the split into operational structure management, member profile team bio, public team page, and About preview makes sense. Reusing the existing `editor` role is accepted for this implementation.

Please add/confirm the following before starting:

1. **Admin-only nav behavior**  
The new CMS nav item uses `allowedRoles: []`. Please confirm this is actually admin-only with the current Shell filter. If an empty array would hide it from everyone, use the existing admin-only pattern instead, e.g. `allowedRoles: ["admin"]` or an explicit admin bypass.
2. **Team page visibility vs. Coach Finder visibility**  
Please validate that operational-structure members appear on the public team page even if their Coach Finder profile is not published/eligible. The Coach Finder link should be hidden unless the profile is published/eligible, but the team tile itself should depend on operational assignment, not Coach Finder publication.
3. **Project/role translation pattern**  
Please verify whether the existing `cf_*` vocabulary tables use inline locale columns (`name`, `name_de`, `name_fr`, `name_it`) or a separate translation-table pattern. Match the existing vocabulary pattern, and confirm automatic translation support for project and role names, not just manual locale fields.
4. **Honeycomb visual/accessibility QA**  
Please explicitly verify the honeycomb grid on desktop, tablet, and mobile: no awkward clipped faces, row offsets remain clean, focus states are visible and not clipped, keyboard navigation works, and the modal remains accessible with focus trap + Esc close.

With those additions/validations, I approve the plan.