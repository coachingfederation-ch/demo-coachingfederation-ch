/**
 * Brush-mark compositions used by the LinkedIn share visual.
 * Exports: LINKEDIN_MARK_COMPOSITIONS, linkedInVariantIndex.
 * Client-safe so the dialog preview and the rasterised card agree.
 *
 * Rules kept deliberately tight (brand guide): at most two marks per card,
 * every mark fully inside the frame with a safe margin, nothing smaller than
 * roughly a quarter of the card height, and no more than three accent colours.
 */
import type { MarkName } from "@/components/marks";

const BLUE = "text-[#2B379B]";
const LIGHT = "text-[#5778FA]";
const YELLOW = "text-[#EFCB30]";

export type MarkPlacement = { name: MarkName; className: string };

export type LinkedInMarkComposition = {
  /** Short accent stroke under the headline. */
  accent: MarkPlacement;
  /** Decorative marks behind the text block (max two). */
  items: MarkPlacement[];
};

export const LINKEDIN_MARK_COMPOSITIONS: LinkedInMarkComposition[] = [
  {
    accent: { name: "line2", className: `mt-8 block h-8 w-80 ${LIGHT}` },
    items: [
      { name: "circular2", className: `absolute right-12 top-14 h-[380px] w-[380px] ${BLUE}` },
      { name: "asterisk2", className: `absolute bottom-28 right-20 h-44 w-44 ${YELLOW}` },
    ],
  },
  {
    accent: { name: "stroke2", className: `mt-8 block h-8 w-96 ${YELLOW}` },
    items: [
      { name: "arrow2", className: `absolute right-16 top-24 h-72 w-72 ${LIGHT}` },
      { name: "star3", className: `absolute bottom-32 right-24 h-40 w-40 ${BLUE}` },
    ],
  },
  {
    accent: { name: "line4", className: `mt-8 block h-8 w-80 ${YELLOW}` },
    items: [
      { name: "circular3", className: `absolute right-14 top-16 h-[400px] w-[400px] ${LIGHT}` },
      { name: "star1", className: `absolute bottom-28 right-16 h-48 w-48 ${BLUE}` },
    ],
  },
  {
    accent: { name: "stroke4", className: `mt-8 block h-8 w-72 ${LIGHT}` },
    items: [
      { name: "asterisk4", className: `absolute right-16 top-20 h-72 w-72 ${YELLOW}` },
      { name: "other3", className: `absolute bottom-24 right-20 h-56 w-56 ${BLUE}` },
    ],
  },
  {
    accent: { name: "line3", className: `mt-8 block h-8 w-80 ${YELLOW}` },
    items: [
      { name: "highlight2", className: `absolute right-14 top-20 h-64 w-[420px] ${BLUE}` },
      { name: "arrow3", className: `absolute bottom-28 right-20 h-52 w-52 ${LIGHT}` },
    ],
  },
  {
    accent: { name: "stroke3", className: `mt-8 block h-8 w-72 ${LIGHT}` },
    items: [
      { name: "star2", className: `absolute right-16 top-16 h-[340px] w-[340px] ${BLUE}` },
      { name: "asterisk1", className: `absolute bottom-24 right-24 h-44 w-44 ${YELLOW}` },
    ],
  },
];

/**
 * Stable per-article starting composition: the same article always opens with
 * the same visual, so the preview matches what is posted.
 */
export function linkedInVariantIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % LINKEDIN_MARK_COMPOSITIONS.length;
}