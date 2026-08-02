# Chapter communities section: use live community data

## What changes

On the For Coaches page, the "Chapter communities" block currently renders a hardcoded list of eight names, statuses and language strings from the translation files. It will instead show the real communities managed in the CMS — the same data the /communities page uses — so the two pages can never drift apart.

The section keeps its place, eyebrow, heading and intro copy. Below it:

- A grid of real community cards (name, short description excerpt, cadence, language chips, volunteer count), each linking to its community detail page.
- Cards are limited to the first six communities so the section stays a teaser, with the existing "Explore communities" link repointed to /communities.
- If no communities are published yet, the grid is omitted and only the heading, intro and link remain — no empty boxes.

## Technical notes

- Extract the existing `CommunityCard` (and its `AvatarStack` + `excerpt` helpers) from `src/pages/Communities.tsx` into `src/components/communities/CommunityCard.tsx`, and import it in both places. No visual change to /communities.
- Rewrite `CommunityGrid` in `src/components/coaches/sections.tsx` to call `listCommunities` via `useQuery` with the `["communities", locale]` key already used elsewhere, so the data is shared from cache.
- Remove `coaches.chapters.items` from the four locale files (en/de/fr/it `coaches.json`); keep the surrounding eyebrow/title/desc/cta strings.
- Repoint the section's CTA from `/about` to `/communities` in `src/pages/ForCoaches.tsx`.
- No backend, schema or RLS changes.

## PR note

**Summary** — Replace the static chapter-communities list on For Coaches with live CMS-managed community data, reusing the community card from /communities.

**Changes**
- UI: new shared `CommunityCard` component; `CommunityGrid` now data-driven; For Coaches CTA points to /communities.
- Content: `coaches.chapters.items` removed from all four locales.

**Backend / schema** — None.

**Testing & verification** — Check /for-coaches and /de/for-coaches render real communities with correct localized text, cards link through to detail pages, /communities is visually unchanged, and the empty state degrades cleanly.

**Risks & rollback** — Low; presentation only. Revert the component and locale edits to restore the static list.

**Follow-ups** — Consider a featured-first ordering if more than six communities are published.
