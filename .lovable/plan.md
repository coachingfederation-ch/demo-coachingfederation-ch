## Goal
Make row clicks in `/articles` reliably open a detail page, and rebuild that detail page to match the "Insights Editor" reference design while keeping the working MVP behavior (autosave, publish/schedule/unpublish, delete, language-lock).

## Why the click "does nothing"
The list rows in `src/routes/_authenticated/articles.tsx` render a `<Link to="/articles/$id" params={{ id: r.id }}>` inside a `grid`. On the current build the navigation resolves but the detail route at `src/routes/_authenticated/articles.$id.tsx` renders a functional but visually spartan page — easy to mistake for "nothing happened" (no header change, no visible layout shift on some viewports). To eliminate ambiguity we'll:
- Confirm the row is a real anchor (`Link` renders `<a href>`), keep it clickable end-to-end, add `role="button"` + hover affordance.
- Rebuild the detail page so navigation is unmistakable and matches the reference design.

## Detail page rebuild (`articles.$id.tsx`)
Match the Insights Editor layout while wiring every control to Supabase:

Top bar (sticky, on white card):
- Back-to-Articles pill (ChevronLeft).
- Status pill (draft / scheduled / published / unpublished) with colored dot.
- "Saved just now / Saving… / Last saved HH:MM" indicator.
- Right side buttons: `Unpublish` (only when published/scheduled), `Schedule…`, `Publish` / `Republish`.

Two-column body `grid-cols-[minmax(0,1fr)_340px]`:

Left (article canvas):
- Language tab row: EN · DE · FR · IT as teal-soft pills; active = primary; disabled + dashed border once `first_published_at` is set. Helper text on the right explains lock state.
- Large title `<input>` (4xl, borderless).
- Excerpt `<textarea>` (lg, muted).
- Featured image dashed placeholder (visual only for MVP — "coming soon").
- Body `<textarea>` (resizable, rounded card style, markdown-friendly).

Right sidebar:
- Publishing card: Status, Language, Published at, Scheduled at, Updated at.
- Danger zone: Delete article (destructive outline button, confirm prompt).

## Wiring (already working, keep intact)
- Load: `supabase.from('articles').select('*').eq('id', id).maybeSingle()`.
- Autosave title/excerpt/content/language with 800 ms debounce; skip first render.
- Publish now: set `status='published'`, `published_at=now`, `first_published_at ??= now`, clear `scheduled_at`.
- Schedule: prompt for datetime, set `status='scheduled'`, `scheduled_at`, `first_published_at ??= dt`.
- Unpublish: set `status='unpublished'`, clear `scheduled_at`.
- Delete: confirm, delete, navigate to `/articles`.
- Language locked once `first_published_at` is set.
- Not-found and loading states preserved.

## List page touch-up (`articles.tsx`)
- Keep `<Link>` rows but add stronger hover (`bg-secondary/60`) and a chevron on the right so it's obviously clickable.
- No behavior change beyond that.

## Out of scope
- Featured image upload, rich-text editor, translations/AI panels, category/author/tags from the reference — the MVP explicitly excludes them.

## Verification
After edits: open `/articles`, click a row, confirm URL changes to `/articles/<id>` and the redesigned editor renders; edit title → "Saving…" → "Saved"; toggle Publish/Unpublish/Schedule; Delete returns to list.