# Europe Pulse: keep the last 4 editions, add edition navigation

Today the page only ever shows the newest week, and older items are invisible.
This adds a small archive: the four most recent weekly editions, with a compact
navigation to step back and forth between them.

## What the user sees

- Under the week/summary line, a slim edition switcher: "This week" plus up to
  three earlier dates (e.g. "27 Jul", "20 Jul", "13 Jul"), the active one
  highlighted. Plus previous/next chevrons for keyboard and mobile use.
- The URL carries the selection (`/europe-pulse?week=2026-07-20`), so an
  edition can be shared and the browser back button works.
- Only the last 4 editions are reachable; anything older stays as archive data,
  not linked from the page.

## Content rule for past editions

The current feed hides items whose date has passed. That rule stays for the
current edition. For a past edition, hiding past items would leave an empty
page, so an archived edition shows every published item curated that week,
exactly as it was. A short line marks archived editions as a past digest.

## Technical notes

- `src/lib/europe-pulse.functions.ts` — `listEuropePulse` gains an optional
  `week` input and returns `{ weekOf, weeks, items, isCurrent }`. It first
  resolves the 4 most recent distinct published `week_of` values, then loads
  items for the requested week (defaulting to the newest). The
  `event_date >= today` filter applies only when the requested week is the
  newest one; otherwise all published items of that week are returned, ordered
  by `sort_rank` then `event_date`.
- `src/routes/europe-pulse.tsx` and `src/routes/$locale/europe-pulse.tsx` —
  add `validateSearch` with `week: fallback(z.string(), "").default("")` via
  `@tanstack/zod-adapter`, plus `stripSearchParams` so the default stays out of
  the URL.
- `src/pages/EuropePulse.tsx` — read `week` via `useSearch({ strict: false })`
  so one page component serves both routes, include it in the React Query key,
  and render the switcher as `<Link>`s with
  `search={(prev) => ({ ...prev, week })}`. Existing card/skeleton/empty markup
  is untouched; the switcher reuses the existing chip styling and the
  three-surface rhythm.
- `src/i18n/locales/{en,de,fr,it}/europe-pulse.json` — new keys:
  `archive.label`, `archive.current`, `archive.previous`, `archive.next`,
  `archive.note`. EN written by hand, the other three via `scripts/translate.ts`.
- No schema, RLS or scan-engine changes; the rows already exist.

## PR note

**Summary** — Europe Pulse becomes a small archive: the four most recent weekly
editions are readable from the public page through a compact, URL-driven
edition switcher.

**Changes**
- UI: edition switcher on `/europe-pulse` and its three locale mirrors;
  archived-edition note.
- Data: `listEuropePulse` accepts a week and returns the list of recent weeks;
  future-only filtering now applies to the current edition only.
- i18n: five new keys in four locales.

**Backend / schema changes** — None.

**Testing & verification** — Current edition unchanged; each older edition
loads its own items; a `week` value outside the last four falls back to the
newest edition; deep link and back button verified; checked in all four locales
and at mobile width.

**Risks & rollback** — Contained to one page and one read function; reverting
the two files restores present behaviour. Risk is a past edition rendering
empty if a week has no published rows — such weeks are simply not listed.

**Follow-ups / known debt** — No pagination beyond four editions; a fuller
archive index would be a separate page.