/**
 * Brush-mark model for the LinkedIn share visual.
 * Exports: BRUSH_PALETTE, MARK_COLORS, PlacedMark, suggestedLayout,
 * clampMark, sanitizeMarkLayout, LINKEDIN_MARK_LIMIT and the placement bounds.
 * Client-safe: the dialog preview, the interactive editor and the rasterised
 * card all read the same percentage-based geometry, so what the publisher
 * arranges is exactly what gets posted.
 */
import type { MarkName } from "@/components/marks";
import { LINKEDIN_CARD_HEIGHT, LINKEDIN_CARD_WIDTH } from "./linkedin";

/** The three brand accent colours a mark may take. */
export const MARK_COLORS = ["#2B379B", "#5778FA", "#EFCB30"] as const;
export type MarkColor = (typeof MARK_COLORS)[number];

/** Five brushes, each with a distinct visual role. */
export const BRUSH_PALETTE: { id: string; name: MarkName; label: string }[] = [
  { id: "circle", name: "circular2", label: "Circle sweep" },
  { id: "arrow", name: "arrow2", label: "Arrow" },
  { id: "asterisk", name: "asterisk2", label: "Asterisk" },
  { id: "star", name: "star1", label: "Star" },
  { id: "highlight", name: "highlight2", label: "Highlight bar" },
];

/** At most three marks per card (brand guide). */
export const LINKEDIN_MARK_LIMIT = 3;

/** A mark placed by hand. Geometry is in % of the card so scale never matters. */
export type PlacedMark = {
  id: string;
  name: MarkName;
  /** Top-left corner, in % of card width / height. */
  xPct: number;
  yPct: number;
  /** Square box width, in % of card width. */
  sizePct: number;
  color: MarkColor;
};

const MARGIN_PX = 46;
const MIN_SIZE_PX = 160;
const MAX_SIZE_PX = 520;

export const MARK_MIN_SIZE_PCT = (MIN_SIZE_PX / LINKEDIN_CARD_WIDTH) * 100;
export const MARK_MAX_SIZE_PCT = (MAX_SIZE_PX / LINKEDIN_CARD_WIDTH) * 100;
const MARGIN_X_PCT = (MARGIN_PX / LINKEDIN_CARD_WIDTH) * 100;
const MARGIN_Y_PCT = (MARGIN_PX / LINKEDIN_CARD_HEIGHT) * 100;

/** Square box: its height in % of the card height. */
export function markHeightPct(sizePct: number) {
  return (sizePct * LINKEDIN_CARD_WIDTH) / LINKEDIN_CARD_HEIGHT;
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Keeps a mark sized sensibly and fully inside the safe margin. */
export function clampMark(mark: PlacedMark): PlacedMark {
  const maxByHeight = ((100 - 2 * MARGIN_Y_PCT) * LINKEDIN_CARD_HEIGHT) / LINKEDIN_CARD_WIDTH;
  const sizePct = clampNumber(
    mark.sizePct,
    MARK_MIN_SIZE_PCT,
    Math.min(MARK_MAX_SIZE_PCT, 100 - 2 * MARGIN_X_PCT, maxByHeight),
  );
  const hPct = markHeightPct(sizePct);
  return {
    ...mark,
    sizePct,
    xPct: clampNumber(mark.xPct, MARGIN_X_PCT, 100 - MARGIN_X_PCT - sizePct),
    yPct: clampNumber(mark.yPct, MARGIN_Y_PCT, 100 - MARGIN_Y_PCT - hPct),
  };
}

/** The headline / kicker column: the left 61.8% below the logo. */
export function overlapsText(mark: PlacedMark): boolean {
  return mark.xPct < 61.8 && mark.yPct + markHeightPct(mark.sizePct) > 40;
}

let counter = 0;
const nextId = () => `mark-${Date.now().toString(36)}-${(counter += 1)}`;

/** A new mark dropped in the right-hand column at a comfortable size. */
export function createMark(name: MarkName, index: number): PlacedMark {
  return clampMark({
    id: nextId(),
    name,
    xPct: 64 + (index % 2) * 6,
    yPct: 8 + (index % 3) * 22,
    sizePct: 30,
    color: MARK_COLORS[index % MARK_COLORS.length]!,
  });
}

type Recipe = { name: MarkName; xPct: number; yPct: number; sizePct: number; color: MarkColor };

/** Curated golden-ratio starting points, all clear of the text column. */
const SUGGESTIONS: Recipe[][] = [
  [
    { name: "circular2", xPct: 62, yPct: 6, sizePct: 33, color: "#2B379B" },
    { name: "asterisk2", xPct: 70, yPct: 55, sizePct: 20, color: "#EFCB30" },
  ],
  [
    { name: "arrow2", xPct: 63, yPct: 30, sizePct: 33, color: "#5778FA" },
    { name: "star3", xPct: 76, yPct: 6, sizePct: 20, color: "#EFCB30" },
  ],
  [
    { name: "circular3", xPct: 61, yPct: 8, sizePct: 34, color: "#5778FA" },
    { name: "star1", xPct: 72, yPct: 56, sizePct: 21, color: "#2B379B" },
  ],
  [
    { name: "highlight2", xPct: 62, yPct: 10, sizePct: 34, color: "#2B379B" },
    { name: "arrow3", xPct: 68, yPct: 52, sizePct: 22, color: "#5778FA" },
  ],
  [
    { name: "star2", xPct: 63, yPct: 26, sizePct: 32, color: "#2B379B" },
    { name: "asterisk1", xPct: 74, yPct: 6, sizePct: 20, color: "#EFCB30" },
  ],
  [
    { name: "asterisk4", xPct: 62, yPct: 28, sizePct: 33, color: "#EFCB30" },
    { name: "other3", xPct: 74, yPct: 6, sizePct: 21, color: "#2B379B" },
  ],
];

/** Deterministic per-article seed so the first open always looks the same. */
export function linkedInVariantIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % SUGGESTIONS.length;
}

/** One curated composition, ready to be nudged by hand. */
export function suggestedLayout(variant: number): PlacedMark[] {
  const index = ((variant % SUGGESTIONS.length) + SUGGESTIONS.length) % SUGGESTIONS.length;
  return SUGGESTIONS[index]!.map((recipe) => clampMark({ id: nextId(), ...recipe }));
}

/** Defensive read of a persisted layout (jsonb from the database). */
export function sanitizeMarkLayout(value: unknown): PlacedMark[] | null {
  if (!Array.isArray(value)) return null;
  const marks = value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .slice(0, LINKEDIN_MARK_LIMIT)
    .map((item, index) => {
      const color = MARK_COLORS.includes(item.color as MarkColor)
        ? (item.color as MarkColor)
        : MARK_COLORS[0]!;
      return clampMark({
        id: typeof item.id === "string" ? item.id : `mark-restored-${index}`,
        name: item.name as MarkName,
        xPct: Number(item.xPct) || 0,
        yPct: Number(item.yPct) || 0,
        sizePct: Number(item.sizePct) || MARK_MIN_SIZE_PCT,
        color,
      });
    })
    .filter((mark) => typeof mark.name === "string" && mark.name.length > 0);
  return marks;
}
