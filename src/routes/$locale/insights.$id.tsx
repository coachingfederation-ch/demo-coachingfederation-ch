import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import InsightDetailPage, { ArticleFallback } from "@/pages/InsightDetail";
import { getPublishedArticle } from "@/lib/insights.functions";
import { articleHead } from "@/lib/insight-head";
import { isLocale, type Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/insights/$id")({
  loader: async ({ params }) => {
    const locale = (isLocale(params.locale) ? params.locale : "en") as Locale;
    const article = await getPublishedArticle({ data: { id: params.id, locale } });
    if (!article) throw notFound();
    if (article.resolvedLocale !== locale) {
      const lang = isLocale(article.resolvedLocale) ? article.resolvedLocale : "en";
      throw redirect({
        to: lang === "en" ? "/insights/$id" : "/$locale/insights/$id",
        params: lang === "en" ? { id: params.id } : ({ locale: lang, id: params.id } as never),
      });
    }
    return { article };
  },
  head: ({ loaderData, params }) => articleHead(loaderData, params.locale as Locale, params.id),
  errorComponent: () => (
    <ArticleFallback titleKey="insights.detail.errorTitle" bodyKey="insights.detail.errorBody" />
  ),
  notFoundComponent: () => (
    <ArticleFallback titleKey="insights.detail.notFoundTitle" bodyKey="insights.detail.notFoundBody" />
  ),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { article } = Route.useLoaderData();
  return <InsightDetailPage article={article} />;
}