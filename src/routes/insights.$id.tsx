import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Mark } from "@/components/marks";
import { SiteHeaderBar, SiteFooter } from "@/components/site-chrome";
import { getPublishedArticle } from "@/lib/insights.functions";
import { formatArticleDate, tileFor } from "@/lib/articles";

export const Route = createFileRoute("/insights/$id")({
  loader: async ({ params }) => {
    const article = await getPublishedArticle({ data: { id: params.id } });
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Article not found — ICF Switzerland" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const a = loaderData.article;
    const desc = a.excerpt || "An article from the ICF Switzerland insights collection.";
    const meta: Array<Record<string, string>> = [
      { title: `${a.title} — ICF Switzerland` },
      { name: "description", content: desc },
      { property: "og:title", content: a.title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (a.featured_image_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: a.featured_image_url });
      meta.push({ name: "twitter:image", content: a.featured_image_url });
    }
    return { meta };
  },
  errorComponent: () => (
    <Fallback title="This article could not be loaded" body="Please try again in a moment." />
  ),
  notFoundComponent: () => (
    <Fallback title="Article not found" body="This article may have been unpublished or moved." />
  ),
  component: ArticleDetail,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-7xl px-8 pt-6 pb-8">
          <SiteHeaderBar compact />
        </div>
      </header>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

function Fallback({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-8 py-28 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{body}</p>
        <Link
          to="/insights"
          className="mt-8 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Back to Insights
        </Link>
      </div>
    </Shell>
  );
}

function ArticleDetail() {
  const { article } = Route.useLoaderData();
  const tile = tileFor(article.id);

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-8 pt-16 pb-24">
        <Link to="/insights" className="btn-mono !text-muted-foreground hover:!text-foreground">
          ← Insights
        </Link>
        {article.category ? <p className="section-label mt-6">{article.category}</p> : null}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {article.title}
        </h1>
        <p className="btn-mono mt-5 !text-muted-foreground">
          {formatArticleDate(article.published_at)} · {article.language?.toUpperCase()}
        </p>
        {article.excerpt ? (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
        ) : null}

        <div className="mt-10 overflow-hidden rounded-2xl border border-border/70">
          {article.featured_image_url ? (
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          ) : (
            <div className={"grid aspect-[16/9] w-full place-items-center " + tile.bg + " " + tile.fg}>
              <Mark name={tile.mark} className="h-1/2 w-1/2" />
            </div>
          )}
        </div>

        <div className="mt-10 space-y-5 text-base leading-relaxed">
          {(article.content ?? "")
            .split(/\n{2,}/)
            .filter((p) => p.trim().length > 0)
            .map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
        </div>
      </article>
    </Shell>
  );
}