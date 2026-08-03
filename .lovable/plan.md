# Ad tiles with images — "Architectural premium" direction

Rebuild the six sponsor tiles in the homepage advertisement carousel so each one carries a generated partner image at the top, the yellow "Ad" badge over that image, and the existing text block underneath.

## What changes visually

Every tile becomes a single Deep Blue card (no more rotating bone/white/blue surfaces), 21rem wide, with:

```text
┌──────────────────────────────┐
│  partner image        [ AD ] │  image band, ~12rem, fades into
│  (fades into deep blue)      │  the card at the bottom
├──────────────────────────────┤
│  — STRATEGIC PARTNER         │  short light-blue rule + eyebrow
│  Partner name                │  Quicksand, white
│  One-line claim.             │  bone at 70%
│                              │
│  Learn more            (→)   │  underline grows on hover,
└──────────────────────────────┘  circular arrow button
```

- Card: Deep Blue `bg-hero`, `rounded-3xl`, soft deep-blue shadow, hairline white border.
- Image: subtle zoom on hover, with a top-to-bottom Deep Blue gradient so the photo dissolves into the card instead of ending on a hard edge.
- "Ad" badge: Yellow chip with Deep Blue text, top-right over the image. Yellow on Deep Blue is the one permitted yellow pairing in the brand rules.
- Eyebrow: Light Blue, uppercase, preceded by a short 16px Light Blue rule.
- "Learn more": white text with a Light Blue underline that grows on hover, plus a bordered circular arrow. Yellow is kept for the badge only, so the tile stays blue-led.
- All tiles equal height; the marquee loop, hover-pause, reduced-motion fallback and edge fade stay exactly as they are.

## Images

Six images generated into `src/assets/ads/` (one per demo partner), 800x450, warm natural light, human-centred and Swiss in feel, matched to each partner's category:

1. Alpine Supervision Collective — small peer circle in conversation, mountain light
2. Lakeside Coaching Press — open notebooks and printed material on a desk by a window
3. Vertex Assessment Group — two people reviewing charts on a screen together
4. Bern Practice Studio — a calm home-office desk with paperwork
5. Terra Retreats Ticino — a quiet seminar room opening onto greenery
6. Genève Mentoring Guild — a one-to-one mentoring conversation

These are demo placements, so the images stay decorative: `alt=""` plus `loading="lazy"`, with the partner name carrying the meaning. The section subtitle already states the content is a demo; it will also note the imagery is AI generated.

## Technical notes

- `src/components/home/SponsorMarquee.tsx`: drop the three-surface rotation and the `Mark` decoration, add an `image` field to `SponsorItem`, render the image band, badge, gradient and new action row. Colours stay on semantic tokens (`bg-hero`, `text-hero-foreground`, `text-accent`, `bg-accent`, `text-mark-cream`) — no hex literals.
- `src/pages/Home.tsx`: map the six generated image imports onto the localized `home.ads.items` by index and pass them into the marquee; section surface stays `bg-card` with its top border.
- Locale files: only the `home.ads.subtitle` string changes in `en`, `de`, `fr`, `it` to mention AI-generated demo imagery. No new keys.
- No backend, data or route changes.

## PR note

**Summary** — Redesigns the homepage advertisement carousel tiles to the chosen "Architectural premium" direction: Deep Blue card, generated partner image with a yellow Ad badge, and the existing category/name/claim/CTA text below.

**Changes**
- UI: `SponsorMarquee.tsx` rewritten card layout (image band, badge, gradient, action row, uniform Deep Blue surface).
- UI: `Home.tsx` wires six image imports into the ad items.
- Assets: six new images under `src/assets/ads/`.
- Content: `home.ads.subtitle` updated in all four locales to disclose AI-generated imagery.

**Backend / schema changes** — None.

**Testing & verification** — Visual check of the section at desktop and mobile widths, contrast check of Light Blue eyebrow, bone claim text and yellow badge against Deep Blue for WCAG AA, confirmation that the loop still animates, pauses on hover/focus, and falls back to a scrollable row under reduced motion.

**Risks & rollback** — Contained to one homepage section; revert the three files and delete the assets to roll back.

**Follow-ups / known debt** — Sponsors remain hardcoded demo content; a CMS-managed ad slot (image upload, target URL, run dates) is the natural next step.
