## Goal
Replace the headline typeface Nunito Sans with Quicksand (self-hosted **variable** font, default weight 600) and tighter letter-spacing. Body typography (Plus Jakarta Sans) stays untouched. No layout changes.

## Steps

1. **Fetch and convert the font**
   - Download the Quicksand variable font (OFL, weight axis 300–700) from the Google Fonts release, convert to WOFF2, save as `public/fonts/quicksand-variable.woff2`.
   - Add `Quicksand-OFL.txt` alongside it, matching the existing license-file convention.

2. **Remove Nunito**
   - Delete `public/fonts/nunito-sans-variable.woff2` and `public/fonts/NunitoSans-OFL.txt`.
   - Remove the Nunito `@font-face` block from `src/styles.css`.
   - Swap the Nunito preload `<link>` in `src/routes/__root.tsx` for the Quicksand one.

3. **Add Quicksand `@font-face`** in `src/styles.css`: `font-family: "Quicksand"`, `font-weight: 300 700`, `font-display: swap`, keeping the "no external font CDN" comment convention.

4. **Theme mapping** in `@theme inline`:
   - `--font-heading` and `--font-display` → `"Quicksand", system-ui, -apple-system, sans-serif`.
   - Body/sans tokens unchanged.

5. **Heading defaults** — extend the existing base rule that already targets `h1–h6`:
   - `font-family: var(--font-heading)` (already present)
   - `font-weight: 600` as the default heading weight (headings that explicitly set `font-bold` keep 700 — real weights, not synthetic, since we ship the variable font)
   - `letter-spacing: -0.05em`, replacing the current `-0.02em`
   
   Applying this in the one base rule keeps the change global, avoids touching component files, and covers hero text and section headings automatically.

6. **Content note**: `src/pages/Privacy.tsx` names the self-hosted fonts in the data-protection text — update "Nunito Sans" to "Quicksand" so the statement stays accurate.

## Verification
- Preview screenshots of `/`, `/about`, `/find-a-coach`: headings render in Quicksand with tighter tracking; body copy still Plus Jakarta Sans.
- Confirm computed `font-family` on an `h1` and a `p` in the live preview.
- Confirm zero network requests to `fonts.googleapis.com` / `fonts.gstatic.com`.
- Close-up check of smaller headings (h4/h5/h6) at -0.05em, and report back if they look cramped so you can decide on loosening.

## Note
The `eyebrow` / `section-label` utilities keep their existing wide positive tracking — they're small-caps labels, not headlines.
