import { localizePath, SITE_URL, type Locale } from "@/i18n/config";
import { makeT } from "@/i18n";

type ArticleLike = {
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
};

export function articleHead(
  loaderData: { article: ArticleLike } | undefined,
  locale: Locale,
  id: string,
) {
  const { t } = makeT(locale);
  if (!loaderData) {
    return {
      meta: [
        { title: t("insights.detail.notFoundMetaTitle") },
        { name: "robots", content: "noindex" },
      ],
    };
  }
  const a = loaderData.article;
  const desc = a.excerpt || t("insights.detail.fallbackDescription");
  const url = `${SITE_URL}${localizePath(`/insights/${id}`, locale)}`;
  const meta: Array<Record<string, string>> = [
    { title: `${a.title} — The Switzerland Chapter of ICF` },
    { name: "description", content: desc },
    { property: "og:title", content: a.title },
    { property: "og:description", content: desc },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (a.featured_image_url?.startsWith("https://")) {
    meta.push({ property: "og:image", content: a.featured_image_url });
    meta.push({ name: "twitter:image", content: a.featured_image_url });
  }
  return { meta, links: [{ rel: "canonical", href: url }] };
}
