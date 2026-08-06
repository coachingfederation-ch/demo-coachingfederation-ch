# Event hero with cover image background and brush marks

## What changes

The event detail hero (the Deep Blue band with the back link, title, summary and the date/time/venue/seats row) currently ignores the event's cover image entirely — the image is fetched but never shown anywhere on the page. This redesign turns that band into a cover: the photo fills the section behind a Deep Blue wash, with two or three hand-drawn ICF brush marks placed as accents.

Content, order and behaviour stay exactly as they are. Nothing below the hero changes.

## The treatment

```text
┌──────────────────────────────────────────────┐
│  [ site header, same Deep Blue ]             │
│                                              │
│  <- All events                        *      │
│                                              │
│  Coaching Perspectives                       │
│  Conference 2026                             │
│  ~~~~~~~~~~ (brush underline, yellow)        │
│                                              │
│  A full-day gathering of coaches ...         │
│                                              │
│  date    time    venue    seats left         │
│                                              │
│    photo, deep-blue washed, full bleed       │
└──────────────────────────────────────────────┘
```

- **With a cover image**: the photo is a full-bleed background, darkened by a Deep Blue overlay that fades from near-solid on the left (behind the text) to lighter on the right, so the image reads as atmosphere and the text keeps full contrast. The band grows a little taller so the photo has room to breathe.
- **Without a cover image**: exactly today's solid Deep Blue band — no empty space, no placeholder.
- **Brush marks**: a small yellow brush underline sitting under the headline, plus one large, very low-opacity circular or asterisk mark bleeding out of a corner. The pair is chosen deterministically from the event slug, so the same event always looks the same rather than reshuffling on every visit. Marks are never placed over the meta row.
- **Photo credit**: when the image carries an Unsplash credit, a small credit line sits at the bottom right of the band, matching how article covers already credit photographers.

## Accessibility and restraint

- The overlay is strong enough that white text over the photo stays above WCAG AA at every breakpoint; on narrow screens it goes near-solid because the text spans the full width.
- Marks are decorative and already hidden from screen readers; at most three, at most the yellow plus one blue tint.
- The photo is decorative and carries no alt text; the event title remains the single H1.
- No motion is added, so there is nothing to gate behind reduced motion.

## Technical notes

- Only `src/pages/EventDetail.tsx` changes, plus one new locale string for the photo credit line in `src/i18n/locales/{en,de,fr,it}/events.json`.
- `image_url`, `image_credit_name` and `image_credit_url` are already selected by `EVENT_COLUMNS` in `src/lib/events.ts`, so no data or backend change is needed.
- The section keeps `bg-hero text-hero-foreground` as its base; the photo and the wash are two absolutely positioned layers inside a `relative isolate` wrapper, so the no-image case is literally the current markup.
- Marks use the existing `<Mark name=... />` component from `src/components/marks.tsx` with the existing `text-mark-*` tokens — no new assets, no new colours.
- Mark choice comes from a small hash of the event slug against a short curated list of mark names, so it is stable across renders and SSR-safe.

## PR note

**Summary** — Show the event cover image as the hero background on the public event detail page and add restrained ICF brush-mark decoration; falls back to today's solid Deep Blue band when an event has no image.

**Changes**
- UI: `src/pages/EventDetail.tsx` hero reworked into layered photo + Deep Blue wash + decorative marks + optional photo credit.
- i18n: photo-credit string added to `events.json` in all four languages.

**Backend / schema changes** — None.

**Testing & verification** — Check an event with a cover image and one without, at mobile and desktop widths; confirm text contrast over the photo, that marks never overlap the meta row, and that the RSVP sidebar and hosts block below are untouched.

**Risks & rollback** — Contained to one section of one public page; revert the file to restore the previous hero.

**Follow-ups** — Event cards in listings still use tinted mark tiles rather than the cover image; aligning those is a separate change.