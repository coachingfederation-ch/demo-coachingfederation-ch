## Plan

Replace the body content of `src/pages/Privacy.tsx` with the combined Imprint & Privacy Policy draft you provided, while keeping the existing "Privacy Policy" hero and leaving the separate `/imprint` route unchanged.

## Changes

1. **Rewrite `src/pages/Privacy.tsx` body content**
   - Replace the current Privacy-only sections with the full combined draft: front-matter status block, Imprint (Page 1), and Privacy Policy (Page 2 through the Appendix).
   - Keep the existing `LegalPageShell` wrapper with `pageKey="privacy"` so the header and footer remain unchanged.

2. **Apply project naming convention**
   - Replace all occurrences of `International Coach Federation (ICF) Switzerland` and `ICF Switzerland` with `The Switzerland Chapter of ICF` throughout the page copy.
   - Avoid duplicating "Chapter" when the text already contains it.

3. **Convert the draft Markdown to project JSX components**
   - Use existing `h2`/`h3` headings and `text-foreground/80` paragraph/list styling.
   - Reuse the existing `Table` helper for tables (purposes, recipients/transfer safeguards, retention, cookies).
   - Convert `[!info]` callouts into styled info boxes (e.g., a muted card with an info icon) so they remain visually distinct but still read as draft review notes.
   - Convert blockquotes (`>`) into styled callouts.
   - Preserve all external links with `target="_blank" rel="noopener noreferrer"` and `text-primary` underline styling.
   - Preserve `mailto:` links for `office@coachingfederation.ch`.

4. **Correct out-of-date references from the draft**
   - Replace "Nunito for headlines" with "Quicksand for headlines" to match the current typography.
   - Ensure the self-hosted font statement references Plus Jakarta Sans body text correctly.

5. **Do not touch**
   - `src/pages/Imprint.tsx` and `/imprint` route.
   - `LegalPageShell` or the `legal.json` i18n hero text.
   - Route/head meta for `/privacy` (kept as existing "Privacy Policy").

## Verification

- Run a typecheck/build to confirm the file compiles.
- Verify the page renders correctly at `/privacy` in the preview, with headings, tables, lists, and info callouts displaying in the current lavender/indigo design system.
- Confirm no broken links and that all external links open in a new window.