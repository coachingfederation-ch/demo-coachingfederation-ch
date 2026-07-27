## 1. Where we are today vs. the production profile

I rendered three things: our current `/coach/:id` page, the attached mock, and the live production profile.

| | Current portal profile | Production profile (coachingfederation.ch) | Attached mock |
|---|---|---|---|
| Header | Small card in a sidebar, square photo | Full-width tinted hero, round photo, name + role + website, two contact buttons | Hero band with initials/photo, name, credential, role, location, languages, availability, two CTAs |
| Intro | Tagline line | Role line under the name | Role line + meta row |
| About | Plain paragraph | "About Me" card with read-more | "About Marie", two paragraphs |
| How the coaching works | — | — | "How I work" — three numbered steps |
| Training / qualifications | — | "Training Qualifications & Experience" | "Credentials & training" list with years |
| Specialisations / formats / languages / regions | Chip rows | Sidebar lists | Chips + sidebar facts |
| Experience level | — | "My Experience": credential + years band | Credential + "since 2016" |
| Client types | — | "Type Of Client": organisational / personal | — |
| Availability / lead time | Accepting / waitlist dot | "Availability: typically two weeks" | Availability line |
| Fees | — | "Fees" free text + "Average price" band | — |
| Contact / booking | Website + LinkedIn links only | "Message Me", "Call Me", "Book a Meeting With Me", email | "Book an intro call", "Send a message", reply-time note |
| Social proof | — | Reviews with star ratings | One pull quote |
| Trust note | Small note at the bottom | — | Credential + Code of Ethics note in the sidebar |

Summary: our data model is already correct for *search* (facets), but thin for a *decision* page. The three real gaps are: no way to contact or book, no depth about the coach's practice (approach, training, experience, fees), and no social proof.

## 2. Recommended additional fields (all optional)

Deliberately small, member-owned, no free-form HTML:

**Contact & conversion**
- `booking_url` — "Book an intro call" (https only, same validation as existing links)
- `contact_email_public` (boolean) — opt-in to show the ICF-held email as a mailto CTA; we never expose email without this flag
- `response_time_note` — short text, e.g. "usually replies within 2 business days"

**Practice depth**
- `approach` — free text, "How I work" (rendered as paragraphs; the mock's 01/02/03 steps come from splitting on blank lines, no new structure needed)
- `qualifications` — free text list, "Training & qualifications"
- `experience_band` — enum-ish slug (`0-2`, `3-5`, `6-10`, `10+`), mirrors production's "My Experience"
- `session_length_note` — short text, e.g. "60–90 min"
- `fees_note` — free text, "Fees"
- `availability_note` — short text, "typically two weeks"

**Social proof**
- `testimonial_quote` + `testimonial_attribution` — one optional pull quote. Not a reviews system: no ratings, no moderation queue, no user-generated submissions.

**New facet (follows the existing vocabulary pattern)**
- `cf_client_types` vocabulary + `member_profile_client_types` join — "Organisational / Personal / Team". This is the only addition that is also filterable, and it matches the production profile's "Type Of Client".

Deliberately **not** adding: reviews/ratings, price ranges as numeric filters, multiple locations (regions already cover this), calendar integration, messaging inbox.

## 3. Schema changes

One migration:

```text
ALTER member_directory_profiles
  ADD booking_url, contact_email_public, response_time_note,
      approach, qualifications, experience_band,
      session_length_note, fees_note, availability_note,
      testimonial_quote, testimonial_attribution   -- all nullable

CREATE cf_client_types            (same shape as cf_formats: slug, name, name_de/fr/it, sort_order, is_active)
CREATE member_profile_client_types (profile_id, client_type_id)   + GRANTs + RLS mirroring member_profile_formats

REPLACE VIEW coach_directory_public
  -> add the new columns, plus client_type_slugs aggregate,
     and expose email ONLY as: CASE WHEN contact_email_public THEN m.email END
```

Everything stays nullable, so no existing profile changes behaviour and the directory listing query is untouched.

## 4. Redesigned public profile page

Composition follows the mock; palette, type and card/shadow treatments stay exactly as the current design system (Goal Tracker: lavender background, indigo hero, teal accent, Inter, `CARD_SHADOW`, `eyebrow`, `btn-mono`).

```text
┌──────────────────────────────────────────────────────────┐
│ indigo hero band                                          │
│  ← Back to search                                         │
│  ◯ photo   Marie Dubois  [ACC]                            │
│            Executive & leadership coach                   │
│            Genève · in person & online · FR · EN          │
│            ● Accepting new clients      [Book] [Email]    │
└──────────────────────────────────────────────────────────┘
  ┌────────────────────────────┐  ┌────────────────────────┐
  │ About                      │  │ WORK WITH …            │
  │ How I work (01/02/03)      │  │ Format · Session ·     │
  │ Specialisations  (chips)   │  │ Languages · Availability│
  │ Client types     (chips)   │  │ Response time          │
  │ Training & qualifications  │  │ [Book an intro call]   │
  │ “pull quote” — attribution │  │ [Send a message]       │
  │ Fees                       │  │ ── credential + Code   │
  │ Service areas    (chips)   │  │    of Ethics note      │
  └────────────────────────────┘  └────────────────────────┘
```

Empty-state behaviour is the core requirement: every block is conditional. A profile with only name, credential and regions renders as a clean hero + a compact sidebar with no gaps or empty headings — the sidebar collapses to just the credential/ethics note, and the main column shows only what exists. I'll verify this by rendering a minimal profile and a fully-populated one side by side.

## 5. Member editing

`MemberProfileEditor` gains one new collapsible "Practice details" section (approach, qualifications, experience, session, fees, availability, response time), one "Contact & booking" section (booking URL, show-my-email toggle), one "Testimonial" section, and a client-types chip group alongside the existing facet groups. Same save path, same character limits and sanitising as `tagline`/`description`; `booking_url` reuses the https-only link rule.

## Technical notes

- `PublicCoachProfile` in `src/lib/directory.functions.ts` extends with the new columns; `queryCoachDirectory` (listing) keeps its current projection so search is untouched.
- Email is only ever selected through the `contact_email_public` CASE in the view — the public path can't leak it, and the "Send a message" CTA is a plain `mailto:` (no inbox, no spam surface beyond what the member opted into).
- `experience_band` and client types are slugs, so they're translation-ready via the existing `vocabLabel` mechanism; member free text stays untranslated, as with tagline/description today.
- New i18n keys added to `directory.json` and `cms.json` in EN/DE/FR/IT.
- Verification: Playwright render of a fully-populated profile, a minimal profile, and mobile width; plus a search regression check on `/find-a-coach`.

## Follow-ups (not in this change)

- Real reviews with moderation, if the chapter wants parity with production.
- Structured "locations" if regions ever prove too coarse.
- Profile completeness meter in the Member Area to nudge members to fill the new fields before launch.
