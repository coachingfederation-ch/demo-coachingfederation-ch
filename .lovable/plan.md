## Answers to your four points

**(1) One author column.** Dropped `author_profile_id`. The existing `articles.author_id` stays as the single author column and becomes a FK to `public.profiles(id)` (which itself keys off the authenticated user). It keeps doubling as the RLS ownership column, so existing policies keep working unchanged. Reassigning an author in the editor therefore also transfers row ownership — acceptable here since every CMS user is an editor (see 3).

**(2) SEO fields.** The current `articles` model has no SEO fields — only `title`, `excerpt`, `content`, `category`, `featured_image_url`. Public metadata is derived from title + excerpt. So there is nothing to mirror, and I'm **not** adding SEO columns in this phase; per-locale titles/excerpts already drive per-locale `<title>`/`og:` tags correctly. If you want explicit `seo_title` / `seo_description` overrides, say so and I'll add them symmetrically to both `articles` and `article_translations` plus an SEO block in the editor sidebar.

**(3) RLS on `article_translations`.** Confirmed as a change, not an assumption: policies are `TO authenticated` with `USING (true) / WITH CHECK (true)` for select/insert/update/delete — **any signed-in editor can write any translation**, not only the source article's creator. Public/anon gets SELECT only, restricted to translations whose parent article is published. (Note: `public.articles` itself is still author-scoped from the earlier phase, so an editor can translate an article they cannot edit at source. Tell me if you'd rather I widen `articles` to all editors in the same migration — I'd recommend it for consistency, but it's outside what you asked for.)

**(4) Staleness: timestamp, not fingerprint.** Agreed — hashing was over-engineering. The one real reason to hash is that autosave bumps `articles.updated_at` on *any* edit (category, featured image, schedule), which would flip every locale to "needs refresh" for changes that don't affect translated text. Cheaper fix than hashing: a trigger sets `articles.content_updated_at` only when `title`, `excerpt`, or `content` actually change. Then staleness is a plain comparison: `article_translations.source_updated_at < articles.content_updated_at`. No hashes, no fingerprint column.

---

## Revised plan

### 1. Schema (one migration)

- **`public.profiles`** — `id` (authenticated user id), `first_name`, `last_name`, `email`; auto-created on sign-up by trigger. Readable by authenticated users (author picker) and by anon for name display.
- **`articles`** — `author_id` becomes a FK to `profiles(id)` (single author column); add `content_updated_at` + trigger that touches it only on title/excerpt/content changes; add `category_id` FK.
- **`public.categories`** — `id`, `slug`, `name`, optional `name_de/fr/it`, `sort_order`; seeded with the current five values and backfilled into `articles.category_id` by name. Legacy `category` text kept as read-only fallback.
- **`public.article_translations`** — `article_id`, `locale` (de/fr/it), `title`, `excerpt`, `content`, `state` (`up_to_date` | `needs_refresh`), `source_updated_at`, `manually_edited`, timestamps; unique on (article_id, locale). Missing row = "Not translated".
- GRANTs + RLS on every new table, with the editor-wide translation policies described above.

### 2. Translation workflow

- The language lock is **replaced**: the source row keeps its locale, translations are rows in `article_translations`, so publishing is never blocked by language.
- Editor gains a **Translations** panel: DE / FR / IT with chips *Not translated* / *Up to date* / *Needs refresh*, per-locale **Translate** / **Refresh**, and **Translate all**.
- Staleness is the timestamp comparison from (4). Nothing regenerates automatically.
- Each locale is hand-editable; manual edits set `manually_edited` and refreshing asks for confirmation before overwriting.
- Generation runs in a server function via the Lovable AI Gateway (`LOVABLE_API_KEY` already configured — no setup needed). Per-locale failures are reported individually.

### 3. Admin UI translation (EN/DE/FR/IT)

New `cms.json` namespace per locale in the existing dictionary system covering sign-in, sidebar, list, editor, categories, statuses, buttons and errors, plus a sidebar language switcher persisted in localStorage (the CMS routes are not locale-prefixed). No hardcoded English left in `/auth` or the CMS.

### 4. Categories screen

New `/articles/categories` route and sidebar item: list, create, inline rename, delete. Delete is blocked while articles reference the category, offering reassignment first. The editor's category dropdown reads this table instead of the hardcoded array.

### 5. Editor UX + markdown rendering

- Markdown toolbar over the body field: H2/H3, bold, italic, bullet/numbered list, quote, link, and an info callout (`> [!INFO]`), selection-aware. Storage stays plain markdown.
- Author select (profiles, shown "Surname Name") in the Publishing sidebar.
- Public detail page renders markdown with `react-markdown` + `remark-gfm` (no raw HTML), styled with site tokens, with a callout renderer; author byline on the detail page, falling back to "ICF Switzerland Editorial".

### Technical notes

- New dependencies: `react-markdown`, `remark-gfm`.
- Public fetchers gain a locale-aware join returning the translation when present, falling back to source text.
- No changes to the public read policy semantics, the featured-article trigger, or storage RLS.

### Deliverable

Implementation plus a changelog of schema changes, new routes/components, and confirmation that translation needs no manual setup.
