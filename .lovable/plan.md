## 1. Unsplash image picker (featured image)

**Where:** the "Featured image" block in the article editor sidebar, next to the existing upload and "paste a URL" options — a third option, "Search Unsplash", opening a dialog with a search field, a result grid, and pagination.

**How it works**
- A server function `searchUnsplash` (`src/lib/unsplash.functions.ts`) calls `GET https://api.unsplash.com/search/photos` with the access key read from `process.env` inside the handler. The key never reaches the browser.
- Results show thumbnails plus photographer name; picking one sets `featured_image_url` to the `urls.regular` link and stores the attribution.
- Unsplash's API terms require two things we will honour:
  - a `POST` to the photo's `links.download_location` when a picture is chosen (a second server function, `trackUnsplashDownload`);
  - a visible credit "Photo by X on Unsplash" with UTM links, shown under the image in the editor sidebar and on the public article page.

**Database:** one migration adding three nullable columns to `public.articles` — `image_credit_name`, `image_credit_url`, `image_source` ('upload' | 'unsplash' | 'url'). Existing grants and RLS policies stay unchanged; no new tables.

**Credentials:** I'll request `UNSPLASH_ACCESS_KEY` through the secure secrets form when we start building (the application ID and secret key aren't needed for public photo search). If you'd rather also store them, say so and I'll include them.

**Localisation:** new CMS strings ("Search Unsplash", "Search photos…", "Photo by {name} on Unsplash", "No results", "Load more") added to all four `cms.json` dictionaries.

## 2. Callout redesign — three shades + emoji

**Current state:** `> [!note]` renders as a flat grey box; the marker is stripped and only a single paragraph of plain text survives, so bold, links and lists inside a callout are lost.

**New Markdown syntax** (backwards compatible with existing `[!note]` / `[!info]` / `[!tip]` / `[!warning]` articles):

```text
> [!info] 💡
> Body text, **formatting** and [links](https://…) all keep working.
```

Three shades, all built from existing design tokens (no hardcoded colours):
- `info` — neutral/lavender surface, indigo left accent (default; `note`/`tip` map here)
- `highlight` — warm accent shade using the yellow mark token
- `warning` — stronger accent shade using the blue/indigo mark token

Visual treatment: rounded-2xl surface, tinted border, coloured left rail, emoji in a circular chip at the top-left, body text flowing beside it.

**Renderer** (`src/components/markdown.tsx`): parse the `[!shade]` marker plus an optional leading emoji from the first paragraph, strip only those characters, and render the remaining children through the normal Markdown component map so nested formatting survives.

**Editor toolbar** (`src/components/cms/MarkdownToolbar.tsx`): the callout button becomes a small popover — pick one of the three shades (colour swatches) and optionally an emoji from a compact set (💡 ⭐ ⚠️ ✅ 📌 🎯 ❤️ 🔍, plus a free-text field for any other emoji) — then inserts the block wrapping the current selection.

**Preview parity:** the callout styling lives in one shared component used by both the public article renderer and the editor's rendered view, so what an editor picks is what publishes.

## Out of scope
Unsplash images are hot-linked from Unsplash's CDN (as their terms require), not copied into our storage. Existing uploaded images and their signed URLs are untouched.
