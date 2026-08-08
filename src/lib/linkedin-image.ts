/**
 * Browser helper for the LinkedIn visual: inlines a remote image so the
 * html-to-image canvas is not tainted by a cross-origin (signed) URL.
 * Exports: toDataUrl. Used by components/cms/LinkedInShareCard.tsx.
 */
/**
 * Reads a remote image as a data URL. Signed Supabase URLs are cross-origin,
 * and a plain <img src> would taint the canvas html-to-image draws into, so
 * the bytes are inlined before rasterising.
 */
export async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
