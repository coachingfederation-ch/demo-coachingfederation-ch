## Homepage link audit (current state)

Verified in `src/pages/Home.tsx` and `src/components/site-chrome.tsx`:

| # | Element | Current target | Status |
|---|---|---|---|
| 1 | Hero "Find a coach" button | `#find-a-coach` (scrolls to cards below) | Redundant — remove |
| 2 | Hero "For organisations" button | `/for-organisations` | Valid (removed with hero CTA row) |
| 3 | 4 audience cards (Looking for a coach / Organisation / I am a coach / Curious) | `href="#"` | Broken |
| 4 | "Coaching in action" view-all link | `href="#"` | Broken |
| 5 | 4 theme cards (Future of Work, Leadership, AI, D&I) | `href="#"` | Broken |
| 6 | Organisations "Talk to us" | `href="#"` | Broken |
| 7 | Organisations "Case studies" | `href="#"` | Broken |
| 8 | 4 community cards (Zürich, Lausanne & Genève, Lugano, Online) | not links at all | Missing |
| 9 | Events view-all | `/events` | Valid |
| 10 | 3 event cards | `href="#"` | Broken |
| 11 | Join "Become a member" | `href="#"` | Broken |
| 12 | Join "Explore credentials" | `href="#"` | Broken |
| 13 | Newsletter form | `preventDefault`, no handler | Left as-is (no backend requested) |
| 14 | Footer Privacy / Code of Ethics / Imprint | `href="#"` | Broken, no page exists |

Existing routes: `/`, `/find-a-coach`, `/for-organisations`, `/for-coaches`, `/insights`, `/insights/$id`, `/events`, `/about` (all locale-prefixed too).

## Fixes

1. **Hero** — delete the CTA button row entirely; the four audience cards immediately below cover all journeys. Hero keeps eyebrow, headline, subtitle, image.
2. **Audience cards** → `LocaleLink` to `/find-a-coach`, `/for-organisations`, `/for-coaches`, `/about` (in card order).
3. **Coaching in action** → view-all and all four theme cards link to `/insights`.
4. **For organisations** → "Talk to us" → `/for-organisations#organisation-contact` (anchor already exists in the organisations sections component); "Case studies" → `/for-organisations`.
5. **Communities** → make each card a `LocaleLink` to `/about#communities`; add `id="communities"` to the communities section on the About page.
6. **Event cards** → `LocaleLink` to `/events` (no per-event detail route exists yet).
7. **Join** → "Become a member" → `/for-coaches`; "Explore credentials" → `/for-coaches#credentials`, adding `id="credentials"` to the relevant For Coaches section.
8. **Footer legal links** — no Privacy / Code of Ethics / Imprint pages exist. Render them as a deliberate disabled state (non-anchor `span`, `aria-disabled="true"`, `cursor-not-allowed`, dimmed to `text-white/40`, `title` from existing copy) instead of dead `#` anchors. Same treatment used site-wide since the footer is shared.

All new links use `LocaleLink` so DE/FR/IT/EN prefixes are preserved; hash targets are appended via the locale-aware href.

## Out of scope (noted, not changed)
Placeholder `#` links still exist on `/for-organisations`, `/for-coaches`, `/events`, `/about`, and the coaches sections components. Say the word and I'll apply the same audit-and-fix pass to those pages next.

## Verification
Playwright pass over the homepage: assert every `<a>` has a non-`#` href or is a disabled `span`, click through each audience card and confirm the resulting route, and re-check at 390px that nothing shifted.
