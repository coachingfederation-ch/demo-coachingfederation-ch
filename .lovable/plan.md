## Goal

Add a new **Find a Coach** page — a searchable, filterable coach directory built entirely on mock data, matching the prototype layout and the site's existing visual language.

## What the prototype shows

- Subtle-background hero band: overline "Directory", H1 "Find a credentialed coach", lede about ICF credential + Code of Ethics.
- Two-column body: sticky 280px filter sidebar + results area.
  - Sidebar: search input (name, city, specialty), region select, specialty tag chips (multi-select), "Accepting new clients" checkbox.
  - Results: count line ("12 coaches") + "Clear filters" link, then a 2-column grid of coach cards, and an empty state ("No coaches match your filters / Try widening your region or specialty").
- Coach card: avatar (initials fallback) + name, city · languages, credential badge top-right, bio snippet, specialty chips, availability dot ("Accepting new clients" / "Waitlist only").

## Implementation

**1. Mock data — `src/lib/coaches.ts`**

A typed shape that makes the ICF Global vs. locally-editable split explicit:

```text
type Coach = {
  id: string
  icf: {            // sourced from ICF Global API (read-only)
    fullName, photoUrl?, credential: 'ACC'|'PCC'|'MCC',
    credentialSince, city, canton, languages[], specializations[],
    formats: ('in-person'|'online')[], bioSnippet, memberSince
  }
  local: {          // member-managed on this portal
    featured: boolean, customHeadline?, customDescription?,
    acceptingClients: boolean, websiteUrl?
  }
}
```

7 realistic coaches spread across Zürich, Genève, Lausanne, Basel, Bern, Lugano and online-only, mixed ACC/PCC/MCC, mixed languages. Plus derived filter option lists (cantons, languages, specializations).

**2. Components — `src/components/coaches/directory.tsx`**

- `CoachCard` — reuses `CARD_SHADOW`, `rounded-2xl border border-border/70 bg-card`, badge/pill styles from existing sections; initials avatar block in indigo; "Featured" accent badge when `local.featured`.
- `CoachFilters` — search field, canton select, language select, credential toggle pills, specialization chips, format + accepting-clients checkboxes; sticky on desktop, collapsible above results on mobile.
- `CoachDirectory` — client-side `useMemo` filtering, result count, clear-filters, responsive grid (1 / 2 columns), empty state.

**3. Page — `src/pages/FindACoach.tsx`**

`CompactHero` (eyebrow "Directory", accent-highlighted headline, lede) + directory section + `SiteFooter`, matching page structure of ForCoaches.

**4. Routes**

- `src/routes/find-a-coach.tsx` and `src/routes/$locale/find-a-coach.tsx`, using `localeMeta` / `localeLinkTags` like the other pages.
- Add the sitemap entry alongside existing paths.

**5. Navigation**

Replace the header CTA's `href="#find-a-coach"` with a locale-aware link to `/find-a-coach`, and add the footer link where "Coach Directory" is referenced.

**6. i18n**

New namespace `coaches-directory.json` (`findACoach.json`) with EN copy — meta, hero, filter labels, credential/format/specialization labels, availability states, empty state. Run the existing `scripts/translate.ts` to generate DE/FR/IT. Coach names/cities stay untranslated; specializations and bios are translated in EN only initially with the keys in place.

## Out of scope

No detail page, no click-through (cards are non-interactive), no API integration, no auth or membership logic, no database tables.

## Technical notes

- Pure frontend: no Supabase, no server functions; all filtering client-side with `useMemo`.
- Photos: no stock portraits — cards use initials avatars in the brand indigo, consistent with the prototype's fallback, with `photoUrl` in the type ready for real ICF Global data.
