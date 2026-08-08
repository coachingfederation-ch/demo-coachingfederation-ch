# LinkedIn post preview: better marks, right dimensions, four-language text

## 1. Brush marks that actually read

Today the card always draws the same two marks (`circular2` + `star2`) at fixed spots, and one of them is cropped by the card edge — that is the "incomplete / too small" effect.

Change:
- Build a small set of hand-picked mark **compositions** (e.g. large circular sweep + asterisk, arrow + thin stroke, star cluster, highlight bar + line) instead of one hardcoded pair.
- Pick the composition deterministically from the article id, so each article gets a different look but the same article always renders the same visual (the preview matches what gets posted, and re-opening the dialog does not reshuffle).
- Placement rules so nothing is clipped or hairline-thin: marks sit fully inside the frame with a safe margin, minimum size roughly a quarter of the card height, at most two marks per card, colours limited to Blue `#2B379B` / Light Blue `#5778FA` / Yellow `#EFCB30` on the Deep Blue field.
- The accent line under the headline stays but rotates through the line/stroke marks with the composition.
- Add a small "shuffle visual" control in the dialog next to the Feature/Marks toggle so the publisher can step to the next composition if they don't like the drawn one.

Everything else about the card — logo top-left, yellow kicker, headline, chapter name, photo in feature mode — stays as it is.

## 2. Dimensions

The card is currently 1200x627 (1.91:1). That is a valid LinkedIn landscape size, but square art takes noticeably more vertical space in the mobile feed and matches the format the chapter's recent posts use.

Change the card to **1200x1200 (1:1)** and re-flow the existing layout for the square frame:
- Marks mode: logo, kicker, headline, chapter name stacked with the same rhythm, headline allowed 5 lines.
- Feature mode: the photo becomes the lower half of the square, edge to edge, with the text block on the Deep Blue upper half — a 42% side column is too narrow at 1:1.
- The dialog preview follows the new ratio automatically (it derives from the shared constants).

If you would rather keep landscape, say so and I'll keep 1200x627 and apply only the mark changes.

## 3. Four-language post text

One LinkedIn post containing all four languages, produced in the same AI drafting step.

- The draft server function asks the model for four short blocks — DE, FR, IT, EN, in that order — each a hook plus one or two lines, each ending with its own localized article URL (`/de/insights/<id>`, `/fr/…`, `/it/…`, `/en/…`). Existing article translations are used as the source for a language when one exists; otherwise the model translates from the article's own language.
- Blocks are joined with a plain divider line and the whole thing is hard-capped at LinkedIn's 3000 characters: the model is given the budget (~650 characters per language) and the server clamps the result — if it still overruns, trailing blocks are trimmed at a sentence boundary, never mid-word. Hashtags appear once at the end.
- The dialog gets a DE · FR · IT · EN block indicator and keeps the live character counter; the text stays fully editable before posting.
- Fallback stays non-fatal: if the model call fails, the post falls back to title + excerpt + canonical URL as today.

## Technical notes

- `src/components/cms/LinkedInCard.tsx` — mark compositions, square layout.
- `src/lib/linkedin.ts` — card constants (1200x1200), composition table and deterministic picker (client-safe so preview and raster agree).
- `src/lib/linkedin.server.ts` — `draftCommentary` rewritten for the four-language prompt, per-locale URLs via `localizePath`, length clamping.
- `src/components/cms/LinkedInShareCard.tsx` — shuffle control, language indicator.
- `src/i18n/locales/*/cms.json` — new labels.
- No database or schema change; `article_linkedin_posts` already stores commentary and image mode.

## PR note

**Summary** — Improves the LinkedIn share visual (varied, non-clipped ICF brush marks; square 1200x1200 format) and makes the drafted post multilingual (DE/FR/IT/EN in one post, within the 3000-character limit).

**Changes** — Card layout and mark composition system; dialog shuffle plus language indicator; server-side four-language drafting with per-locale article URLs and length clamping; new CMS strings in four languages.

**Backend / Schema** — None.

**Testing** — Render the dialog for several published articles and confirm each gets a different, uncropped composition; confirm the preview matches the posted PNG; confirm the draft stays under 3000 characters with all four locale links; confirm the fallback text when the AI call fails.

**Risks & Rollback** — Contained to the LinkedIn share feature; revert the touched files to restore the current card. No migration.

**Follow-ups** — Optional later: separate posts per language on a schedule instead of one combined post.