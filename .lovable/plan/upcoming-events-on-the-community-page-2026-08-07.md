# Upcoming events on the community page

Add a section to each local community page listing upcoming events, placed below the description and volunteer ring.

## What the visitor sees

- Heading "Upcoming events", with up to 6 events sorted by date.
- Events belonging to this community come first. If the community has none, the section falls back to upcoming events from other local communities, labelled so it is clear they belong elsewhere (a "Community Zürich" tag on each card).
- Each card: date and time in the event's timezone, title, place (venue and city, or "Online") and a short summary — matching the card style already used on the events page.
- A "See all events" link to the events page.
- If there are no upcoming local community events at all, the section is hidden entirely rather than showing an empty box.
- Fully localised in DE, FR, IT, EN, reusing the existing event translations for titles and summaries.

Community Zürich currently has 6 upcoming events, so the section will be populated there; other communities will show the fallback list.

## Technical notes

**Database (one migration)**

`events_public` — the read-only public projection of events — does not currently expose which community an event belongs to, so the public page cannot filter by it. The migration recreates the view (keeping `security_invoker = on`) with three added columns: `community_id`, `community_slug`, `community_name`, joined from `op_projects` where `is_community` is true. Anonymous visitors already have read access to the underlying `events.community_id` and `op_projects` columns, so no new grants are needed. No table or policy changes.

**Data layer**

- `src/lib/events.ts`: add the three new columns to `PUBLIC_EVENT_COLUMNS`.
- `src/lib/events.functions.ts`: new public server function `listCommunityEvents({ slug, locale })` using the existing anonymous publishable client. It selects upcoming events where `community_slug` is not null, ordered by start time, applies the same `applyTranslation` locale overlay as the main events list, then splits into `own` (matching slug) and `other`, returning at most 6 with own-first ordering.

**UI**

- New `src/components/communities/CommunityEvents.tsx` — presentational, receives the resolved list. Card markup, date formatting and place labels reuse `formatEventDate`, `formatEventTimeRange`, `eventPlace` and `CARD_SHADOW`, so it stays consistent with the events page.
- `src/pages/CommunityDetail.tsx`: fetch via `useQuery` keyed on slug and locale, mirroring the existing community query, and render the new section after the current one.
- Background rhythm: the existing section is `bg-background` (bone), so the events section uses `bg-card` (white), keeping the alternating surface rule.
- New strings under `communities.detail.events.*` in `src/i18n/locales/{en,de,fr,it}/communities.json`.

## PR note

**Summary** — Surfaces upcoming local community events on each community detail page, with a chapter-wide fallback so the section stays useful for communities without their own programme yet.

**Changes**
- UI: new `CommunityEvents` section component, wired into `CommunityDetail`.
- Data: `listCommunityEvents` public server function; `PUBLIC_EVENT_COLUMNS` extended.
- i18n: `communities.detail.events.*` in four languages.

**Backend / schema changes** — One migration recreating the `events_public` view with `community_id`, `community_slug`, `community_name`. `security_invoker = on` preserved. No new tables, columns, policies or grants.

**Testing & verification** — Community Zürich page (own events populated) and a community without events (fallback list) as an anonymous visitor; all four locales; empty state when no local events exist at all; confirm the events listing and event detail pages still render after the view change; security linter after the migration.

**Risks & rollback** — Low. The view change is additive; reverting the code without the migration is safe since extra view columns would simply go unused. Main risk is the view recreation briefly affecting the events page, covered by the verification step.

**Follow-ups / known debt** — Event card markup will now exist in three places (events page, this section, event detail). Extracting a shared `EventCard` is worth a separate cleanup pass.