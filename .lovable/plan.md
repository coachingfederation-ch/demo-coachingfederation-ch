## Goal

Rename the organisation everywhere in the codebase: **"ICF Switzerland" → "The Switzerland Chapter of ICF"**, in English across all four locales, with Charter-Chapter variants collapsed to the new name.

## Scope confirmed by search

190 occurrences across 70 files:
- `src/i18n/locales/{en,de,fr,it}/*.json` — home, about, common, coaches, organisations, insights, directory, cms, legal (bulk of the copy). The name never appears as a JSON key, only as values — verified.
- `src/pages/` — Imprint.tsx (4), Privacy.tsx (4), plus other pages.
- `src/routes/` — `__root.tsx` (title/description/og), staff routes, auth, claim, staff-sign-in, no-access, OAuth consent meta titles.
- `src/components/site-chrome.tsx` (footer copyright), `src/components/member/MemberShell.tsx`.
- `src/lib/mcp/index.ts`, `src/lib/mcp/tools/search-coaches.ts`, `src/lib/member-claim.server.ts`.
- `scripts/translate.ts` — AI-translation glossary that currently tells the model to preserve "ICF Switzerland" and "Charter Chapter" untranslated; the glossary term is updated to the new name so future AI translations stay consistent.
- `README.md`.
- No occurrences in `supabase/migrations`, `docs/`, `public/`, or seed data — nothing to change there.

## Replacement rules

1. `ICF Switzerland — Charter Chapter` / `ICF Switzerland · Charter Chapter` / `ICF Switzerland Charter Chapter` / `ICF Switzerland - Charter Chapter` → `The Switzerland Chapter of ICF` (suffix collapsed, no "Chapter … Chapter" duplication).
2. Remaining `ICF Switzerland` → `The Switzerland Chapter of ICF`.
3. Untouched: `coachingfederation.ch`, all URLs/slugs/route names, image filenames such as `ICF_SwitzerlandCharterChapter_Vertical_RGB_Negative.png`, and every reference to "ICF Global" / "International Coaching Federation".

## Grammar pass after the mechanical replace

The new name starts with "The", so a manual read-through of the changed strings follows the replace, fixing:
- Mid-sentence article stacking, e.g. `bei ICF Switzerland` → `bei The Switzerland Chapter of ICF` reads awkwardly in DE/FR/IT; these get minimal preposition/article cleanup so each sentence still reads naturally in its own language while keeping the brand name in English.
- Sentence-initial occurrences keep the capital "The"; mid-sentence occurrences also keep capital "The" since it is part of the proper name.
- Titles/eyebrows/headings keep their existing case and separators (for example `The Switzerland Chapter of ICF | Verband für professionelles Coaching`).

## Verification

- Confirm zero remaining `ICF Switzerland` matches outside asset filenames.
- TypeScript check plus dev build, and a JSON parse check on all locale files so no dictionary is broken.
- Headless browser pass over `/`, `/de`, `/fr`, `/it`, `/about`, `/imprint` checking header, hero, footer copyright and `<title>`.
- Report a per-file table of replacement counts.

## Note

Project knowledge already lists the new name as canonical, so no memory update is needed beyond the rename itself.
