# Event hosts + structured event editor

## What changes

**1. Hosts on events (up to 2)**

Staff can attach up to two hosts to an event. A host is picked from members who have a
**published directory profile**, so every host resolves to a real public coach page.

On the public event page, hosts appear as a small "Hosted by" block: profile photo, name,
optional tagline, linking to `/coach/<profileId>`.

**2. Restructured event editor**

The current single 2-column grid becomes labelled sections with headings and short helper
lines, in this order:

```text
Event details      title, slug, language, featured
Event content      summary, description, translations panel
Hosts              up to 2 member pickers (new)
Date & time        starts, ends
Location           format, city, venue, online link
Image              image URL, Unsplash picker, preview, credit
Registration       capacity, mode, guest registration, opens/closes
```

Each section is a card on the CMS surface with a heading and divider; the save / publish /
cancel action row stays at the bottom, and the attendees table stays below it. No field is
removed or renamed — only regrouped.

## Technical notes

- **Schema**: new `public.event_hosts` (`event_id`, `profile_id` -> `member_directory_profiles`,
  `sort_order`), unique on (event_id, profile_id), max-2 enforced in the server function.
  GRANTs: `SELECT` to `anon` + `authenticated` (hosts are public), full CRUD to `authenticated`
  behind a policy mirroring the existing event-write policy (organizer owns event / editor-admin),
  `ALL` to `service_role`. RLS on.
- **Server fns** in `src/lib/events-admin.functions.ts`: `searchHostCandidates` (name search across
  `members` joined to published `member_directory_profiles`, admin client server-side like
  `searchOpsMembers`, capped at 20) and `setEventHosts` (replace the set, validate <= 2).
- **Public read**: extend `getPublicEvent` to return hosts with name, tagline and a short-lived
  signed image URL via the existing `signProfileImages` helper.
- **UI**: new `src/components/cms/EventHostsPanel.tsx` reusing the debounced search + select
  pattern from `operational-structure.tsx`; new `Section` wrapper local to the event editor.
  `src/pages/EventDetail.tsx` gains the "Hosted by" block under the hero details.
- **i18n**: new keys under `events.*` in `src/i18n/locales/{en,de,fr,it}/cms.json` (section
  headings, host labels) and the public event strings for "Hosted by".

## PR note

- **Summary** — Adds up to two hosts per event, linked to published coach profiles and shown on
  the public event page, and reorganises the event editor into labelled sections.
- **Changes** — UI: sectioned event editor, host picker panel, public "Hosted by" block.
  Backend: `event_hosts` table, host search/save server fns, hosts in the public event read.
  i18n: new keys in all four languages.
- **Backend / schema** — one migration creating `event_hosts` with grants, RLS and policies.
- **Testing** — edit an event as editor and as organizer: add/remove hosts, save, reload; verify
  the public event page shows both hosts with photos and working links, and that an event with no
  hosts renders unchanged; check all four locales.
- **Risks & rollback** — additive only; reverting the code leaves an unused table, safe to keep.
- **Follow-ups** — no drag-ordering of the two hosts (the picker order is the display order);
  hosts are not included in event translations (names are not translated).
