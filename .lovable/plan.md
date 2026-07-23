## MVP scope (restated)

- Bring the Insights Editor visual design (sidebar Shell, Articles list, Editor) into this project as new routes; leave the public ICF Switzerland site untouched.
- Only **Articles list** and **Editor** are functional. **Categories** and **Settings** are not built and are hidden from the sidebar.
- Single `articles` table in Supabase (Lovable Cloud) — one article, one language. No translation linking, no tags, no categories, no roles.
- Workflow: create → pick language → draft (autosave) → publish now / schedule / unpublish → edit again.
- Language selector is editable only until `first_published_at` is set, then locked.
- Auth: Supabase email/password + Google, matching the ICFS Goal Tracker setup. Everything under an `_authenticated` layout.

## Routes

New file-based routes (public marketing site at `/`, `/about`, `/events`, `/insights`, etc. is untouched):

- `src/routes/auth.tsx` — sign in / sign up (email+password, Google via `lovable.auth.signInWithOAuth`).
- `src/routes/_authenticated/route.tsx` — integration-managed auth gate wrapper.
- `src/routes/_authenticated/articles.tsx` — Articles list (design from Insights Editor `/`).
- `src/routes/_authenticated/articles.$id.tsx` — Editor (design from Insights Editor `/editor`), also used for new articles via `/articles/new` redirect.
- `src/routes/_authenticated/articles.new.tsx` — creates a draft row (language required) then redirects to `/articles/$id`.

`/categories` and `/settings` are intentionally not created. Sidebar shows only Articles + Editor.

## Shared chrome

Port `src/components/Shell.tsx` from Insights Editor, trimmed to two nav items (Articles, Editor). Keep the Insights CMS visual language (sidebar, cards, pills). No changes to the public site's `site-chrome.tsx`.

## Supabase schema (single migration)

```sql
create type public.article_status as enum ('draft','scheduled','published','unpublished');
create type public.article_lang as enum ('en','fr','de','it');

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  language article_lang not null,
  title text not null default '',
  excerpt text not null default '',
  content text not null default '',
  status article_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  first_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;

create policy "authors read own" on public.articles for select to authenticated using (auth.uid() = author_id);
create policy "authors write own" on public.articles for insert to authenticated with check (auth.uid() = author_id);
create policy "authors update own" on public.articles for update to authenticated using (auth.uid() = author_id);
create policy "authors delete own" on public.articles for delete to authenticated using (auth.uid() = author_id);

-- keep updated_at fresh
create or replace function public.tg_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger articles_touch before update on public.articles
  for each row execute function public.tg_touch_updated_at();
```

No categories/tags tables. Author name comes from `auth.users` email (displayed as-is).

## Data access

Direct browser Supabase client (`@/integrations/supabase/client`) from the authenticated routes — RLS restricts to `author_id = auth.uid()`. No server functions required for MVP.

- List: `select id, title, language, status, updated_at from articles order by updated_at desc`.
- Editor load: `select * from articles where id = $id`.
- Autosave: debounced (~800ms) `update` on title/excerpt/content/language; shows "Saving…/Saved just now".
- Publish now: `update` sets `status='published'`, `published_at=now()`, `first_published_at=coalesce(first_published_at, now())`.
- Schedule: modal/date input → `status='scheduled'`, `scheduled_at=<ts>`, sets `first_published_at` on first schedule as well (language lock semantics).
- Unpublish: `status='unpublished'`, clears `scheduled_at`.
- Language selector disabled when `first_published_at is not null`.

Scheduled → published transition is out of MVP scope (no cron); the list simply shows `scheduled` until manually published. Acceptable per "keep it lean".

## Editor UI adjustments vs. imported design

Keep the layout, typography, sidebar, and card shells. Remove/hide the AI/translation-only affordances (no backend):
- Language tabs → single language pill (locked after publish).
- "Write once — AI translates the rest" strip → removed.
- Right sidebar: keep Publishing block (language, publish date/schedule); drop AI assistant, Translations, Tags, Category, Author-select. Author shown as current user email.
- Featured image dropzone → hidden for MVP (no storage).
- Content field → plain `<textarea>` (multi-line, monospaced-friendly); block builder is out of scope.
- Top bar: Draft/Scheduled/Published/Unpublished pill + autosave status + Schedule / Publish / Unpublish buttons depending on state.

Articles list adjustments:
- Columns: Article (title + author email), Language, Status, Updated. Drop Category and Translations columns.
- Filters: All / Drafts / Scheduled / Published / Unpublished (client-side).
- Search: client-side title contains, kept because trivial.
- "New article" button opens a small dialog asking for language, then creates row and routes to `/articles/$id`.

## Auth

- Enable Lovable Cloud, then `supabase--configure_social_auth` for Google.
- `/auth` page: email+password sign in / sign up, "Continue with Google" via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/articles" })`.
- Auth gate at `src/routes/_authenticated/route.tsx` (integration-managed pattern).
- `onAuthStateChange` wired once in `__root.tsx` (identity events only), invalidating router/query on sign in/out.
- Sign-out button in the Shell footer replaces the placeholder "Editor Name" card.

## Files touched

**New**
- `src/routes/auth.tsx`
- `src/routes/_authenticated/route.tsx` (managed)
- `src/routes/_authenticated/articles.tsx`
- `src/routes/_authenticated/articles.new.tsx`
- `src/routes/_authenticated/articles.$id.tsx`
- `src/components/cms/Shell.tsx` (ported + trimmed)
- `supabase/migrations/<ts>_articles.sql`

**Modified**
- `src/routes/__root.tsx` — add `onAuthStateChange` wiring.
- `src/styles.css` — port the CMS-specific tokens used by the Shell (`--teal`, `--teal-soft`, `--warn`, `--warn-soft`, `--shadow-soft`) if not already present.

## Out of scope (MVP)

- Categories, Tags, Settings pages and tables.
- Translations, AI actions, block editor, featured image upload.
- Multi-role permissions, editorial approval.
- Automatic scheduled→published cron.
- Any change to the public marketing site or its routes.
