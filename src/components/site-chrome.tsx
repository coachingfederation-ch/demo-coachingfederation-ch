/**
 * Barrel re-exporting the public API of the site chrome, now split across
 * src/components/chrome/*. Kept as a thin shim so existing imports of
 * `@/components/site-chrome` (SiteHeaderBar, CompactHero, SiteFooter, CARD_SHADOW) keep working.
 */
export { SiteHeaderBar, CompactHero } from "@/components/chrome/Header";
export { SiteFooter } from "@/components/chrome/Footer";
export { CARD_SHADOW } from "@/components/chrome/constants";
