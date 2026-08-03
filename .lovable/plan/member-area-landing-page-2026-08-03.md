# Member Area landing page

Today a signed-in member lands directly in the profile editor. This adds a
welcome page in front of it that greets them by name and points to the things
the Member Area offers.

## What the member sees

New page at `/member`, inside the existing Member Area shell (Deep Blue header,
language switcher, sign-out, staff link when applicable).

1. **Greeting** — "Welcome back, {first name}" using the imported ICF first
   name, with a short line about what they can do here. Falls back to a neutral
   greeting if the account has no linked member record yet.
2. **My profile** — card describing the public Coach Finder listing, with an
   active CTA to `/my-profile`. Shows the current state (published / draft /
   not eligible) so the card is useful, not decorative.
3. **ICF Engage** — explains the global ICF community platform and invites them
   to join the Switzerland Chapter community there. Active CTA opening
   `https://engage.coachingfederation.org/communities/community-home?CommunityKey=230cb83a-26a7-4ffb-a2c4-fd9309091489`
   in a new tab.
4. **Volunteering** — the chapter runs on volunteers; opportunities will be
   listed here. CTA present but disabled, labelled "Coming soon".
5. **Your local communities** — the communities that match the member's own
   service-area regions (the cantons selected in their profile), each with its
   lead(s) to contact: name, role and contact route (community contact email
   where set, otherwise the community page). With no regions selected the card
   invites them to set their service area; with no match it links to
   `/communities`.
6. **Advertise with us** — paid placements for coaches in chapter
   communications. CTA present but disabled, labelled "Coming soon".

Cards follow the existing surface rhythm (bone base, white cards, restrained
borders); no new colours, fonts or components invented.

## Matching communities to regions

Communities are `op_projects` rows flagged `is_community`; they have no link to
`cf_regions` today, and slug matching would be wrong (Community Romandie covers
Vaud, Geneva and Romandie-other; Valais and "Online only" map to nothing). So
the plan adds an explicit, staff-managed link:

- New table `public.op_project_regions` (project_id, region_id) with the same
  access rules as `op_projects`: public read, admin write.
- Region multi-select added to the community block of the Operational
  Structure editor, so admins own the mapping.
- Initial mapping seeded in the migration: zurich, bern, basel, central,
  eastern, ticino to their communities, and romandie-vaud + romandie-geneva +
  romandie-other to Community Romandie. Valais and Online-only stay unmapped.

Leads come from `op_assignments` on the community's `lead` role. No lead is
assigned in the data yet, so the card falls back to the community contact email
and then to the community page link.

## Routing

`landingPath()` changes for members from `/my-profile` to `/member`, so
post-login and `/auth/callback` land on the greeting. `/my-profile` keeps
working as its own route and gets a back link to `/member`. The Member Area
header title links to `/member`.

## Technical notes

- New route `src/routes/_member/member.tsx` under the existing `_member` gate
  (member role required, `ssr: false`), rendering a new
  `src/components/member/MemberHome.tsx`.
- Name and profile state come from the existing `getMyMemberProfile` server
  function via `useServerFn` + `useQuery` — no new server function, no schema
  change, no new database access.
- Community matching runs in a new authenticated server function
  (`member-home.functions.ts` + `member-home.server.ts`) that resolves the
  caller's regions from their own member record and returns matching
  communities with their leads.
- Copy added under a `member.home.*` block in `src/i18n/locales/{en,de,fr,it}/cms.json`,
  matching the existing CMS i18n pattern.
- `landingPath` in `src/lib/role-model.ts` gains `/member` in its return union;
  `MemberShell` gets the link to it.

## PR note

**Summary** — Adds a Member Area landing page that greets the member by name
and surfaces My profile, ICF Engage, Volunteering and Advertise with us;
members now land there instead of straight in the profile editor.

**Changes**
- UI: new `/member` route + `MemberHome` component; `MemberShell` header links
  to it; `/my-profile` gains a back link.
- Routing: `landingPath()` returns `/member` for members.
- i18n: `member.home.*` keys in all four locales.
- Backend: `op_project_regions` link table + admin region picker in the
  Operational Structure editor; new authenticated server function returning the
  member's matching communities and their leads.

**Backend / schema changes** — New `op_project_regions` link table (public
read, admin write, GRANTs included) plus a seed of the current region-to-
community mapping. No changes to existing tables.

**Testing & verification** — Sign in as a claimed member (landing, greeting,
all five cards, communities matching the member's regions, active vs disabled
CTAs), as a member who also holds `editor`
(staff link still present), and as a staff-only account (unchanged routing).
Checked mobile and desktop widths, keyboard focus order and that disabled CTAs
are announced as disabled.

**Risks & rollback** — Low blast radius: additive route plus one redirect
target. Revert by pointing `landingPath` back at `/my-profile`.

**Follow-ups** — Community leads are unassigned in the data today, so cards
fall back to contact email or the community page. Volunteering and advertising
CTAs are intentionally inert until that content exists.
