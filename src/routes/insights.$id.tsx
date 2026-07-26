import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import InsightDetailPage, { ArticleFallback } from "@/pages/InsightDetail";
import { getPublishedArticle } from "@/lib/insights.functions";
import { articleHead } from "@/lib/insight-head";
import { isLocale } from "@/i18n/config";

export const Route = createFileRoute("/insights/$id")({
  loader: async ({ params }) => {
    const article = await getPublishedArticle({ data: { id: params.id, locale: "en" } });
    if (!article) throw notFound();
    if (article.resolvedLocale !== "en" && isLocale(article.resolvedLocale)) {
      throw redirect({
        to: "/$locale/insights/$id",
        params: { locale: article.resolvedLocale, id: params.id } as never,
      });
    }
    return { article };
  },
  head: ({ loaderData, params }) => articleHead(loaderData, "en", params.id),
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
