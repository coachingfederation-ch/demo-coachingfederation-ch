Restyle the ICF Switzerland homepage using the design tokens from the ICFS Goal Tracker project. Only tokens and typography change — layout, copy, imagery, and component structure stay as they are.

## Design system swap (src/styles.css)

Replace current tokens with the Goal Tracker palette:

- Radius: `0.75rem` (up from `0.625rem`)
- Background: soft lavender `oklch(0.975 0.012 285)`
- Foreground: deep indigo ink `oklch(0.18 0.06 275)`
- Card: pure white
- Muted / muted-foreground: `oklch(0.96 0.01 285)` / `oklch(0.48 0.04 275)`
- Border / input / ring: soft indigo-lavender borders, indigo ring
- Primary (brand indigo `#2B379B`): `oklch(0.31 0.16 275)`
- Accent (teal `#00ABC8`): `oklch(0.72 0.13 210)`
- Add tokens: `--hero`, `--hero-foreground`, `--pillar-sg` (teal), `--pillar-oe`/`--pillar-ce` (indigo), `--chip`, `--chip-foreground`, `--chip-active-border`
- Register the new tokens in `@theme inline` as `--color-hero`, `--color-pillar-*`, `--color-chip*`
- Drop the project-specific extras I added earlier (`--brand`, `--brand-cyan`, `--brand-soft`, `--surface`, `--surface-2`); map their usages to the new palette

## Typography

- Single font family: Inter (sans) for headings and body — no serif display
- Update the Google Fonts `<link>` in `src/routes/__root.tsx` to load Inter only, drop Fraunces
- Remove `--font-display` and `font-display` heading rule; tighten letter-spacing to `-0.02em` on h1–h4

## Component color updates (src/routes/index.tsx)

Rename Tailwind color utilities to the new tokens without changing layout:

- `bg-brand` → `bg-primary`; `text-brand` → `text-primary`; `border-brand` → `border-primary`
- `text-brand-cyan` → `text-accent`; `bg-brand-cyan/…` gradients → `bg-accent/…`
- `bg-brand-soft` (pillar badge) → `bg-accent/15`
- `bg-surface` / `bg-surface-2` → `bg-muted`
- Remove `font-display` class usages (Inter is the only family now)
- Hero emphasis `<em>` and section labels use `text-primary`
- "For Organisations" and "Join" dark bands use `bg-primary` (was `bg-brand`); inner button `text-brand` → `text-primary`

## Head metadata

No content changes — titles/descriptions stay as set previously.

## Verification

After edits, load `/` via Playwright at 1440px, take screenshots at hero, pillars, organisations band, events, why-coaching, and footer to confirm the indigo/teal on lavender palette lands cleanly and nothing regressed to the old cream/purple look.
