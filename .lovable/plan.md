## Goal

Turn the operational-structure projects that are communities into a public, translatable communities section: an overview page, a per-community detail page with a hexagon + ring of member photos, and an About-page preview. No new data source — communities are `op_projects` rows flagged as such.

## Phase 1 — Data model (one migration)

Extend `public.op_projects`:

- `is_community boolean not null default false`
- `is_featured_community boolean not null default false` (enforced single-winner by a trigger, same pattern as `tg_articles_single_featured`)
- `description text` + `description_de/fr/it text` (markdown source)
- `cadence_note text` + `cadence_note_de/fr/it text`
- `contact_email text`, `signup_url text`
- `language_slugs text[] not null default '{}'` — references `cf_languages.slug`, rendered as DE/FR/IT/EN chips

Update `public.team_projects_public` (the existing anon-readable view) to expose the new columns, still filtered to `is_active`. Keep the view as the only public read surface; no new grants on `op_projects`.

Seed the existing seven `community-*` rows with `is_community = true` and pick one as featured (admin can change it later).

## Phase 2 — CMS (operational structure page)

In `src/routes/_staff/operational-structure.tsx`, project details gain:

- "This project is a local community" checkbox → reveals the community fields
- "Featured community" checkbox (shown only for communities)
- Description via the existing `MarkdownEditor` with a locale tab strip (EN/DE/FR/IT), matching how event/article translations are edited
- Cadence note (4 locales), contact email, sign-up URL, language chips picked from `cf_languages`

Writes keep going through the caller's RLS-scoped browser client — the existing "admins manage op_*" policies remain the boundary.

## Phase 3 — Public read path

New `src/lib/communities.ts` (client-safe shapes) and `src/lib/communities.functions.ts`:

- `listCommunities({ locale })` — from `team_projects_public` where `is_community`, resolving name/description/cadence to the locale with English fallback, plus a member count per community.
- `getCommunity({ slug, locale })` — the community row plus its members, reusing the existing `team_directory_public` read and assignment shape so photo signing, initials fallback, translated bios and coach-profile links behave exactly as on the team page. Returns `notFound()` for an unknown or non-community slug.

Member/photo logic is factored out of `team.functions.ts` into a shared helper rather than duplicated.

## Phase 4 — Pages and routes

- `src/pages/Communities.tsx` and `src/pages/CommunityDetail.tsx`
- Routes: `src/routes/communities.index.tsx`, `src/routes/communities.$slug.tsx`, plus `$locale` twins, each with its own `head()` (title, description, og:*) and `localeLinkTags` hreflang, following `team.tsx`
- Overview: `CompactHero` + translatable intro + a visual card grid (one card per community: hexagon avatar cluster preview, name, cadence, language chips, member count, arrow CTA)
- Detail: markdown description, contact/sign-up CTAs, then the **hexagon ring**:
  - central hexagon (community name, reusing the team page's `HEX_CLIP`)
  - members positioned on a circle around it as ~50px circular photos with initials fallback
  - hover/focus zooms the photo and reveals name + role title
  - click opens the **team page modal**, which is extracted from `TeamGrid.tsx` into `src/components/team/MemberModal.tsx` and imported by both
  - accessibility: each photo is a real `<button>` in DOM order, keyboard-focusable with the same zoom-on-focus state, `aria-label` with name + role; below a breakpoint (and on touch) the ring degrades to the existing honeycomb/list layout so nothing depends on hover
- Sitemap: add `/communities` and every community slug to `sitemap.xml`
- Header/footer navigation: add "Communities" where "Team" already appears

## Phase 5 — About page + translations

- Replace the hard-coded `about.communities` section in `src/pages/About.tsx` with a `CommunitiesPreview` component showing the admin-picked featured community (name, short description excerpt, cadence, language chips, avatar ring) and a "See all communities" CTA to `/communities`.
- Remove the now-dead `about.communities.items` data from all four `about.json` files.
- New `communities.json` namespace in `en/de/fr/it` (hero, intro, labels, empty/loading states, modal reuse) — UI strings hand-written per locale, consistent with existing namespaces; community content itself is CMS-managed.

## PR note

**Summary** — Adds a public local-communities section (overview, detail with hexagon member ring, About preview) driven entirely by the existing operational structure; communities are `op_projects` flagged `is_community` with translatable markdown content managed in the admin CMS.

**Changes**

- UI: new Communities overview and detail pages, `CommunitiesPreview` on About (replacing the static section), extracted shared `MemberModal`, nav + sitemap entries.
- CMS: community fields in the operational structure project editor with 4-locale markdown description.
- i18n: new `communities` namespace ×4 locales; pruned `about.communities.items`.

**Backend / schema changes** — One migration on `public.op_projects` (community flag, featured flag, markdown description ×4, cadence ×4, contact email, sign-up URL, language slugs) plus a single-featured trigger and an updated `team_projects_public` view. No new tables, no new grants, no RLS relaxation — the public surface stays the anon-readable views. Seed update flags the existing `community-*` rows.

**Testing & verification** — Anonymous load of `/communities` and each `/communities/$slug` in all four locales; keyboard tab-through and screen-reader labels on the member ring; mobile fallback layout; admin editing of community fields and featured toggle; verify a non-admin cannot write `op_projects`; confirm the team page and About page still render.

**Risks & rollback** — Additive columns only; reverting the code leaves the migration harmless. Main blast radius is the `team_projects_public` view (also used by the team page) and the `MemberModal` extraction, both covered by the verification pass.

**Follow-ups / known debt** — No geolocation-based "closest community" (admin-picked featured instead); community content has no AI-translation panel in this phase (manual per-locale editing), which can be added later reusing the events/profiles translation workflow.

&nbsp;

# Approval note

Approved with two additions before implementation:

### Hexagon/community fallback rules

Please implement the member-ring behavior as:

- **0 or 1 assigned members**: show only the central community hexagon, no member ring
- **2-12 assigned members:** show all assigned members around the hexagon
  - **More than 12 assigned members:** show the first 12 members alphabetically, plus an "and more" indicator/link so the layout stays clean
- **Automatic translation in this build**  
Please include automatic translation support for the community CMS fields in this feature build, not as a follow-up. The community description, cadence note, and any other community-managed content should support the same AI-assisted translation workflow used elsewhere in the project.

With those additions, I approve the plan.