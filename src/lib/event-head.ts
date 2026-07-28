import { localizePath, SITE_URL, type Locale } from "@/i18n/config";
import { makeT } from "@/i18n";

type EventLike = {
  title: string | null;
  summary: string | null;
  image_url: string | null;
};

/** Head metadata for a public event detail page. */
export function eventHead(
  loaderData: { event: EventLike } | undefined,
  locale: Locale,
  slug: string,
) {
  const { t } = makeT(locale);
  if (!loaderData) {
    return {
      meta: [{ title: t("events.detail.notFoundTitle") }, { name: "robots", content: "noindex" }],
    };
  }
  const e = loaderData.event;
  const title = e.title ?? t("events.detail.notFoundTitle");
  const desc = e.summary || t("events.meta.description");
  const url = `${SITE_URL}${localizePath(`/events/${slug}`, locale)}`;
  const meta: Array<Record<string, string>> = [
    { title: `${title} — ICF Switzerland` },
    { name: "description", content: desc },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (e.image_url?.startsWith("https://")) {
    meta.push({ property: "og:image", content: e.image_url });
    meta.push({ name: "twitter:image", content: e.image_url });
  }
  return { meta, links: [{ rel: "canonical", href: url }] };
}
