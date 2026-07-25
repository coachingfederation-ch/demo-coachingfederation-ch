import type { MarkName } from "@/components/marks";

export const ARTICLE_CATEGORIES = [
  "Leadership",
  "AI & Coaching",
  "Diversity",
  "Future of Work",
  "Research",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface PublicArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string | null;
  featured_image_url: string | null;
  is_featured: boolean;
  published_at: string | null;
  language: string;
}

export const PUBLIC_ARTICLE_COLUMNS =
  "id, title, excerpt, category, featured_image_url, is_featured, published_at, language";

const TILES: { bg: string; fg: string; mark: MarkName }[] = [
  { bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { bg: "bg-mark-blue", fg: "text-mark-cream", mark: "circular2" },
  { bg: "bg-mark-indigo", fg: "text-mark-yellow", mark: "asterisk3" },
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "arrow1" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "arrow2" },
];

/** Deterministic decorative tile for articles without a featured image. */
export function tileFor(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return TILES[sum % TILES.length];
}

export function formatArticleDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}