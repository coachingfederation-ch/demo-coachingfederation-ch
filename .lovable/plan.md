## Goal
Replace the two placeholder gradient visuals on the home page with the uploaded hand-drawn SVG marks, and shift accent colors to match the marks' palette (cream `#f8f0e4`, indigo `#212251`/`#2b379b`, blue `#5778fa`, yellow `#efcb30`).

## Where the placeholders are
1. **"Coaching in action" cards** — currently `<div className="aspect-[4/3] ... bg-gradient-to-br from-primary/10 via-accent/15 to-accent/30" />`
2. **"Upcoming events" cards** — currently `<div className="flex aspect-[16/10] ... bg-gradient-to-br ...">` with the city name centered.

## Changes

### 1. Add SVG marks as React components
Create `src/components/marks.tsx` exporting inline SVG components for the 10 uploaded marks (`CircularMark01/02`, `Arrow01/02`, `Star01`, `Asterisk01/03`, `Other01/05`, `Line01`). Convert the fixed `fill` colors in each SVG to `fill="currentColor"` so we can theme via `text-*` utilities.

### 2. Coaching in action tiles (4 cards)
Replace the gradient div with a colored tile that centers one mark:
- Card 1 (Future of Work): cream bg (`#f8f0e4`), indigo mark → `CircularMark01`
- Card 2 (Leadership): indigo bg → cream `Star01`
- Card 3 (AI & Coaching): yellow bg (`#efcb30`) → indigo `Asterisk01`
- Card 4 (Diversity): blue bg (`#5778fa`) → cream `CircularMark02`

Each mark rendered ~40–50% of tile height, centered, `aspect-[4/3]`.

### 3. Upcoming events tiles (3 cards)
Replace gradient + city text with mark-on-color tile; keep city name in the card body only:
- Event 1 (Zürich): cream bg, indigo `Arrow01`
- Event 2 (Online): indigo bg, yellow `Asterisk03`
- Event 3 (Lausanne): yellow bg, indigo `Arrow02`

### 4. Palette tokens (styles.css)
Add mark palette as CSS variables and Tailwind color tokens so tiles use semantic classes, not raw hex:
- `--mark-cream: oklch(...)` (#f8f0e4)
- `--mark-indigo: oklch(...)` (#212251)
- `--mark-blue: oklch(...)` (#5778fa)
- `--mark-yellow: oklch(...)` (#efcb30)

Register in `@theme inline` as `--color-mark-cream`, etc., enabling `bg-mark-cream`, `text-mark-indigo`, etc.

### 5. Leave the rest of the design alone
Hero, pillars, communities, organisations, join, footer, typography and existing indigo/teal tokens stay unchanged — only the two tile groups get the new marks + colors.

## Files touched
- `src/components/marks.tsx` (new)
- `src/styles.css` (add mark palette tokens)
- `src/routes/index.tsx` (replace two placeholder tile groups)
