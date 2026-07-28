## Goal

Give events the same multilingual editorial workflow that articles already have, and upgrade the event image field to match the article editor (manual URL or Unsplash pick, with preview and clear).

## Part 1 — Event translations

### Data model (mirrors `article_translations`)

New table `public.event_translations`, same shape and conventions as the article one:

- `id`, `event_id` (FK → events, on delete cascade), `locale` (`en|de|fr|it`), unique on `(event_id, locale)`
- `title`, `summary`, `description` — the three translatable fields; nothing else (no slug, no URLs, no venue/city)
- `manually_edited boolean`, `source_updated_at`, `created_at`, `updated_at`
- GRANTs: `SELECT` to `anon` + `authenticated`, full CRUD to `authenticated`, `ALL` to `service_role`
- RLS mirroring `article_translations`: anon may read translations only for published events; staff/organizers may write for events they can manage
- Purely additive — no changes to existing `events` rows, no destructive steps

`events.content_updated_at` already exists and is bumped by `tg_events_touch_updated_at` when title/summary/description change, so the existing "needs refresh" staleness signal works out of the box.

**Slug:** stays single and source-language only. Localized routes keep the same slug across locales, so no existing URL changes and no redirect logic is needed.

### Server side

- New `src/lib/event-translations.functions.ts` with `translateEvent({ eventId, locale })`, modelled directly on `translateArticle`: `requireSupabaseAuth` + `assertOrganizer`, Lovable AI Gateway (`google/gemini-3-flash-preview`), same Swiss-locale prompt guidance and ICF proper-noun rules, JSON response, upsert on `(event_id, locale)`.
- Refuses translation when source language equals the target, and when title/summary/description are all empty (server-side guard, same as the profile flow).
- Public read: `getPublicEvent` in `src/lib/events.functions.ts` gains a locale argument and fetches the matching `event_translations` row alongside the `events_public` row, overlaying `title`/`summary`/`description` when present. Same resolution semantics as `getPublishedArticle`: fall back to source language and report `resolvedLocale` so the existing "this content is in another language" notice can be shown.
- `listPublicEvents` overlays translated `title`/`summary` for cards in the active locale, falling back to source text.

### Editor UI

- New `EventTranslationsPanel` in `src/components/cms/`, a close sibling of `TranslationsPanel` (per-locale badge: not translated / needs refresh / up to date / manually edited; Translate / Refresh button; expandable editor for title, summary, description with markdown preview for description; Save marks `manually_edited`).
- Mounted in the sidebar of `src/routes/_staff/manage.events.$id.tsx`, in the same slot the article editor uses.
- When the source-language title/summary/description are all empty, the Translate buttons are disabled with an inline explanatory notice — same pattern and wording style as `ProfileTranslationsPanel`'s `emptySource`.

### Public pages

`src/pages/EventDetail.tsx` and `src/pages/Events.tsx` render whatever the server function resolved; the existing language-notice component is reused when the resolved locale differs from the requested one. Untranslated events behave exactly as today.

## Part 2 — Event image field

Rework only the image block of `manage.events.$id.tsx` to match the article editor:

- Keep the existing manual **Image URL** input (any valid URL, including a pasted Unsplash URL).
- Add a **Choose from Unsplash** button opening the existing `UnsplashPicker`; on pick, it fills `image_url` plus `image_credit_name` / `image_credit_url` (columns already exist on `events`).
- Show a thumbnail preview of the current URL with a **Remove** control that clears the URL and credits, returning to fallback.
- Show a small state label: no image (fallback), custom URL, or Unsplash (credited).
- Broken/invalid URLs degrade gracefully: preview hides on image error; the public pages already guard on `image_url` being present, so the existing fallback rendering is untouched.
- No storage upload, no media library, image stays optional.

## i18n

New CMS keys for the event translations panel and the image-source labels added to `cms.json` in EN, DE, FR and IT, reusing existing key naming (`eventTranslations.*`).

## Out of scope

No payments, ticket tiers, Stripe, auth changes, or broader editor redesign.

## Verification

1. Save an event in its source language; translate to the other three locales; confirm rows and badges.
2. Empty source text → Translate disabled with notice.
3. Hand-edit a translation → badge flips to manually edited; re-translate prompts before overwriting.
4. Visit `/de/events/<slug>`, `/fr/...`, `/it/...` → localized text; an untranslated event still renders source text with the language notice.
5. Save with no image, a pasted URL, and an Unsplash pick; clear it; confirm public list and detail pages in each case.
  &nbsp;

# New Git-Branch

Before starting implementation, confirm this work is on a new branch from current main dedicated to multilingual event content and event image improvements only. If not already on that branch, stop and tell me before making code changes. Or create a new branch to implement those changes. 