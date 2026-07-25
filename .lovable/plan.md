## Goal

Make the public Insights page render real published articles from the backend, add a public article detail page, add an explicit single-article "Featured" flag, give the editor control of the featured image and category, and scope image storage permissions to each article's author.

## 1. Database changes

Migration on `public.articles`:
- `featured_image_url text` (nullable)
- `category text` (nullable), constrained to: Leadership, AI & Coaching, Diversity, Future of Work, Research
- `is_featured boolean not null default false`

Single-featured enforcement:
- Partial unique index on `is_featured` where `is_featured = true`, so at most one row can ever be featured.
- A `before insert or update` trigger: when a row is set to featured, it clears `is_featured` on any other article in the same transaction, so flipping the toggle never fails with a uniqueness error.

No changes to existing article read policies or grants.

Storage:
- Create a public `article-images` bucket.
- Files stored under an article-scoped path: `<article_id>/<filename>`.
- RLS on `storage.objects` for this bucket:
  - Anyone can read.
  - Insert / update / delete only when the first path segment is the id of an article whose `author_id = auth.uid()` — a signed-in user can only touch images for articles they authored.

## 2. Public Insights page (`src/routes/insights.tsx`)

- Fetch published articles (`status = 'published'`), ordered by `published_at` descending, selecting public-safe columns (id, title, excerpt, category, featured_image_url, is_featured, published_at, language).
- Featured slot: the published article with `is_featured = true`; if none is flagged, fall back to the newest published article.
- Recent articles grid: the remaining published articles in `published_at` descending order, excluding whichever article occupies the Featured slot.
- Topic pills filter by the real `category` value; "All" shows everything.
- Image handling: render `featured_image_url` when set; otherwise fall back to the existing decorative Mark tile (deterministic colour/mark rotation so cards stay varied).
- Loading: skeleton featured card + 6 skeleton grid cards using the same shapes.
- Empty state: centred "No published articles yet" card, plus a lighter message when a filter matches nothing.
- Cards link to the new detail route instead of `href="#"`.
- Layout, spacing, typography, chips, shadows and the newsletter section stay exactly as they are.

## 3. New public article detail page (`src/routes/insights.$id.tsx`)

- URL: `/insights/<article id>`.
- Loads one article by id where `status = 'published'`. Anything else (missing, draft, scheduled, unpublished) renders the not-found state — unpublished content is never exposed.
- Layout in the existing site style: compact header with category eyebrow and title, publication date, featured image (or Mark fallback tile), lead paragraph, then the body in readable prose typography with preserved paragraph breaks.
- "Back to Insights" link and the same site footer.
- Per-route `head()`: article title, excerpt as description, og:title / og:description / og:type=article, twitter:card, plus og:image / twitter:image when a featured image URL exists. Not-found state gets a generic title plus `robots: noindex`.
- Featured and grid cards on `/insights` navigate here via `<Link to="/insights/$id" params={{ id }}>`.

## 4. Editor (`src/routes/_authenticated/articles.$id.tsx`)

- Replace the dashed "Featured image — coming soon" box with a real control: current image with a Remove button, or an upload zone plus a "paste image URL" input. Uploads go to `article-images/<article id>/…`; the public URL is stored in `featured_image_url`.
- Add a Category select (five categories plus "None") in the Publishing sidebar.
- Add a **Featured** toggle in the Publishing sidebar:
  - Turning it on sets `is_featured = true`; the database automatically un-features whichever article previously held the slot.
  - Before switching, the editor looks up the current holder and, after a successful save, shows a confirmation note naming it — e.g. "This article is now featured on Insights. 'Previous title' is no longer featured."
  - When no other article held it, the note simply confirms this article is now featured.
  - Turning it off clears the flag, leaving no explicitly featured article (Insights then falls back to the newest published one).
- Featured image, category and the featured toggle persist through the existing 800 ms debounce autosave; uploads and the toggle write immediately.
- Publish / schedule / unpublish / delete / language-lock behaviour untouched.

## Technical notes

- Public reads use the browser Supabase client via TanStack Query (the existing anon "published only" policy already covers this); no new server functions, no changes to article read policies.
- The detail route defines `errorComponent` and `notFoundComponent` alongside its data read.
- Category values are enforced by a CHECK constraint and shared with the frontend as a typed constant.
- Storage policies use `storage.foldername(name)[1]` cast to uuid, joined against `public.articles.author_id`.
- The un-feature trigger runs `security definer` so it can clear another author's article's flag while remaining scoped to the `is_featured` column only.
