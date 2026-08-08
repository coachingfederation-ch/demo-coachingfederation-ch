/**
 * Shared, client-safe types and helpers for the "Publish to LinkedIn" action.
 * Exports: LinkedInImageMode, LinkedInPostRecord, LINKEDIN_COMMENTARY_LIMIT,
 * LINKEDIN_CARD_WIDTH/HEIGHT, linkedInPostUrl. Used by the CMS UI and the
 * LinkedIn server functions.
 */

/** Which visual the publisher chose for the post image. */
export type LinkedInImageMode = "feature" | "marks";

/** LinkedIn's hard limit for post commentary. */
export const LINKEDIN_COMMENTARY_LIMIT = 3000;

/**
 * Square 1:1 artwork — it takes the most vertical space in the LinkedIn feed
 * on mobile and matches the chapter's recent posts.
 */
export const LINKEDIN_CARD_WIDTH = 1200;
export const LINKEDIN_CARD_HEIGHT = 1200;

/** One posting attempt, as stored in `article_linkedin_posts`. */
export type LinkedInPostRecord = {
  id: string;
  status: "pending" | "posted" | "failed";
  linkedin_post_urn: string | null;
  linkedin_post_url: string | null;
  posted_at: string | null;
  commentary: string;
  image_mode: string;
  error_message: string | null;
  created_at: string;
};

/** Public permalink for a share URN. */
export function linkedInPostUrl(urn: string) {
  return `https://www.linkedin.com/feed/update/${encodeURIComponent(urn)}/`;
}
