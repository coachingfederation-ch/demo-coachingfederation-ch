## Goal

Make the evidence deck on /for-organisations visually stronger (especially stat slides like slide 5), and let visitors download the presentation, optionally leaving an email that we store.

## 1. Bolder slide visuals

Rework `DeckSection` so each slide type has a distinct, confident layout instead of one generic stack:

- **Stat slides** (slides 2 and 5): the number becomes the hero — huge display type (roughly 8rem–12rem, responsive), tight tracking, accent colour, centred/left-anchored with the label beside or beneath it at larger size. Add a subtle hand-drawn mark behind the figure and an animated count-up when the slide becomes active (respecting reduced-motion).
- **Bullet slides**: numbered bullets become larger cards in a 2x2 grid with a big two-digit index, more padding and clear separation.
- **Quote slides**: oversized opening quote glyph, larger quote type, attribution line.
- **Title/body slides**: bigger headline scale, shorter measure, accent rule above the kicker.
- Shared: taller slide frame, stronger contrast between kicker / headline / support text, smooth fade-slide transition on slide change, larger progress dots and nav buttons on mobile.

No copy changes — all text stays in the existing translation files, so DE/FR/IT keep working.

## 2. Download the presentation

- A download bar directly under the deck: short line of copy, an email field (clearly marked optional) and a "Download the slides" button. Submitting with an empty email still downloads.
- Validation only when an email is entered; honeypot field for spam, same pattern as the culture survey.
- After download, a small confirmation state replaces the form.
- Fully translated (EN/DE/FR/IT) via a new `organisations.deck.download.*` block.

### The file

Generate a branded PDF of the deck (one slide per page, ICF colours, logo, sources page) from the existing slide copy, one file per locale, served from `public/downloads/`. The user gets the PDF matching the language they are browsing in.

### Storing the email

New table `deck_download_leads`:
- email (nullable), locale, source, consent flag, created_at
- Public can insert only; only editors/admins can read — same policy shape as `organisation_survey_responses`.
- Insert happens through a new server function with Zod validation; a download with no email records an anonymous row so we can still count downloads.

## Technical notes

- Files touched: `src/components/organisations/DeckSection.tsx`, new `src/components/organisations/DeckDownload.tsx`, new `src/lib/deck-download.functions.ts`, the four `organisations.json` locale files, plus generated PDFs in `public/downloads/`.
- One migration for the new table with GRANTs and RLS.
- No change to routing, existing survey, or other sections.
