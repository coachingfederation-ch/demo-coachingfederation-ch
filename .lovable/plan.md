## Goal

Turn `/for-organisations` into a comprehensive, conversion-oriented landing page for HR, L&D and leadership audiences — with the CIO pitch-deck narrative integrated natively and a working in-page survey that saves to the database, all fully localised (DE/FR/IT/EN).

## Page structure (new sequence)

1. **Hero** — keep current `CompactHero`, sharpen copy ("Embed professional coaching in your organisation"), two CTAs: *Assess your coaching culture* (scrolls to survey) and *Find a coach*.
2. **Proof bar** — four compact figures: member coaches, share credentialed, languages served, credential levels (ACC · PCC · MCC).
3. **Why ICF-certified coaching** — six differentiator cards: verified credentials, ethics & inclusion, Swiss expertise, diverse coach pool, pro-bono programmes, measurable impact.
4. **Outcomes** — keep the existing three stat cards.
5. **How we work** — keep the existing three-step process.
6. **Coaching in action** — three initiative blocks (coaching in organisations, coaching in education, coaching for IOs & NGOs), each with a lead, description and CTA, using existing hand-drawn marks instead of stock photos.
7. **Deep dive: the coaching business case** — the slide deck, rebuilt natively (see below).
8. **Programmes** — keep the existing three programme cards.
9. **Coaching culture assessment** — the in-page survey (see below).
10. **Events & presence** — short strip pointing to the Events page.
11. **Closing CTA** — keep the existing indigo CTA band (talk to us / find a coach).

## Slide deck integration

The uploaded HTML is a 2.3 MB self-unpacking bundle — embedding it would be heavy and visually foreign. Instead its narrative is rebuilt as a native, responsive **deck section**: a horizontal slide viewer with prev/next, dot indicators, keyboard arrows and swipe on mobile, each slide rendered with site typography and tokens (indigo/cream/teal, `CARD_SHADOW`).

Slides (condensed from 17 to ~9 meaningful ones): context ("what keeps Swiss leaders up at night", 70% stat) · what coaching is (ICF definition) · a profession, not a trend · the business case (50% less burnout, 2× intent to stay) · the proof (2.5× McKinsey) · future-ready leadership · from programmes to coaching culture · SME leverage (87%) · Swiss landscape & credentials · deploying for impact · next steps. A collapsible **sources** list carries the appendix references.

All slide text lives in the translation JSON, so slides localise like every other section.

## Survey

Adapted from the micro-site experience, as one in-page flow:

1. **Pressure picker** — "What's the biggest pressure on your organisation right now?" (retention & burnout, leadership & trust, AI disruption, inclusion & belonging, collaboration & conflict). Selecting one reveals a tailored short insight.
2. **Maturity questions** — 8 questions across four dimensions (leadership engagement, capability, access, measurement) on a 5-point scale, with progress indicator and back/next.
3. **Result** — instant maturity band (emerging / developing / established / embedded) with a per-dimension snapshot.
4. **Follow-up request** — optional name, work email, organisation, message + consent checkbox, honeypot field, Zod validation. Submitting stores the whole response.

Anonymous submissions allowed (no login). Written through a server function so the insert is validated and rate-limit-friendly, with a public insert policy scoped to the table; nobody can read submissions except editors/admins.

## Database

New table `public.organisation_survey_responses`, designed for later expansion:

- `locale`, `primary_pressure`
- `answers` (jsonb — question id → score, so new questions need no migration)
- `dimension_scores` (jsonb), `total_score`, `maturity_band`
- `contact_name`, `contact_email`, `contact_organisation`, `message`, `consent`
- `source` (defaults to `for-organisations`), `created_at`, `updated_at`

Grants + RLS: anonymous/authenticated may insert only; only editors/admins may read.

## Files

- `src/pages/ForOrganisations.tsx` — rebuilt as a composition of section components.
- `src/components/organisations/` — `ProofBar`, `Differentiators`, `Initiatives`, `DeckSection`, `CultureSurvey`, `EventsStrip`.
- `src/lib/organisation-survey.functions.ts` — validated submit server function.
- `src/lib/organisation-survey.ts` — shared question/scoring definitions (client-safe).
- `src/i18n/locales/{en,de,fr,it}/organisations.json` — extended with all new keys (EN authored, DE/FR/IT translated in the same pass).
- No routing changes: `/for-organisations` and `/$locale/for-organisations` keep working as-is.

## Technical notes

- Deck and survey are client-interactive but SSR-safe (no browser-only imports at module scope); the page stays public and prerenderable.
- Mobile: deck slides go full-width single-column with swipe; survey uses one question per screen with large tap targets.
- All copy in sentence case, existing tokens only — no new colours or fonts.
