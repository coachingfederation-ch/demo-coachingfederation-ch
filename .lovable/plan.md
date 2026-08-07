Add a content section before the coach finder

## Goal
Add an educational, conversion-oriented content block before the searchable coach directory on `/find-a-coach`. It will explain the three ICF credentials, highlight inclusive coaching (DEIB touchpoint), and direct organisations to the chapter contact. The block will be collapsible on smaller screens and always visible above the fold on desktop, while following the official ICF palette, typography, and brush-mark decoration system.

## Current state
- `src/pages/FindACoach.tsx` renders `CompactHero`, then `CoachDirectory` directly inside `<main>`.
- `src/components/coaches/directory.tsx` sits on a `bg-card` (white) surface with `bg-background` (bone) immediately after it.
- The page has no credential explanation or DEIB callout; the only conversion path is the search itself.
- i18n strings live in `src/i18n/locales/{en,de,fr,it}/directory.json` and are already loaded by the page.
- Shared brush marks (`Mark`) are available via `src/components/marks.tsx` and are used elsewhere for decoration.

## Proposed change

1. **New component `CoachFinderContext`**
   - Create `src/components/coaches/CoachFinderContext.tsx` as a self-contained, reusable section.
   - Layout: `bg-background` surface, `max-w-7xl`, `px-8`, `py-16`.
   - Three sub-regions:
     - **Credentials Explained**: a responsive grid of three cards (ACC / PCC / MCC) on a white card background, each with a credential abbreviation, title, and short description. Use the `mark-yellow` brush stroke as a small underline under the heading.
     - **DEIB Inclusive Coaching**: a yellow-accented card (`bg-mark-yellow/20` with `border-mark-yellow/50`) containing the "Find a coach who understands your context" message. Add a small `asterisk2` or `highlight2` mark for visual freshness.
     - **For Organisations CTA**: a Deep Blue card (`bg-hero` / `text-hero-foreground`) with the "Looking for multiple coaches?" text and a mailto CTA to `office@coachingfederation.ch` with `target="_top"`. Use a `line1` or `arrow2` mark.
   - On mobile, the whole section collapses via a native `<details>`/`<summary>` element with a custom-styled disclosure button, defaulting to **open** so the content is discoverable but does not dominate the results.
   - On desktop (`lg:`), the disclosure is always open and the summary hidden.

2. **Wire into `FindACoach.tsx`**
   - Import `CoachFinderContext` and render it between `CompactHero` and `CoachDirectory` inside `<main>`.
   - Keep the existing `bg-background` wrapper of the page; the new section will sit on the same bone surface before the white finder section.

3. **i18n updates**
   - Add a new `finderContext` namespace to all four `directory.json` files with keys for:
     - `credentials.title`, `credentials.lede`
     - `credentials.acc.abbr`, `credentials.acc.title`, `credentials.acc.description`
     - `credentials.pcc.abbr`, `credentials.pcc.title`, `credentials.pcc.description`
     - `credentials.mcc.abbr`, `credentials.mcc.title`, `credentials.mcc.description`
     - `deib.title`, `deib.lede`
     - `organisations.title`, `organisations.lede`, `organisations.cta`, `organisations.email` (the email address itself can be kept in code or in a dedicated `contact` common key to avoid exposing it in every locale — reuse `common.contactEmail` if it exists, otherwise add it to `common.json`)
     - `disclosure.show`, `disclosure.hide` (mobile toggle)
   - Translate into `de`, `fr`, and `it`, matching the existing tone and terminology (e.g. "ACC", "PCC", "MCC" are proper nouns and stay the same; "Associate Certified Coach" → "Associate Certified Coach" / "Coach certifié associé" / "Coach associato certificato").

4. **Styling guardrails**
   - No hardcoded hex colors; use Tailwind semantic tokens (`bg-hero`, `text-hero-foreground`, `bg-card`, `text-foreground`, `bg-mark-yellow`, etc.).
   - Keep the existing `0.75rem` radius on cards and `rounded-2xl` for larger containers.
   - Maintain touch targets of at least 44px for the disclosure toggle.
   - Ensure WCAG contrast on the yellow DEIB card and the Deep Blue CTA card.
   - Use `aria-hidden` for decorative marks; the disclosure control uses `<summary>` for native keyboard support.

## Files to create or edit
- **Create**: `src/components/coaches/CoachFinderContext.tsx`
- **Edit**: `src/pages/FindACoach.tsx`
- **Edit**: `src/i18n/locales/en/directory.json`
- **Edit**: `src/i18n/locales/de/directory.json`
- **Edit**: `src/i18n/locales/fr/directory.json`
- **Edit**: `src/i18n/locales/it/directory.json`

## Verification
- Check the `/find-a-coach` preview at desktop and mobile widths.
- Confirm the section appears between the hero and the directory.
- Confirm the mobile disclosure expands/collapses and the directory remains usable.
- Confirm all four languages render the new strings without missing keys.
- Confirm the "Contact ICF Switzerland" link opens the local email client (mailto with `target="_top"`).
- Confirm no new console errors or layout shifts.

## Risks & rollback
- Low risk: pure UI addition with no backend or schema changes.
- Rollback: revert `src/pages/FindACoach.tsx` and the four locale files; delete `src/components/coaches/CoachFinderContext.tsx`.
