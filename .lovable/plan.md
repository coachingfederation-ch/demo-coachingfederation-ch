## Goal

Make the public site available in English, German, French and Italian, with each language on its own URL (`/`, `/de`, `/fr`, `/it`, `/de/events`, …), a working language switcher, and translations produced automatically with Lovable AI (no extra API key needed).

## 1. URL and routing

English stays at the root (`/about`), other languages get a prefix (`/de/about`). This is done with one optional route segment rather than duplicating pages.

- Move the five public pages plus the home page under an optional locale segment:
  - `src/routes/{-$locale}/index.tsx`, `about.tsx`, `events.tsx`, `for-coaches.tsx`, `for-organisations.tsx`, `insights.index.tsx`, `insights.$id.tsx`
  - A layout route validates `locale`: if it is not `de`/`fr`/`it`, show a 404; if absent it means English.
- Auth, `/auth/callback` and the whole `/articles` CMS stay English-only and outside this segment.
- All internal `<Link>`s go through a small `useLocalePath()` helper (or a `LocaleLink` wrapper) so navigation keeps the current language.

## 2. Translation content

- One source dictionary of English strings, split per page: `src/i18n/en/{common,home,about,events,coaches,organisations,insights}.json`. Keys are semantic (`home.hero.title`).
- All hardcoded copy in the page components is replaced by `t("…")` lookups from a tiny custom hook (no i18next dependency needed — a typed context + nested-key lookup is ~40 lines and keeps the bundle small).
- **Translations are generated once, at build time, not per request**: a script (`scripts/translate.ts`, run manually via `bun run translate`) sends each English JSON file to Lovable AI and writes `src/i18n/{de,fr,it}/*.json`. The prompt instructs Swiss-market professional tone, keeps ICF terminology fixed ("ICF Switzerland", "Charter Chapter", credential names ACC/PCC/MCC), and preserves placeholders. Output is committed, so the live site does zero AI calls and has no latency or credit cost.
- Missing key in a locale falls back to English automatically.
- Re-running the script after a copy change only re-translates files whose English source hash changed.

## 3. Language switcher

- The existing pill switcher in `site-chrome.tsx` becomes functional: it links to the same route in the target language, preserving path and search params.
- Selected language is derived from the URL (source of truth), not from state; the choice is also stored in `localStorage` so a returning visitor landing on `/` is offered — not forced — their last language.

## 4. Insights / articles interaction

Articles already carry a `language` column. On the public side:
- `/de/insights` lists published articles with `language = 'de'`.
- If a language has no published articles, show the existing empty state with a link to the English list.
- An article detail page whose language differs from the URL prefix redirects to its own language's URL, so `og:` tags and `lang` always match the content.
- No CMS/editor UI changes; the editor stays English.

## 5. SEO

- `<html lang>` set from the active locale.
- Per-route `head()` titles/descriptions come from the translated dictionaries.
- `hreflang` alternate links for all four languages plus `x-default` on every public page, and self-referencing `canonical`/`og:url` per locale.
- `sitemap.xml` extended to emit all four language variants of every public route.

## Technical notes

- Uses TanStack Router optional path params (`{-$locale}`) — no duplicated route files.
- Translation runs through the Lovable AI Gateway with `LOVABLE_API_KEY` (already provisioned); an OpenRouter key is not required.
- Existing layout, styling and components are untouched — only string sources and link construction change.

## Out of scope for this pass

CMS admin UI translation, per-language article authoring workflow (linking DE/FR/IT versions of the same article), and translated event data.
