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
5. **Advertise with us** — paid placements for coaches in chapter
   communications. CTA present but disabled, labelled "Coming soon".

Cards follow the existing surface rhythm (bone base, white cards, restrained
borders); no new colours, fonts or components invented.

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

**Backend / schema changes** — None.

**Testing & verification** — Sign in as a claimed member (landing, greeting,
all four cards, active vs disabled CTAs), as a member who also holds `editor`
(staff link still present), and as a staff-only account (unchanged routing).
Checked mobile and desktop widths, keyboard focus order and that disabled CTAs
are announced as disabled.

**Risks & rollback** — Low blast radius: additive route plus one redirect
target. Revert by pointing `landingPath` back at `/my-profile`.

**Follow-ups** — Volunteering and advertising CTAs are intentionally inert
until that content exists.
