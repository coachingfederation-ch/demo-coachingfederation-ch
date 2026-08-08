# Manual brush-mark placement on the LinkedIn visual

Yes — the card is rendered as normal DOM before it is rasterised, so marks can be positioned and sized by hand instead of only chosen from fixed compositions.

## What the publisher gets

A small brush palette above the preview with **five marks**, each a distinct visual role:

```text
Circle sweep   — encircles or frames a corner (CircularMark02)
Arrow          — directional gesture (Arrow02)
Asterisk       — small emphasis burst (Asterisk02)
Star           — celebratory accent (Star01)
Highlight bar  — wide horizontal stroke (TextHighlighMark02)
```

Click a brush to add it to the canvas. Once on the canvas a mark can be:

- **Moved** — drag it anywhere inside the frame (snaps to a 46px safe margin so nothing is clipped).
- **Resized** — drag the corner handle; size is clamped between 160px and 520px so marks never look thin or dwarf the headline.
- **Recoloured** — cycle Blue / Light Blue / Yellow with a small swatch row on the selected mark.
- **Removed** — delete key or an X on the selected mark.

Guardrails kept from the current design: max three marks per card, only the three brand accent colours, and a warning chip if a mark overlaps the headline area (it still allows it — the publisher decides).

The existing **Brush marks / Feature image** toggle stays. "Shuffle marks" becomes **"Suggest layout"**, which drops a curated golden-ratio composition onto the canvas that can then be nudged by hand. Reset returns to the suggested layout.

Selection handles and the safe-margin guide are editor-only chrome — they are hidden during rasterisation, so the posted PNG is exactly the artwork.

## Persistence

The placement is saved with the post record so re-opening the dialog for the same article restores the last layout instead of starting over. This needs one new nullable `jsonb` column on `article_linkedin_posts` (`mark_layout`); no other schema change.

## Technical notes

- `src/lib/linkedin-visuals.ts` — add `BRUSH_PALETTE` (the five marks) and a `PlacedMark` type (`{ id, name, xPct, yPct, sizePct, color }`), stored in percentages so preview (scaled 0.5) and the full-size raster agree exactly. Keep the curated compositions as the "Suggest layout" source, expressed in the same percentage shape.
- `src/components/cms/LinkedInCard.tsx` — render from a `marks: PlacedMark[]` prop instead of a `variant` index; no editor chrome inside the card.
- New `src/components/cms/LinkedInMarkEditor.tsx` — the interactive overlay (palette, drag, resize handle, colour swatches, delete), rendered on top of the scaled preview only. Pointer events with pointer capture; no drag library.
- `src/components/cms/LinkedInShareCard.tsx` — owns `marks` state, passes it to both the preview and the off-screen raster node.
- `src/lib/linkedin.functions.ts` / `linkedin.server.ts` — accept and store `markLayout`; return it in the draft payload.
- Migration: `alter table public.article_linkedin_posts add column mark_layout jsonb;` (existing grants unchanged).
- `src/i18n/locales/{de,fr,it,en}/cms.json` — palette, suggest-layout, reset, colour and delete labels.

## PR note

**Summary** — Lets a publisher place, size, colour and delete brush marks directly on the LinkedIn visual, replacing fixed-only compositions with a hand-editable canvas seeded by a curated golden-ratio layout.

**Changes** — Brush palette and placed-mark model; interactive drag/resize overlay in the share dialog; card renders from placement data; layout persisted per article; new CMS strings in four languages.

**Backend / Schema** — One additive nullable `jsonb` column, `article_linkedin_posts.mark_layout`. No policy or grant change.

**Testing & Verification** — Place each of the five brushes, drag to edges (clamped), resize to both limits, recolour, delete; confirm the rasterised PNG matches the preview 1:1 at 1200x742; confirm feature-image mode still hides marks; confirm reopening restores the saved layout; confirm publishing still works with zero marks.

**Risks & Rollback** — Contained to the LinkedIn share feature. Revert the touched files; the extra column is harmless if left in place.

**Follow-ups** — Optional later: rotation handle, and per-article layout reuse across repeat posts.
