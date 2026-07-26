import { Mark } from "@/components/marks";
import { SiteHeaderBar, SiteFooter } from "@/components/site-chrome";
import { formatArticleDate, tileFor, type PublicArticle } from "@/lib/articles";
import { LocaleLink, useI18n } from "@/i18n";

export function DetailShell({ children }: { children: React.ReactNode }) {
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

export function ArticleFallback({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const { t } = useI18n();
  return (
    <DetailShell>
      <div className="mx-auto max-w-3xl px-8 py-28 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t(bodyKey)}</p>
        <LocaleLink
          to="/insights"
          className="mt-8 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          {t("insights.detail.backCta")}
        </LocaleLink>
      </div>
    </DetailShell>
  );
}

export default function InsightDetailPage({
  article,
}: {
  article: PublicArticle & { content?: string | null };
}) {
  const { t } = useI18n();
  const tile = tileFor(article.id);

  return (
    <DetailShell>
      <article className="mx-auto max-w-3xl px-8 pt-16 pb-24">
        <LocaleLink to="/insights" className="btn-mono !text-muted-foreground hover:!text-foreground">
          {t("insights.detail.back")}
        </LocaleLink>
        {article.category ? <p className="section-label mt-6">{article.category}</p> : null}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
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
          {String(article.content ?? "")
            .split(/\n{2,}/)
            .filter((p: string) => p.trim().length > 0)
            .map((p: string, i: number) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
        </div>
      </article>
    </DetailShell>
  );
}