import { createFileRoute, Link } from "@tanstack/react-router";
import { Mark } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";

export const Route = createFileRoute("/for-coaches")({
  head: () => ({
    meta: [
      { title: "For Coaches — ICF Switzerland" },
      { name: "description", content: "Membership, credentialing pathways and community for professional coaches practising in Switzerland." },
      { property: "og:title", content: "For Coaches — ICF Switzerland" },
      { property: "og:description", content: "Membership, credentialing pathways and community for professional coaches practising in Switzerland." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForCoachesPage,
});

const benefits = [
  { title: "Community", desc: "Regional chapters, peer circles and mentoring across Switzerland." },
  { title: "Learning", desc: "CCE-accredited events, workshops and continuous development." },
  { title: "Credibility", desc: "The globally recognised ICF badge and Coach Directory listing." },
  { title: "Advocacy", desc: "A collective voice for the coaching profession in Switzerland." },
];

const credentials = [
  { level: "ACC", hours: "100+ hours", desc: "Associate Certified Coach — the entry pathway for newly trained coaches." },
  { level: "PCC", hours: "500+ hours", desc: "Professional Certified Coach — the standard for established practitioners." },
  { level: "MCC", hours: "2,500+ hours", desc: "Master Certified Coach — the highest tier, for masterful practitioners." },
];

function ForCoachesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompactHero
        eyebrow="For coaches"
        title={<>Grow your practice with <span className="text-accent">ICF Switzerland</span>.</>}
        lede="Join a Swiss community of credentialed coaches committed to excellence, ethics and lifelong development."
        ctaLabel="Become a member"
      />
      <main>
        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">Membership benefits</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Everything you need to keep growing.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}>
                <h3 className="text-lg font-semibold tracking-tight">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">Credentialing pathway</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              A recognised path from ACC to MCC.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {credentials.map((c) => (
                <div key={c.level} className={"rounded-2xl border border-border/70 bg-card p-8 " + CARD_SHADOW}>
                  <p className="btn-mono !text-accent">{c.hours}</p>
                  <h3 className="mt-3 text-3xl font-bold tracking-tight text-primary">{c.level}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-mark-blue text-mark-cream">
              <Mark name="circular2" className="h-1/2 w-1/2" />
            </div>
            <div>
              <p className="eyebrow">Chapter communities</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                Find your regional community.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                From Zürich to Romandie to Ticino, our chapter communities meet regularly to learn, practise and support one another.
              </p>
              <Link to="/about" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
                Explore communities →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">Join us</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Ready to become an ICF Switzerland member?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">Become a member</a>
              <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Explore credentials</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}