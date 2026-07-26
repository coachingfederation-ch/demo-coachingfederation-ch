## Goal
Make the site header work cleanly at 375/390/414px without overlap or horizontal scroll, keeping the current colors, pill styling, and spacing.

## What changes

### 1. Language switcher (compact mode)
- Below `lg`, replace the four-pill DE/FR/IT/EN group with a single pill button showing the active locale plus a small globe/chevron icon, styled exactly like the current active pill (white bg, primary text, rounded-full).
- Tapping opens a small dropdown panel (white, rounded, existing card shadow) listing the other three languages as links to `localizePath(path, l)`, preserving the current `localStorage` write and `hrefLang`.
- At `lg` and above, the existing full pill group stays exactly as it is today.
- Dropdown closes on outside click, Escape, and selection; button gets `aria-expanded` / `aria-haspopup`.

### 2. Mobile nav (hamburger)
- Below `lg` (where the nav pill group is already hidden), add a hamburger button in the same `bg-white/10` rounded-full style.
- It toggles a panel containing the six nav links stacked vertically plus the "Find a Coach" CTA, rendered under the header row inside the hero container so nothing overlaps.
- Active link keeps the current white-pill active treatment. Panel closes on route change and Escape.

### 3. Header row layout
- `SiteHeaderBar` becomes a two-column responsive row (`grid-cols-[minmax(0,1fr)_auto]`, promoted to flex at `sm:`), logo `shrink-0`, controls `shrink-0`, so logo + controls never wrap awkwardly.
- Reduce logo height on mobile (e.g. `h-16` mobile → `h-24`/`h-16` at `sm:` per variant) and tighten container padding from `px-8` to `px-5 sm:px-8` so the row fits at 375px.
- Keep the "Find a Coach" CTA visible on desktop; on mobile it moves into the hamburger panel to free space.

### 4. Translations
Add three keys to `nav` in `common.json` for EN/DE/FR/IT: `menuOpen`, `menuClose`, `languageSwitch` (used for aria-labels only, no visible new copy).

## Verification
Playwright screenshots of `/` and a subpage (e.g. `/find-a-coach`) at 375, 390, 414, 768, and 1280px; assert `document.documentElement.scrollWidth <= clientWidth` at each mobile width and confirm the language dropdown and hamburger panel open/close correctly.

## Technical notes
All work stays in `src/components/site-chrome.tsx` (plus a small local dropdown/menu state) and the four `common.json` files. No route, data, or business-logic changes.
