import { createFileRoute } from "@tanstack/react-router";
import { Mark, type MarkName } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";

export const Route = createFileRoute("/insights")({
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

const topics = ["All", "Leadership", "AI & Coaching", "Diversity", "Future of Work", "Research"];

const featured = {
  tag: "Leadership",
  title: "The listening leader: how coaching reshapes executive presence",
  excerpt: "Across sectors, senior leaders who invest in coaching report a shift in how they listen, decide and develop the people around them.",
  date: "12 Mar 2026",
  author: "ICF Switzerland Editorial",
  bg: "bg-mark-indigo",
  fg: "text-mark-cream",
  mark: "star" as MarkName,
};

const posts: { tag: string; title: string; excerpt: string; date: string; bg: string; fg: string; mark: MarkName }[] = [
  { tag: "AI & Coaching", title: "What stays human when AI joins the conversation?", excerpt: "Where AI accelerates thinking — and where trusted human dialogue remains irreplaceable.", date: "3 Mar 2026", bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
  { tag: "Future of Work", title: "Coaching in the age of hybrid teams", excerpt: "Distributed teams need new coaching rituals — here is what works.", date: "24 Feb 2026", bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { tag: "Diversity", title: "Coaching across cultures in multilingual Switzerland", excerpt: "Four languages, one profession — how coaches navigate cultural nuance.", date: "18 Feb 2026", bg: "bg-mark-blue", fg: "text-mark-cream", mark: "circular2" },
  { tag: "Research", title: "The ROI of coaching: what the latest studies show", excerpt: "A review of 2025 research on the measurable impact of professional coaching.", date: "9 Feb 2026", bg: "bg-mark-indigo", fg: "text-mark-yellow", mark: "asterisk3" },
  { tag: "Leadership", title: "From feedback to coaching conversations", excerpt: "How leaders can turn everyday feedback moments into growth opportunities.", date: "1 Feb 2026", bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "arrow1" },
  { tag: "Future of Work", title: "Skills that outlast the next disruption", excerpt: "Adaptive learners consistently outperform — and coaching accelerates the shift.", date: "22 Jan 2026", bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "arrow2" },
];

function InsightsPage() {
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
            {topics.map((t, i) => (
              <button
                key={t}
                className={
                  "inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-wider transition " +
                  (i === 0
                    ? "border-chip-active-border bg-primary text-primary-foreground"
                    : "border-border/70 bg-chip text-chip-foreground hover:border-chip-active-border")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-16">
          <a href="#" className={"group grid overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 md:grid-cols-2 " + CARD_SHADOW}>
            <div className={"grid aspect-[4/3] w-full place-items-center md:aspect-auto " + featured.bg + " " + featured.fg}>
              <Mark name={featured.mark} className="h-1/2 w-1/2" />
            </div>
            <div className="flex flex-col justify-center p-10">
              <p className="section-label">Featured · {featured.tag}</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{featured.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{featured.excerpt}</p>
              <p className="btn-mono mt-6 !text-muted-foreground">{featured.date} · {featured.author}</p>
            </div>
          </a>
        </section>

        <section className="mx-auto max-w-7xl px-8 pb-24">
          <p className="eyebrow">Recent articles</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <a key={p.title} href="#" className={"group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " + CARD_SHADOW}>
                <div className={"grid aspect-[16/10] w-full place-items-center " + p.bg + " " + p.fg}>
                  <Mark name={p.mark} className="h-1/2 w-1/2" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="section-label">{p.tag}</p>
                  <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">{p.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                  <p className="btn-mono mt-4 !text-muted-foreground">{p.date}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

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