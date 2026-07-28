/**
 * Server-side storage signing.
 *
 * Uses the admin client, so callers must have already established that the
 * requester may see the object. A signing outage is never allowed to break a
 * page: every helper degrades to "no URL" rather than throwing.
 */
import { PROFILE_IMAGE_BUCKET, PROFILE_IMAGE_TTL_SECONDS } from "./storage";

/**
 * Batch-sign storage paths. Returns a path -> URL map; paths that fail to sign
 * are simply absent from the map.
 */
export async function signStoragePaths(
  bucket: string,
  paths: string[],
  ttlSeconds: number,
): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  const signed = new Map<string, string>();
  if (!unique.length) return signed;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrls(unique, ttlSeconds);
    if (error) return signed;
    for (const row of data ?? []) {
      if (row.path && row.signedUrl && !row.error) signed.set(row.path, row.signedUrl);
    }
  } catch {
    // Fall through: callers render a fallback (initials, placeholder).
  }
  return signed;
}

/**
 * Sign member profile photos for public rendering. Called only with paths taken
 * from rows the public directory view already returned, never from client input.
 */
export function signProfileImages(paths: string[]): Promise<Map<string, string>> {
  return signStoragePaths(PROFILE_IMAGE_BUCKET, paths, PROFILE_IMAGE_TTL_SECONDS);
}
