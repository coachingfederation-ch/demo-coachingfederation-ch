import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Mark } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import {
  ARTICLE_CATEGORIES,
  PUBLIC_ARTICLE_COLUMNS,
  formatArticleDate,
  tileFor,
  type PublicArticle,
} from "@/lib/articles";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Insights — ICF Switzerland" },
      { name: "description", content: "Ideas, research and stories from the Swiss coaching community — on leadership, AI, diversity and the future of work." },
      { property: "og:title", content: "Insights — ICF Switzerland" },
      { property: "og:description", content: "Ideas, research and stories from the Swiss coaching community — on leadership, AI, diversity and the future of work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

const topics = ["All", ...ARTICLE_CATEGORIES];

async function fetchPublishedArticles(): Promise<PublicArticle[]> {
  const { data, error } = await supabase
    .from("articles")
    .select(PUBLIC_ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as PublicArticle[];
}

function CardVisual({ article, className }: { article: PublicArticle; className: string }) {
  if (article.featured_image_url) {
    return (
      <img
        src={article.featured_image_url}
        alt={article.title}
        loading="lazy"
        className={"w-full object-cover " + className}
      />
    );
  }
  const tile = tileFor(article.id);
  return (
    <div className={"grid w-full place-items-center " + tile.bg + " " + tile.fg + " " + className}>
      <Mark name={tile.mark} className="h-1/2 w-1/2" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className={"grid overflow-hidden rounded-2xl border border-border/70 bg-card md:grid-cols-2 " + CARD_SHADOW}>
          <div className="aspect-[4/3] w-full animate-pulse bg-secondary md:aspect-auto" />
          <div className="flex flex-col justify-center gap-4 p-10">
            <div className="h-3 w-28 animate-pulse rounded-full bg-secondary" />
            <div className="h-7 w-4/5 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-8 pb-24">
        <p className="eyebrow">Recent articles</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={"flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card " + CARD_SHADOW}>
              <div className="aspect-[16/10] w-full animate-pulse bg-secondary" />
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="h-3 w-20 animate-pulse rounded-full bg-secondary" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-full animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto max-w-7xl px-8 py-16">
      <div className={"rounded-2xl border border-border/70 bg-card px-8 py-20 text-center " + CARD_SHADOW}>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </section>
  );
}

function InsightsPage() {
  const [topic, setTopic] = useState<string>("All");
  const { data, isPending, isError } = useQuery({
    queryKey: ["published-articles"],
    queryFn: fetchPublishedArticles,
  });

  const all = data ?? [];
  const visible = topic === "All" ? all : all.filter((a) => a.category === topic);
  const featured = visible.find((a) => a.is_featured) ?? visible[0];
  const rest = featured ? visible.filter((a) => a.id !== featured.id) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompactHero
        eyebrow="Insights"
        title={<>Insights from the Swiss <span className="text-accent">coaching</span> community.</>}
        lede="Ideas, research and stories on leadership, AI, diversity and the future of work — from coaches practising across Switzerland."
      />
      <main>
        <section className="mx-auto max-w-7xl px-8 pt-16">
          <div className="flex flex-wrap items-center gap-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={
                  "inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-wider transition " +
                  (t === topic
                    ? "border-chip-active-border bg-primary text-primary-foreground"
                    : "border-border/70 bg-chip text-chip-foreground hover:border-chip-active-border")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {isPending ? (
          <SkeletonGrid />
        ) : isError ? (
          <EmptyState title="Insights are unavailable" body="We could not load articles right now. Please try again in a moment." />
        ) : !featured ? (
          <EmptyState
            title={topic === "All" ? "No published articles yet" : `Nothing in ${topic} yet`}
            body={
              topic === "All"
                ? "New writing from the Swiss coaching community will appear here as soon as it is published."
                : "Try another topic, or browse everything with the All filter."
            }
          />
        ) : (
          <>
            <section className="mx-auto max-w-7xl px-8 py-16">
              <Link
                to="/insights/$id"
                params={{ id: featured.id }}
                className={"group grid overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 md:grid-cols-2 " + CARD_SHADOW}
              >
                <CardVisual article={featured} className="aspect-[4/3] md:aspect-auto md:h-full" />
                <div className="flex flex-col justify-center p-10">
                  <p className="section-label">Featured{featured.category ? ` · ${featured.category}` : ""}</p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{featured.title}</h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  <p className="btn-mono mt-6 !text-muted-foreground">
                    {formatArticleDate(featured.published_at)} · ICF Switzerland Editorial
                  </p>
                </div>
              </Link>
            </section>

            <section className="mx-auto max-w-7xl px-8 pb-24">
              <p className="eyebrow">Recent articles</p>
              {rest.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">No further articles in this topic yet.</p>
              ) : (
                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <Link
                      key={p.id}
                      to="/insights/$id"
                      params={{ id: p.id }}
                      className={"group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " + CARD_SHADOW}
                    >
                      <CardVisual article={p} className="aspect-[16/10]" />
                      <div className="flex flex-1 flex-col p-6">
                        {p.category ? <p className="section-label">{p.category}</p> : null}
                        <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">{p.title}</h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                        <p className="btn-mono mt-4 !text-muted-foreground">{formatArticleDate(p.published_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">Stay connected</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Get new insights in your inbox.
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
              <input type="email" required placeholder="Your email address" className="h-10 w-full rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/60" />
              <button className="h-10 rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">Subscribe</button>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}