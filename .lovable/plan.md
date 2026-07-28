## What's wrong

The "Years of coaching experience" dropdown in the member profile editor renders raw keys (`cms.member.experienceBands.0-2`, …). Confirmed cause: `MemberProfileEditor.tsx` (line 643) looks up `member.experienceBands.<band>` in the CMS dictionary, but those keys only exist in `directory.json` (`detail.experienceBands.*`), not in `cms.json` — so the translator falls back to printing the key. The public profile page uses the correct `directory.detail.experienceBands.*` keys, which is why it displays fine.

## Where the bands live today

They are a fixed list, not chapter-managed content:
- `EXPERIENCE_BANDS = ["0-2","3-5","6-10","10+"]` in `src/lib/vocabularies.ts`
- validated as a Zod enum in `src/lib/member-profile.functions.ts`
- stored as a text value on the member profile row
- labelled through i18n JSON (DE/FR/IT/EN)

The `/vocabularies` screen only manages database-backed lists (`cf_regions`, `cf_specialisations`, `cf_credentials`, `cf_formats`, `cf_languages`, `cf_availability_labels`, `cf_client_types`).

## Plan

**Step 1 — Fix the bug (small, immediate)**
Add a `member.experienceBands` block (`0-2`, `3-5`, `6-10`, `10+`) to `cms.json` for EN, DE, FR, IT, reusing the wording already in each locale's `directory.json`. The dropdown then shows "0–2 years" etc.

**Step 2 — Make the bands manageable in /vocabularies**
Promote them to a normal vocabulary so admins can rename or reorder them:
- New table `cf_experience_bands` following the exact shape/RLS/GRANT pattern of the existing `cf_*` tables, seeded with the four current values as slugs (`0-2`, `3-5`, `6-10`, `10+`) so existing stored profile values keep resolving.
- Register it in `VOCAB_TABLES` / `VOCAB_DESCRIPTORS` — the generic editor screen then picks it up with no new UI code, including the DE/FR/IT name fields.
- Member profile editor loads the rows instead of the hard-coded array and labels options with `vocabLabel(row, locale)`.
- Public coach profile resolves the label from the same rows, falling back to the stored raw value if a band was deleted.
- Server validation relaxes from a fixed Zod enum to "must match an active band slug", so admin-added bands are accepted.

The i18n keys from Step 1 stay as the fallback for the seeded slugs.

### Technical notes
- Sort order comes from `sort_order`, so admins control the ordering; the current order is seeded 10/20/30/40.
- Deleting a band does not rewrite existing profiles; those profiles fall back to showing the stored slug until re-saved.
