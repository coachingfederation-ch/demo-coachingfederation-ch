## Goal

Remove every runtime request to Google Fonts (Swiss data-protection requirement) and switch typography to two self-hosted families.

## Font decisions

| Role | Family | Source | Weights |
|---|---|---|---|
| Headings (h1–h6, hero, page titles) | **Nunito Sans** | downloaded once from the Google Fonts repo, converted to WOFF2, committed to the project | variable 400–700 (single file) |
| Body / UI (paragraphs, labels, buttons, nav, inputs) | **Plus Jakarta Sans** | your uploaded variable TTF | variable 200–800 (single file) |

Notes:
- Hoss Round shipped as Regular only, so it can't carry 500/600/700 headings. Per your answer, Nunito Sans replaces it. The uploaded `Hoss_Round_Regular.otf` will not be used — say the word if you'd rather I keep it in the repo for later.
- Both families ship as one variable WOFF2 each (~100 KB total), giving all weights with two requests, both from our own domain.
- The files are downloaded/converted during this task only; the published app loads nothing from Google.

## Implementation

1. Convert both fonts to WOFF2 and place them at `public/fonts/nunito-sans-variable.woff2` and `public/fonts/plus-jakarta-sans-variable.woff2` (served from our origin at `/fonts/...`).
2. In `src/styles.css`, add two `@font-face` blocks using `font-weight: 400 700` / `200 800` ranges, `font-display: swap`, `format("woff2-variations")` with a plain-woff2 fallback.
3. Update the theme tokens:
   - `--font-sans: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`
   - new `--font-heading: "Nunito Sans", system-ui, -apple-system, sans-serif` (registered in `@theme inline` so `font-heading` / `font-display` utilities exist)
   - `Inter` removed entirely.
4. Base layer: `body` → body font; `h1,h2,h3,h4,h5,h6` → heading font (currently only h1–h4 are covered, and they point at the body font).
5. In `src/routes/__root.tsx`, delete the `fonts.googleapis.com` stylesheet `<link>` and both `preconnect` links to Google domains. (These are the only Google Font references in the codebase — no `index.html` or CSS `@import` to clean up.)

## Verification

- Grep the whole repo for `googleapis` / `gstatic` / `Inter` → zero hits.
- Load the preview and confirm via the network log that no request targets a Google domain and that both `/fonts/*.woff2` return 200.
- Screenshot check on Home, Find a coach, a coach profile, Insights and an event page to confirm headings render in Nunito Sans, body in Plus Jakarta Sans, and no layout breakage from the metric change.
- Run the production build.

## Technical detail

Nunito Sans is licensed under the SIL Open Font License, so self-hosting and redistribution in the repo is permitted; I'll include the OFL license file alongside the font. Conversion uses `fonttools` in the sandbox. Tailwind v4 config stays CSS-first in `src/styles.css` — no JS config is introduced.
