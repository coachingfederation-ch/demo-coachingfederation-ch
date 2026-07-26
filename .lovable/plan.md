# Accessibility audit — ICF Switzerland site

Reviewed the site chrome, all public pages, the coach directory, the organisations deck/survey, insights, and the CMS editor against WCAG 2.2.

Good news first: every page has exactly one `<main>`, `<html lang>` is set per locale, headings run h1 → h2 → h3 without skips, decorative hand-drawn marks are `aria-hidden`, the mobile menu and compact language switcher expose `aria-expanded` / `Escape`, and the coach filter selects and search have real `<label htmlFor>`.

## Critical (blocks users) — 5

1. **No skip link** (2.4.1). Keyboard users traverse the full header on every page. `src/components/site-chrome.tsx`, plus an `id="main"` on each page's `<main>`.
2. **Newsletter email fields have no label** — placeholder only (1.3.1, 3.3.2, 4.1.2). `src/pages/Home.tsx:373`, `src/pages/Insights.tsx:239`. Screen readers announce "edit text, blank".
3. **Insights topic filter buttons** carry no `aria-pressed` and no `type="button"` (4.1.2) — selected topic is conveyed by colour only (1.4.1). `src/pages/Insights.tsx:148`.
4. **Survey answer buttons and progress bar** — scale options lack `aria-pressed`, the progress bar is a bare div with no `role="progressbar"` / value attributes (1.3.1, 4.1.2). `src/components/organisations/CultureSurvey.tsx`.
5. **Filtered result count is never announced** (4.1.3). Changing a coach filter silently swaps the grid. `src/components/coaches/directory.tsx`.

## Warning (degrades experience) — 6

6. **No visible focus indicator on custom controls** (2.4.7, 2.4.13). Pills, chips, nav links and inputs use `outline-none` with hover/`focus:border` only. Needs a token-based `focus-visible:ring-2 focus-visible:ring-ring` treatment across site-chrome, directory chips, insights topics, survey buttons, deck controls.
7. **Tab patterns are not keyboard-complete** (2.1.1 / ARIA APG). `LearningTabs` (`src/components/coaches/sections.tsx`) and the deck dot `role="tablist"` (`DeckSection.tsx`) need roving `tabIndex` and Arrow/Home/End handling, or should drop the tab roles.
8. **Language dropdown uses `role="menu"`/`menuitem` on plain links** (4.1.2) — role mismatch with no arrow-key/focus management. Simplest correct fix: drop the menu roles and render a labelled list of links, keeping the existing Escape/outside-click behaviour.
9. **Contrast on the indigo hero panels** (1.4.3). `placeholder:text-white/60` and `text-white/75` need measuring against `--hero`; bump to `/70` and `/85` if they fall under 4.5:1.
10. **Target size 24×24 minimum** (2.5.8, new in 2.2). Desktop language pills sit at exactly 24px and mobile chips at 32px with tight gaps — verify spacing so no target's exclusion zone overlaps; raise chips to `min-h-11` on touch widths.
11. **`min-h-screen` instead of `min-h-dvh`** on every page wrapper — content clipped behind mobile browser chrome.

## Info (best practice) — 3

12. Image alt text duplicates the adjacent heading (article cards `alt={article.title}`, coach photos `alt={icf.fullName}`) — these are decorative in context and should use `alt=""`.
13. Card grids (audiences, communities, events, coach results) are `<div>` collections; semantic `<ul>/<li>` gives screen readers item counts.
14. Deck slide region uses `aria-live="polite"` on the whole slide — verbose on every navigation; a concise "Slide 3 of 12" status is better.

## Fix plan

Work in this order, each step verified in the preview:

1. Skip link + `id="main"` on all page `<main>` elements, with a localized "Skip to content" string added to `common.json` for EN/DE/FR/IT.
2. Labels for the two newsletter inputs (visually hidden `<label>`), plus `autoComplete="email"`.
3. `aria-pressed` + `type="button"` on insights topics and survey scale options; `role="progressbar"` with `aria-valuenow/min/max` on both progress bars.
4. `role="status" aria-live="polite"` wrapper around the coach directory result count.
5. Shared focus-visible ring utility applied to every custom interactive class string (no visual change at rest).
6. Roving tabindex + arrow-key handling for `LearningTabs` and deck dots.
7. De-`role`-ify the language dropdown; keep it a labelled link list.
8. Contrast bumps on hero white-opacity text; `min-h-dvh` swap; touch target sizing.
9. `alt=""` on decorative card/portrait images; semantic lists for the main card grids.

### Technical notes

No routing, data, or publishing logic changes — all edits are presentation-layer. New copy strings go through the existing i18n dictionaries so DE/FR/IT stay in sync. Verification via Playwright at 375px and 1280px, keyboard-only tab traversal of the homepage, coach directory, and organisations survey, plus a contrast measurement of the hero text tokens.
