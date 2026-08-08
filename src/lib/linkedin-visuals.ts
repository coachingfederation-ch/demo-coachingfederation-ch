/**
 * Brush-mark compositions used by the LinkedIn share visual.
 * Exports: LINKEDIN_MARK_COMPOSITIONS, linkedInVariantIndex.
 * Client-safe so the dialog preview and the rasterised card agree.
 *
 * Composition rules (brand guide + golden ratio):
 * - The card is 1200x742 (1:1.618). The text column occupies the left 61.8%
 *   (742px); every mark lives in the right 38.2% column so nothing ever sits
 *   under the kicker, headline or chapter name.
 * - Two marks max: a primary at 400px (~0.54 of the card height) and a
 *   secondary at 247px (400/1.618), both fully inside a 46px safe margin.
 * - At most three accent colours, Blue / Light Blue / Yellow on Deep Blue.
 */
import type { MarkName } from "@/components/marks";

const BLUE = "text-[#2B379B]";
const LIGHT = "text-[#5778FA]";
const YELLOW = "text-[#EFCB30]";

/** Golden-ratio placement slots inside the right-hand 38.2% column. */
const PRIMARY_HIGH = "absolute right-[46px] top-[46px] h-[400px] w-[400px]";
const PRIMARY_LOW = "absolute right-[46px] top-[248px] h-[400px] w-[400px]";
const SECONDARY_LOW = "absolute right-[92px] bottom-[46px] h-[247px] w-[247px]";
const SECONDARY_HIGH = "absolute right-[92px] top-[46px] h-[247px] w-[247px]";
const SECONDARY_EDGE = "absolute right-[286px] top-[171px] h-[247px] w-[247px]";

export type MarkPlacement = { name: MarkName; className: string };

export type LinkedInMarkComposition = {
  /** Decorative marks in the right-hand column (max two). */
  items: MarkPlacement[];
};

export const LINKEDIN_MARK_COMPOSITIONS: LinkedInMarkComposition[] = [
  {
    items: [
      { name: "circular2", className: `${PRIMARY_HIGH} ${BLUE}` },
      { name: "asterisk2", className: `${SECONDARY_LOW} ${YELLOW}` },
    ],
  },
  {
    items: [
      { name: "arrow2", className: `${PRIMARY_LOW} ${LIGHT}` },
      { name: "star3", className: `${SECONDARY_HIGH} ${YELLOW}` },
    ],
  },
  {
    items: [
      { name: "circular3", className: `${PRIMARY_HIGH} ${LIGHT}` },
      { name: "star1", className: `${SECONDARY_LOW} ${BLUE}` },
    ],
  },
  {
    items: [
      { name: "asterisk4", className: `${PRIMARY_LOW} ${YELLOW}` },
      { name: "other3", className: `${SECONDARY_HIGH} ${BLUE}` },
    ],
  },
  {
    items: [
      { name: "highlight2", className: `${PRIMARY_HIGH} ${BLUE}` },
      { name: "arrow3", className: `${SECONDARY_EDGE} ${LIGHT}` },
    ],
  },
  {
    items: [
      { name: "star2", className: `${PRIMARY_LOW} ${BLUE}` },
      { name: "asterisk1", className: `${SECONDARY_HIGH} ${YELLOW}` },
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
