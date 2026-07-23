## Goal

Rebuild the article detail page (`/articles/$id`) to visually match the Insights Editor reference's `editor.tsx` layout — the current page renders but doesn't match the reference and the user reports it as "not working". Keep the working Supabase wiring (load, autosave, publish/schedule/unpublish/delete, language lock).

## Reference

`Insights Editor` project → `src/routes/editor.tsx`:
- Top bar inside Shell: back-to-Articles pill, status pill, "Saved automatically" text, right side Preview / Schedule… / Publish buttons.
- Two-column grid `[minmax(0,1fr)_340px]`.
- Left column: language tabs row (EN active + DE/FR/IT), title (`text-4xl font-bold`), lead paragraph, featured-image dropzone, body blocks.
- Right column: (AI assistant card — omit, not in MVP), Translations card — omit, Publishing card (category/author/publish date), Tags card — omit.

## Changes

### 1. `src/routes/_authenticated/articles.$id.tsx`
Rewrite to match reference structure while keeping current behavior:
- Header bar identical to reference (Articles back-link, `StatusPill`, autosave label). Right-side buttons: **Unpublish** (only when published/scheduled), **Schedule…**, **Publish / Republish**. Remove Preview button (not in MVP).
- Language tab row using the reference `LangTab` styling — active = primary pill, others = `bg-teal-soft` or dashed-border when disabled by language lock. Locked note text unchanged.
- Title as large `text-4xl` heading input (borderless).
- Lead paragraph as borderless textarea in muted color.
- Featured-image dropzone as visual-only placeholder (matches reference; no upload wiring in MVP) with the small "AI writes alt text" caption removed (out of scope).
- Body as a bordered `rounded-2xl` textarea (kept — this is the MVP write surface).
- Right sidebar: Publishing card (Status / Language / Published / Scheduled / Updated rows — current fields) + Danger zone (Delete). Drop AI/Translations/Tags cards (not in MVP).
- Preserve all existing hooks: initial fetch, 800ms autosave debounce, publish/schedule/unpublish/delete handlers, `notFound` and loading states, `first_published_at` language lock.

### 2. `src/routes/_authenticated/articles.new.tsx`
No change to logic. Verify it renders under `/articles/new` and the Create-draft button inserts + navigates to `/articles/$id`. (User is currently on this route; if the click is silently failing, capture the console/network to confirm — but no code change planned unless a real failure is found.)

### 3. `src/routes/_authenticated/articles.tsx`
Already updated last turn to link to `/articles/new`. No further change.

## Out of scope (kept as future work, matches earlier MVP scope)

- AI assistant panel, translations panel, tags, categories, author selector, featured-image upload.

## Verification

- Load `/articles` → click **New article** → language picker at `/articles/new` renders.
- Pick DE → **Create draft** → lands on `/articles/$id` with new visual layout, DE tab active, title focused-ready.
- Edit title → "Saving…" then "Saved just now" within ~1s.
- Publish → status pill flips to Published; Unpublish appears.
- Delete → returns to `/articles`.
