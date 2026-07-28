/**
 * Storage buckets and signed-URL lifetimes — the single place these values are
 * declared.
 *
 * Both buckets are private. Nothing is ever served from a public object URL:
 * every read goes through a signed URL minted for a caller that has already
 * passed an access check (the public directory view for coach photos, the
 * staff CMS for article images). Keeping the names and TTLs here means a
 * change to that policy is one edit, not three.
 *
 * This module is client-safe: it holds constants only, no Supabase client.
 * Server-side signing helpers live in `storage.server.ts`.
 */

/** Member profile photos. Private; read via short-lived signed URLs. */
export const PROFILE_IMAGE_BUCKET = "member-profile-images";

/** CMS article images. Private; the signed URL is persisted on the article. */
export const ARTICLE_IMAGE_BUCKET = "article-images";

/**
 * Public directory listings: 24h.
 *
 * The URL only ever leaves the server for rows `coach_directory_public`
 * already cleared as published + eligible, and a day-long window keeps
 * re-signing cost off every page view.
 */
export const PROFILE_IMAGE_TTL_SECONDS = 60 * 60 * 24;

/**
 * A member previewing their own photo in the editor: 1h.
 *
 * Deliberately shorter than the public TTL — this URL is minted in the browser
 * for one editing session, not cached in a rendered page.
 */
export const PROFILE_IMAGE_PREVIEW_TTL_SECONDS = 60 * 60;

/**
 * Article images: 10 years.
 *
 * Known debt. The signed URL is written into `articles.featured_image_url` and
 * rendered on the public site, so it must outlive the article; a long TTL is
 * the stand-in for a public bucket or an image proxy. See docs/tech-debt.md.
 */
export const ARTICLE_IMAGE_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;
