# Imprint & Privacy Policy pages

## Goal

Publish two new public legal pages — `/imprint` and `/privacy` — designed with the existing ICF Switzerland design system. Each page renders the provided English draft content, shows a visible "draft pending legal review" banner, and is immediately linked from the site footer. Only English copy is created for this iteration; other locales fall back to English.

## Structure

- Two TanStack Start routes:
  - `src/routes/imprint.tsx` (English, canonical)
  - `src/routes/privacy.tsx` (English, canonical)
  - `src/routes/$locale/imprint.tsx` (localized shell for `de`, `fr`, `it` — English fallback copy)
  - `src/routes/$locale/privacy.tsx` (localized shell for `de`, `fr`, `it` — English fallback copy)
- Two page components:
  - `src/pages/Imprint.tsx`
  - `src/pages/Privacy.tsx`
- Shared long-form layout shell in `src/pages/LegalPageShell.tsx` to keep both pages visually consistent.
- New i18n namespace: `src/i18n/locales/en/legal.json` for page titles, descriptions, draft banner, and navigation labels.
- Update `src/components/site-chrome.tsx` so the footer "Privacy" and "Imprint" links are active `LocaleLink`s instead of disabled spans.

## Content approach

- Convert the provided Markdown draft into accessible, semantic JSX.
- Strip the internal `[!info]` and `[Confirm:]` editorial markers; keep all substantive legal text.
- Remove the "Appendix: Items to confirm before publishing" section (it is for internal review only).
- Preserve all headings, paragraphs, lists, tables, and contact links.
- Keep the final "Last updated" line but with a placeholder date (e.g., "Last updated: [Date of publication]").
- Add a prominent draft banner at the top of each page explaining the content is pending legal review and not yet binding.

## Design treatment

- Reuse `CompactHero` and `SiteFooter` from `src/components/site-chrome.tsx` for header/hero/footer continuity.
- Hero eyebrow: "Legal" / "Privacy"; title: "Imprint" / "Privacy Policy".
- Main content uses a centered, narrow reading column (`max-w-3xl` or `max-w-4xl`) with generous vertical spacing and clear typographic hierarchy.
- Use existing tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border/70`, `bg-card`, `CARD_SHADOW`, `font-heading` for headings, `font-body` for body text.
- Tables for data categories and retention periods rendered as simple, responsive cards on small screens or horizontal-scroll tables.
- Privacy page: optional sticky section anchors ("Who is responsible?", "What data do we process?", "Your rights", etc.) for easier navigation in a long document.
- Draft banner: a full-width band below the hero using a soft warning/notice token (`bg-warn-soft` / `text-warn` or muted tone) with an info icon.

## SEO / metadata

- Each route defines `head()` with route-specific `title`, `description`, `og:title`, `og:description`, `og:type`, `twitter:card`, and `localeLinkTags` for hreflang/canonical links.
- No `og:image` (the site has no absolute legal page cover image; relying on platform default is acceptable).
- JSON keys:
  - `imprint.meta.title` / `imprint.meta.description`
  - `privacy.meta.title` / `privacy.meta.description`

## i18n additions

- Add `legal` namespace to `src/i18n/locales/en/legal.json` with:
  - `imprint.meta.title`, `imprint.meta.description`
  - `privacy.meta.title`, `privacy.meta.description`
  - `draftBanner.title`, `draftBanner.body`
  - `nav.imprint`, `nav.privacy` (optional, if needed for footer labels)
- No `de`/`fr`/`it` translations yet; the existing fallback system will use English.

## Footer changes

- In `src/components/site-chrome.tsx`, replace the disabled `Privacy` and `Imprint` spans with `LocaleLink` components pointing to `/privacy` and `/imprint`.
- Keep the external "Code of Ethics" link as an `<a>` with `target="_blank"`.

## Verification

- Build passes with no route-tree mismatch.
- Check both pages render and footer links navigate correctly.
- Run an accessibility scan (axe) on both pages to confirm no contrast or heading-order issues.
- Confirm no external font/network regressions from the typography change.

## Out of scope

- No cookie-consent banner or consent management UI in this iteration.
- No final legal review or translation into DE/FR/IT.
- No backend/CMS storage for legal content; pages remain static components.
- No dynamic "last updated" date; placeholder is left for legal team to finalize.