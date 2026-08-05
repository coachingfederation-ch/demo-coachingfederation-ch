# Article byline + social sharing

Make the article meta line on `/insights/:id` more visible and add sharing to LinkedIn, X and email.

## What changes

**1. Author block, share right**

The current thin mono line ("28 Jul 2026 · Hartmuth") is replaced by a proper meta row under the headline:

- Left: author name in body-weight foreground text, with date and category beneath it in small muted mono.
- Right (same row): three round, outlined icon buttons — LinkedIn, X, email.
- A hairline rule below the row separates meta from the hero image.
- On mobile the share buttons wrap to their own line under the author block.

```text
CHAPTER NEWS
ICFS President's Message - July
------------------------------------------------------
 Hartmuth Koch                        ( in ) ( X ) ( @ )
 28 Jul 2026 · Chapter news
------------------------------------------------------
```

**2. Share block repeated at article end**

After the last paragraph, a stronger closing share block on a raised card surface: a short prompt ("Share this article"), the same three actions rendered larger with visible labels, plus a "Copy link" action.

**3. Author full name**

The byline already composes the full name from the author profile — this article shows only "Hartmuth" because that profile has no last name stored. Nothing to change in code; the last name needs to be filled in on that account.

## Behaviour

- LinkedIn: `linkedin.com/sharing/share-offsite/?url=…`
- X: `x.com/intent/post?url=…&text=<article title>`
- Email: `mailto:?subject=<title>&body=<title + url>`, with `target="_top"` so it hands off to the local mail client, consistent with existing mailto handling across the site.
- The shared URL is the canonical, locale-aware article URL (`SITE_URL` + localized `/insights/:id`), built the same way the head tags already build it — so DE/FR/IT readers share their language edition.
- LinkedIn and X open in a new tab with `rel="noopener noreferrer"`.

## Design and accessibility

- Tokens only: outlined buttons use `border-border`, text `foreground`/`muted-foreground`, hover fill `secondary`; the closing block sits on `bg-card` with a hairline border. No new colours.
- Icons from `lucide-react` (`Linkedin`, `Mail`, `Link2`); X uses a small inline SVG since lucide has no X glyph.
- Every button gets an `aria-label`, visible focus ring, and a touch target of at least 44px.
- All new copy added to `insights.json` in EN, DE, FR and IT (`share.title`, `share.linkedin`, `share.x`, `share.email`, `share.copy`, `share.copied`).

## Technical notes

- New `src/components/share-buttons.tsx` exporting an `inline` and a `block` variant, taking `{ url, title }`.
- `src/pages/InsightDetail.tsx`: replace the current byline paragraph with the meta row, and add the closing block after the `Markdown` body.
- Share URL derived from `useI18n()` locale plus `localizePath` and `SITE_URL` from `@/i18n/config`; guard the copy action behind `navigator.clipboard` availability.
- No backend, schema or route changes.

## PR note

- **Summary** — Rework the article byline into a visible author + share meta row and add LinkedIn / X / email sharing, repeated as a closing block.
- **Changes** — UI: new `share-buttons.tsx`, revised `InsightDetail.tsx` header and footer; i18n: new `share.*` keys in four locales.
- **Backend / schema changes** — None.
- **Testing & verification** — Article page at desktop and mobile widths; share targets checked for all four locales; mailto handoff verified; keyboard focus order and labels checked.
- **Risks & rollback** — Presentation only, limited to the article detail page; revert the two files and the i18n keys.
- **Follow-ups / known debt** — Author profiles missing a last name still render a partial byline; consider requiring last name in the profile editor.