# Publish to LinkedIn — publisher action for published articles

Give publishers a one-click way to share a published Insights article on the chapter's LinkedIn company page: an ICF-branded visual, a short LinkedIn-ready summary, the canonical article URL — reviewed and edited in a preview dialog, posted only after explicit confirmation, and recorded against the article.

## What the publisher sees

1. On an article with status `published`, the editor sidebar shows a **Share on LinkedIn** card.
   - Not yet posted: a "Prepare LinkedIn post" button.
   - Already posted: date, status, and a link to the live LinkedIn post; re-posting requires an explicit "Post again" confirm.
   - Only publishers/admins see the action (same rights as publishing).
2. Clicking opens a preview dialog laid out like a LinkedIn post:
   - **Visual**: a branded card rendered live — Deep Blue panel, chapter lockup, article title, brush marks, and the article's feature image when it has one (image-less articles fall back to a marks-only Deep Blue card). Publisher can toggle between "feature image" and "marks only".
   - **Summary**: an AI-drafted, LinkedIn-ready text (hook, 2-3 short lines, closing CTA, up to 3 hashtags) in the article's language, fully editable, with a live character counter (3,000 limit).
   - **Link**: the canonical article URL (locale-correct), shown read-only.
3. Nothing is sent until the publisher presses **Post to LinkedIn**. Success shows the post URL; failures show LinkedIn's own message and change nothing.

## Connection

LinkedIn is available as a gateway-backed App connector. During implementation the connect card is opened for `linkedin`, and the connection must be authorised by an admin of the chapter's LinkedIn company page with organization posting rights (`w_organization_social`, `r_organization_admin`). The target organisation URN is stored once in a small settings row so posts are always attributed to the chapter page, never to a personal profile.

## Technical notes

**Data** — new table `public.article_linkedin_posts` (one row per attempt, newest wins for display):
`id`, `article_id` (FK), `status` (`pending | posted | failed`), `linkedin_post_urn`, `linkedin_post_url`, `posted_at`, `commentary`, `image_mode`, `error_message`, `created_by`, timestamps. GRANTs plus RLS: SELECT for staff roles, writes only through server functions (service-role path); no `anon` access. Organisation URN lives in a single-row `linkedin_config` table, admin-managed.

**Image** — the branded card is composed in the browser as a real DOM node (existing tokens, marks and lockup) and rasterised to a 1200×627 PNG with `html-to-image`; the Worker runtime cannot run `sharp`/`canvas`. The PNG is sent to the server as base64 only on confirm.

**Server** — `src/lib/linkedin.functions.ts` (thin wrappers) + `src/lib/linkedin.server.ts`:
- `draftLinkedInPost` — publisher-gated; drafts the summary through the Lovable AI Gateway (`google/gemini-3-flash-preview`) from title/excerpt/content and returns draft text + canonical URL.
- `publishArticleToLinkedIn` — publisher-gated; validates input, initialises a LinkedIn image upload through the connector gateway, uploads the PNG bytes, creates the post with commentary + image + article link, then records the row. Every non-OK response is logged with status + body and surfaced verbatim; a failure writes a `failed` row instead of a `posted` one.
- Rights reuse the existing four-eye permission loader (`publisher` grant or `admin`); a non-publisher call is rejected server-side, not just hidden in the UI.

**UI** — `src/components/cms/LinkedInShareCard.tsx` (sidebar card) and `LinkedInPostDialog.tsx` (preview, editable text, image toggle, confirm), wired into `ArticleMetaSidebar.tsx`. All strings added to the four `cms.json` locale files.

**Docs** — `docs/article-publishing.md` gains a "Sharing to LinkedIn" section.

## PR note

- **Summary** — Adds a publisher-only "Publish to LinkedIn" action for published Insights articles: branded visual, AI-drafted editable summary, canonical URL, explicit confirm, and a stored post record.
- **Changes** — CMS sidebar card + preview dialog; branded card renderer; LinkedIn server functions (draft + publish) via the connector gateway; i18n strings for de/fr/it/en; docs update.
- **Backend / schema** — new `article_linkedin_posts` and `linkedin_config` tables with GRANTs and RLS; no changes to `articles`.
- **Testing & verification** — publisher, editor (must not see the action) and admin paths; article with and without a feature image; draft/scheduled articles (action hidden); a forced LinkedIn API error to confirm the failure row and message; character-limit edge cases.
- **Risks & rollback** — blast radius limited to the article editor sidebar; reverting the code leaves the two tables in place harmlessly. Posting is irreversible on LinkedIn's side, hence the mandatory confirm step.
- **Follow-ups** — no scheduling of LinkedIn posts, no deleting a post from the CMS, no per-locale multi-posting in this iteration.
