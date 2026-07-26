## Goal

Build out `/for-coaches` using the structure and copy from the uploaded wireframe, styled entirely with the existing design system (indigo hero, lavender background, `CARD_SHADOW` cards, `eyebrow`/`btn-mono` utilities, hand-drawn marks, Inter).

## New page structure

```text
1. Hero (existing CompactHero)      "Your professional home in Switzerland"
2. Membership benefits              9 benefit items as icon/number cards + "Join as a member" CTA
3. Learning & development           tabbed section, 6 tabs (Professional Dev., Ethics,
                                    DEIB, Peer Coaching, Credentials, AI in Coaching)
4. Credentialing pathway            keep existing ACC / PCC / MCC cards
5. DEIB in your practice            split section w/ CircularMark, "Coaching across difference"
6. Communities                      keep existing chapter block, extended with the 8 community
                                    names + languages (Zurich, Geneva, Lausanne, Basel, Bern,
                                    Svizzera Italiana, Ost-Schweiz, Valais) as pill cards
7. Volunteer & lead                 "Shape the future of coaching in Switzerland" + CTA
8. Member stories                   3 placeholder testimonials (name, credential, community,
                                    language chips) in a rotating carousel with dots
9. Join CTA                         existing indigo closing band
```

## Content

All copy comes from the wireframe verbatim where available. Placeholder content created where the wireframe only describes a visual: three member testimonial quotes with invented but realistic names, credentials and communities (clearly plausible, e.g. "Nadia Berger, PCC — Basel community, DE/EN"), and short one-line descriptions for community cards.

## Technical notes

- Page stays presentational: `src/pages/ForCoaches.tsx` plus small local sub-components (`BenefitGrid`, `LearningTabs`, `MemberStories`) in a new `src/components/coaches/sections.tsx`, mirroring the `src/components/organisations/` pattern.
- Tabs and the testimonial carousel are client-side `useState` only — no new data or backend.
- All strings added to `src/i18n/locales/en/coaches.json` (extending existing keys, keeping `hero`, `credentials`, `chapters`, `join`), then propagated to DE/FR/IT via the existing `scripts/translate.ts` workflow so all four locales stay complete.
- Existing routes (`/for-coaches` and `/$locale/for-coaches`) and meta stay unchanged.
