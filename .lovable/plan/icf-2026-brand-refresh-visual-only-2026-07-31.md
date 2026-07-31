# ICF 2026 brand refresh — visual only

Goal: move the site from the residual lavender/indigo/teal Goal Tracker look to the official ICF palette and a calmer editorial hierarchy, without touching routes, data, i18n keys, or the self-hosted Quicksand + Plus Jakarta Sans pairing.

## Pass 1 — Colour tokens (`src/styles.css`)

Remap the existing semantic tokens to OKLCH conversions of the official hexes. No new token names except where a page already needs one.


| Token                             | New value                        | Role                              |
| --------------------------------- | -------------------------------- | --------------------------------- |
| `--background`                    | Bone `#F8F0E4`                   | warm editorial base               |
| `--card`                          | White                            | raised card/list bands            |
| `--foreground`                    | Deep Blue `#212251`              | body text                         |
| `--primary`                       | Blue `#2B379B`                   | primary actions, links            |
| `--hero`                          | Deep Blue                        | hero, closing CTA, header, footer |
| `--accent`                        | Light Blue `#5778FA`             | selected/highlight states         |
| `--ring` / `--chip-active-border` | Light Blue                       | focus + active chips              |
| `--muted` / `--border`            | Bone / Deep Blue mixes           | quiet surfaces and hairlines      |
| mark tokens                       | Bone / Deep Blue / Blue / Yellow | brush-stroke tiles                |


Yellow stays a spot accent only (eyebrow marks, one hero highlight, one tile per group). Shadows are reduced to a near-flat Deep-Blue-tinted lift. Contrast is checked for text, chips, links and focus rings.

The three-surface rhythm already in place stays: Bone base, white raised, Deep Blue only for hero and closing CTA.

## Pass 2 — Typography

Keep both fonts as-is. Loosen headline tracking from `-0.05em` to roughly `-0.02em` (Quicksand is geometric and currently over-tightened), add a slightly larger display step for hero and section H2, raise body line-height for long copy, and make the `eyebrow` utility smaller and Deep-Blue/Yellow-aware. Sentence case everywhere except eyebrows and metadata.

## Pass 3 — Header and footer (`src/components/site-chrome.tsx`)

Deep Blue header, functionality untouched. Reduce the white/10 pill clutter: language switcher and account become quiet icon+label buttons, nav links use an underline active state instead of pills, and "Find a coach" stays the single filled CTA (Yellow or White on Deep Blue, whichever passes contrast). Logo clear space, skip link, focus rings, mobile menu and 44px targets preserved. Footer stays slim Deep Blue with tightened spacing and link hierarchy; DE · FR · IT · EN order kept.

## Pass 4 — Home page (`src/pages/Home.tsx`)

- Hero: same copy, image and two-column structure; better vertical rhythm, fully rounded image window, one restrained mark, single obvious primary action.
- Audience pathways: same four cards, restyled as an editorial nav row — eyebrow, title, short description, arrow CTA, hairline borders, no heavy shadows, clear hover/focus.
- Credential rationale 01–04: large muted numerals, strong headings, generous spacing, no icon cards.
- Insights / events tiles: one accented tile per group, the rest Bone or White, so tiles stop competing. Event metadata stays date · city · title · language chips · category.
- Organisations, communities, research, membership, newsletter: consistent section padding, one accent per band, volunteering kept visible.

## Pass 5 — Consistency sweep and verification

Apply the same token and spacing treatment where other public pages inherit these components (about, for-coaches, for-organisations, events, insights, team, communities, coach profile, Europe Pulse) — colour and spacing only. Then run typecheck/lint and screenshot desktop and mobile widths, fixing contrast, overflow and layout regressions.

The "Edit with Lovable" badge is a publish setting rather than code; it will be turned off in project settings.

## PR note

**Summary** — Rebrands the public site to the official ICF 2026 palette and tightens typographic hierarchy, with no functional, routing, data or i18n changes.

**Changes**

- Styling: semantic OKLCH tokens remapped to Deep Blue / Blue / Light Blue / Yellow / Bone / White; softer shadows; refined heading tracking and type scale.
- UI: calmer Deep Blue header, editorial audience cards, restrained numbered credential list, de-escalated insight/event tiles, unified section rhythm across public pages.
- Config: Lovable badge hidden in publish settings.

**Backend / schema changes** — None.

**Testing & verification** — Typecheck and lint; visual pass on every public route at mobile and desktop widths; contrast spot-checks on text, links, chips, buttons and focus rings; keyboard focus and mobile menu re-checked.

**Risks & rollback** — Blast radius is presentational and concentrated in `src/styles.css`; reverting the token block restores the previous look. No migrations.

**Follow-ups** — Photography refresh and richer brush-stroke usage are out of scope; authenticated CMS/member screens inherit the new tokens but are not individually art-directed in this pass.

#   
Plan Approval Notes

***Before implementation, apply these additional constraints:***

- ***Keep explicit text labels for language and account controls. Reduce pill styling, but do not replace labels with icons alone.***
- ***Preserve the existing official ICF Switzerland chapter logo asset without redrawing, recoloring, cropping, distorting, or substituting it.***
- ***Convert the official HEX palette to OKLCH without materially changing the colors. Treat the HEX values as the visual source of truth.***
- ***Use Deep Blue foreground on Yellow controls. Do not use Light Blue for normal-size body text on Bone or Deep Blue unless measured WCAG AA contrast passes.***
- ***Verify every text, icon, chip, border, button, and focus-state combination with WCAG 2.2 AA criteria. Include keyboard focus and not only static color contrast.***
- ***Interpret “one accent per band” as one dominant visual idea per section, not a prohibition on all supporting ICF accents.***
- ***Test at 390px, 768px, and 1440px widths, including header wrapping, logo clear space, hero headline wrapping, stacked cards, event metadata, language chips, newsletter form, mobile navigation, and horizontal overflow.***
- ***Run the project’s actual available checks: lint, production build, and TypeScript validation if configured. If there is no standalone typecheck script, run the repository’s configured TypeScript compiler command rather than claiming typecheck coverage.***
- ***If shared token changes reduce usability on authenticated, CMS, form, table, dropdown, or error-state screens, make the smallest local correction necessary. Do not accept regressions merely because those screens are outside the art-direction scope.***
- ***After implementation, report changed files, checks run, viewport sizes tested, contrast issues found, and any remaining limitations.***

&nbsp;

## ***Official brush-stroke assets***

I will upload the official ICF brush-stroke marks as local SVG assets. Treat these files as the authoritative source for the ICF visual language. Use the supplied SVGs rather than recreating or approximating them with CSS, Lucide icons, or new SVG paths.

Integrate them through the existing marks/asset abstraction and keep them same-origin. Preserve their proportions, viewBox, and visual character. Recolor only with approved ICF palette colors: Deep Blue `#212251`, Blue `#2B379B`, Light Blue `#5778FA`, Yellow `#EFCB30`, Bone `#F8F0E4`, or White `#FFFFFF`.

Use the marks selectively as underlines, arrows, asterisks, notation marks, or image overlays in the hero, selected headings, insight/event highlights, and CTA areas. Do not use them in every section or as generic icons. Limit each design unit to two brush-stroke elements and each headline to three highlight colors maximum.

Decorative marks must use `alt=""` and `aria-hidden="true"` unless they convey content. They must not obscure text, reduce contrast, interfere with controls, or cause overflow. Verify their behavior at 390px, 768px, and 1440px widths.

Keep the “richer brush-stroke usage” in scope as a controlled brand-asset integration pass, while keeping functionality, routes, data, i18n keys, and the existing Quicksand + Plus Jakarta Sans fonts unchanged.