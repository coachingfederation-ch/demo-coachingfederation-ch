## Goal

Give every coach profile one primary authoring language plus opt-in translations, using the same pattern already proven for Insights articles: a translation row per locale, AI-assisted first draft, manual refinement, freshness tracking, and locale fallback on the public site.

## Data model

New table `public.member_profile_translations`, mirroring `article_translations`:

| Column | Notes |
|---|---|
| `profile_id` | FK to `member_directory_profiles`, unique with `locale` |
| `locale` | `de` / `fr` / `it` / `en` |
| `tagline`, `description`, `approach`, `qualifications`, `fees_note`, `session_length_note`, `availability_note`, `response_time_note`, `testimonial_quote`, `testimonial_attribution` | all nullable; blank fields simply fall back |
| `manually_edited` | false after auto-translation, true after a member saves an edit |
| `is_ready` | false while it is still a draft; only ready rows are shown publicly |
| `source_updated_at` | snapshot of the source profile's content timestamp at translation time |
| `created_at` / `updated_at` | standard, with touch trigger |

Two columns added to `member_directory_profiles`:
- `primary_locale` (default `en`) — the authoring language of the base row.
- `content_updated_at` — bumped by a trigger whenever any translatable field changes. This is exactly what `articles.content_updated_at` does and is what makes "outdated" detectable.

Access rules: members read/write only rows belonging to their own profile; staff may read all; the public never reads this table directly.

## Translation states

Derived, not stored — same derivation as the Insights panel:

```text
no row                                  -> Not created
row, manually_edited = false, is_ready=false -> Auto-translated draft
row, manually_edited = true,  is_ready=false -> Edited draft
row, is_ready = true                    -> Published (live for that language)
row.source_updated_at < profile.content_updated_at -> Outdated (badge overlays the above)
```

## Public read path

`coach_directory_public` gains a `translations` JSONB column: an aggregate of the ready translation rows keyed by locale, built inside the view so the view stays the single safety boundary (no new public table exposure, unchanged column safety guarantees).

`queryCoachDirectory` and `getPublicCoachProfile` take the active locale and resolve each field field-by-field: use the translated value when non-empty, otherwise the primary-language value. This means a partially translated profile is never half-empty. `resolvedLocale` is returned alongside, so the profile page can show the existing "shown in <language>" notice component when a fallback happened, and `head()` metadata uses the resolved text.

Search, facets and sorting keep matching primary-language content and slug facets — translations affect display only.

## Member portal flow

A "Languages" panel is added to `MemberProfileEditor`, modelled on `TranslationsPanel`:

1. Pick the primary language (locked to the profile, changeable while no translations exist).
2. For each other language: a status badge and a "Translate" button. Nothing is generated automatically — the coach opts in per language.
3. Auto-translation calls a new `translateMemberProfile` server function using the same Lovable AI gateway and prompt conventions as `translateArticle`, writing an unready draft.
4. The coach opens the language, edits any field inline, and saves — which flips `manually_edited` to true.
5. A "Publish this language" toggle sets `is_ready`. Until then the public site falls back to the primary language.
6. Re-running translation on a row with `manually_edited = true` requires an explicit confirmation, reusing the existing overwrite-confirmation copy.
7. Editing the source profile bumps `content_updated_at`, so all translations immediately show the "Outdated" badge with a "Refresh" action; the coach can also dismiss it by re-saving the translation manually.

Staff keep read-only visibility of translation status on the admin member detail screen.

## Localisation of the UI itself

New strings for the panel, states and public fallback notice added to the `cms` and `directory` dictionaries in all four languages, following the existing `src/i18n/locales` layout.

## Documentation

`docs/public-directory.md` and `docs/code-map.md` are extended with a "Profile translations" section covering the table, the state machine above, the fallback rule, and the member editing flow.

## Technical notes

- Migration order per project convention: create table, GRANT, enable RLS, policies, trigger; then view replacement with `security_invoker = on`.
- Server work goes in `src/lib/member-translations.server.ts` (writes, AI call) with the RPC surface in `member-profile.functions.ts` / a sibling `.functions.ts`, all behind `requireSupabaseAuth`.
- No change to the sync engine: translations are local portal data and survive ICF imports, like the rest of the profile's local fields.
