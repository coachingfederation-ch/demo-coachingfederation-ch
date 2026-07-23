import { createFileRoute } from "@tanstack/react-router";
import conversationImg from "@/assets/real-conversation.jpg";
import { Mark } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ICF Switzerland" },
      { name: "description", content: "About ICF Switzerland Charter Chapter: why coaching, our regional communities, and our research partnerships." },
      { property: "og:title", content: "About — ICF Switzerland" },
      { property: "og:description", content: "About ICF Switzerland Charter Chapter: why coaching, our regional communities, and our research partnerships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { title: "Think differently", desc: "Coaching creates space to challenge assumptions and see new options." },
  { title: "Lead better", desc: "Leaders who are coached listen deeper, decide faster and grow their people." },
  { title: "Unlock potential", desc: "Individuals and teams reach for what matters most, with support and accountability." },
];

const communities = [
  { city: "Zürich", region: "German-speaking Switzerland", cadence: "Monthly", langs: ["DE", "EN"], lead: "Chapter lead: Zürich team" },
  { city: "Lausanne & Genève", region: "Romandie", cadence: "Monthly", langs: ["FR", "EN"], lead: "Chapter lead: Romandie team" },
  { city: "Lugano", region: "Ticino", cadence: "Quarterly", langs: ["IT", "EN"], lead: "Chapter lead: Ticino team" },
  { city: "Online", region: "Events, mentoring & volunteering", cadence: "Ongoing", langs: ["DE", "FR", "IT", "EN"], lead: "Open to all members" },
];

const partners = ["ETH Zürich", "HEC Lausanne", "USI Lugano", "SwissRe", "Nestlé"];

const research = [
  { title: "The state of coaching in Switzerland 2026", desc: "A joint study with Swiss universities on the growth and impact of professional coaching." },
  { title: "Coaching, AI and the future of work", desc: "A partnership research programme exploring how AI is reshaping coaching practice." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompactHero
        eyebrow="About"
        title={<>ICF Switzerland <span className="text-accent">Charter Chapter</span>.</>}
        lede="We are the Swiss national chapter of the International Coaching Federation — a professional home for credentialed coaches and the organisations they serve."
      />
      <main>
        <section className="mx-auto max-w-7xl px-8 py-24">
          <div className="grid gap-14 md:grid-cols-2 md:items-center">
            <img
              src={conversationImg}
              alt="A real coaching conversation"
              width={1400}
              height={1400}
              loading="lazy"
              className="aspect-square w-full rounded-2xl object-cover"
            />
            <div>
              <p className="eyebrow">Why coaching?</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                Better conversations create better futures.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Professional coaching empowers people to think more clearly, lead more effectively and navigate change with confidence.
              </p>
              <div className="mt-10 space-y-6">
                {values.map((v, i) => (
                  <div key={v.title} className="flex gap-5 border-t border-border/70 pt-6">
                    <span className="btn-mono text-lg font-bold !text-accent">0{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{v.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">Communities</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              A coaching community across Switzerland.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {communities.map((c) => (
                <div key={c.city} className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}>
                  <h3 className="text-lg font-semibold tracking-tight">{c.city}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.region}</p>
                  <p className="btn-mono mt-4 !text-muted-foreground">{c.cadence} · {c.lead}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {c.langs.map((l) => (
                      <span key={l} className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-chip-foreground">{l}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">Research & partnerships</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Connecting research, practice and leadership.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
            {partners.map((p) => (
              <div key={p} className={"grid h-20 place-items-center rounded-2xl border border-border/70 bg-card text-sm font-semibold text-foreground/70 " + CARD_SHADOW}>
                {p}
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {research.map((r) => (
              <div key={r.title} className={"rounded-2xl border border-border/70 bg-card p-8 " + CARD_SHADOW}>
                <h3 className="text-lg font-semibold tracking-tight">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-8 py-24 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="eyebrow !text-accent">Our mission</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                Advancing professional coaching in Switzerland.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
                We uphold the highest standards of the coaching profession and champion its value for individuals, organisations and society.
              </p>
            </div>
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-white/5">
              <Mark name="circular2" className="h-1/2 w-1/2 text-mark-cream" />
            </div>
          </div>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">Get involved</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Join us in shaping the future of coaching.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">Become a member</a>
              <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Contact us</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}