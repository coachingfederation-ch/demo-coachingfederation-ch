## Problem

In the last fix, the **New article** button in `src/routes/_authenticated/articles.tsx` was changed to call `supabase.insert()` directly and jump to the editor. That bypasses `articles.new.tsx` entirely, so the language-picker page never loads and every click produces an empty `Untitled` draft in the default language (`en`).

## Fix

Restore `/articles/new` as the entry point for creating articles.

1. **`src/routes/_authenticated/articles.tsx`**
   - Replace the `<button onClick={createDraft}>` with a `<Link to="/articles/new">` styled identically to the current pill button.
   - Remove the now-unused `createDraft`, `creating` state, and `useNavigate` import.

2. **`src/routes/_authenticated/articles.new.tsx`** — leave as-is. It already:
   - Shows the 4 language cards (EN/DE/FR/IT).
   - Inserts the article with the chosen language on **Create draft**.
   - Navigates to `/articles/$id`.

No schema, RLS, or auth changes.

## Verification

- Click **New article** on `/articles` → `/articles/new` loads with the language grid.
- Pick a language → **Create draft** → lands on `/articles/$id` with that language set.
- Cancel returns to `/articles`.
