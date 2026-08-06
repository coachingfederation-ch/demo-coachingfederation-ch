# Event metadata and light filtering

Give events real, filterable metadata and add a calm filter bar to the events page, modelled on the current coachingfederation.ch events browser but with the taxonomy problems fixed.

## The taxonomy, corrected

| Facet | Meaning | Values |
| --- | --- | --- |
| When | Recency, not a "type" | Upcoming (default) · Past |
| Category | What kind of event it is | see below |
| Region | Where it belongs | existing region vocabulary (Zürich, Bern, Basel, Central, Eastern, Vaud & Lausanne, Geneva, Romandie other, Ticino, Valais) + "Nationwide" |
| Language | Event language | DE · FR · IT · EN |
| Format | How you attend | In person · Online · Hybrid (already on the event) |

Dropped: Month (redundant next to a date-sorted list), and the old "Type of event" which was recency in disguise.

### Proposed categories

- **Chapter events** — governance and chapter life: AGM, member assemblies, chapter updates, volunteer calls.
- **Community events** — local and peer gatherings: regional meetups, peer coaching circles, coffee & connect.
- **Learning events** — professional development: ethics, AI in coaching, CCE-eligible sessions, mentor coaching, workshops.
- **Flagship events** — the big ones: national conference, coaching summits, ICF Coaching Week.
- **Partner events** — co-hosted or externally organised events the chapter endorses.

Each event has exactly one category, so the filter stays honest and the badge on a card stays readable.

## What changes for visitors

On `/events`:

- A filter bar under the hero: When, Category, Region, Language, Format. All optional, all reflected in the URL so a filtered view can be shared and bookmarked.
- Filtering is client-side over the already-loaded list — instant, no page reloads, works with the existing loader.
- Each card gains a small category label next to the date line; region shows in the date/place line where it adds meaning.
- "When = Past" swaps the list to past events instead of the short recap strip.
- An empty result shows a plain "No events match these filters" with a reset link.

On an event page: the category and region appear in the fact list alongside date, place, language and format.

## What changes for staff

In the event editor, the "Details" section gains two selectors: Category (required for published events) and Region (optional, defaults to Nationwide). Both read from database vocabularies so the lists can be edited later without a code change.

## Technical notes

- New vocabulary table `cf_event_categories` (slug, name + name_de/fr/it, sort_order, is_active), matching the existing `cf_*` pattern, seeded with the five categories above. Public read, staff write, with the usual grants.
- `events` gains `category_id uuid references cf_event_categories(id)` and `region_id uuid references cf_regions(id)`; a `nationwide` row is added to `cf_regions`. Both nullable so existing rows stay valid; existing events are backfilled to Chapter events / Nationwide.
- `events_public` view is recreated to expose `category_slug`, `category_name`, `region_slug`, `region_name`; `PUBLIC_EVENT_COLUMNS` in `src/lib/events.ts` is extended to match.
- The events route validates the filter search params with `zodValidator` + `fallback` (plain strings, validated in the component), following the existing search-param convention.
- New i18n keys for the filter labels and category names in `events.json` for EN/DE/FR/IT; category names also live in the vocabulary table for the CMS.

## PR note

**Summary** — Adds a proper event taxonomy (category, region) and a light URL-driven filter bar on the events page, replacing the conflated "type/month" facets with When · Category · Region · Language · Format.

**Changes**
- UI: filter bar and category badges on `/events`; category and region in the event detail fact list; category/region selectors in the staff event editor.
- Backend/schema: `cf_event_categories` vocabulary, `events.category_id` and `events.region_id`, `nationwide` region, recreated `events_public` view.
- Config/i18n: new `events.json` and `cms.json` keys in all four languages.

**Backend / schema changes** — One migration: create vocabulary table with grants and RLS, seed categories, add two nullable columns, add nationwide region, backfill existing events, recreate the public view.

**Testing & verification** — Each filter alone and in combination, upcoming/past switch, empty state, deep-linked filtered URL, all four locales, anonymous vs signed-in reads, staff editor save round-trip.

**Risks & rollback** — Low: new columns are nullable and additive. The view recreation is the only shared surface; rolling back the code without the migration is safe because extra columns are ignored.

**Follow-ups / known debt** — Multiple regions per event (currently one), and server-side filtering if the event volume ever outgrows a single loader page.
