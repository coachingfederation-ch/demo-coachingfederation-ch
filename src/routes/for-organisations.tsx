import { createFileRoute } from "@tanstack/react-router";
import { Mark, type MarkName } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";

export const Route = createFileRoute("/for-organisations")({
  head: () => ({
    meta: [
      { title: "For Organisations — ICF Switzerland" },
      { name: "description", content: "Coaching programmes that develop leaders, strengthen teams and build coaching cultures across Swiss organisations." },
      { property: "og:title", content: "For Organisations — ICF Switzerland" },
      { property: "og:description", content: "Coaching programmes that develop leaders, strengthen teams and build coaching cultures across Swiss organisations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForOrganisationsPage,
});

const outcomes = [
  { stat: "+38%", title: "Leader effectiveness", desc: "Coached leaders report sharper judgement, better delegation and stronger presence." },
  { stat: "2×", title: "Team engagement", desc: "Teams working with a coaching culture consistently outperform peers on engagement." },
  { stat: "94%", title: "ROI reported", desc: "Organisations investing in coaching report measurable returns within twelve months." },
];

const steps = [
  { n: "01", title: "Discover", desc: "We understand your context, your people and the outcomes that matter." },
  { n: "02", title: "Match", desc: "We connect you with ICF credentialed coaches whose experience fits your goals." },
  { n: "03", title: "Measure", desc: "We support the engagement with milestones, feedback and clear evaluation." },
];

const programmes: { tag: string; title: string; bg: string; fg: string; mark: MarkName }[] = [
  { tag: "Executive coaching", title: "One-to-one work with senior leaders navigating complexity.", bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { tag: "Team coaching", title: "Whole-team engagements that build trust, alignment and results.", bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { tag: "Coaching cultures", title: "Programmes that embed coaching skills across your organisation.", bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
];

function ForOrganisationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompactHero
        eyebrow="For organisations"
        title={<>Coaching for organisations that lead through <span className="text-accent">change</span>.</>}
        lede="From executive one-to-ones to organisation-wide coaching cultures, ICF Switzerland connects you with credentialed coaches who deliver measurable impact."
        ctaLabel="Talk to our team"
      />
      <main>
        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">Outcomes</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Why organisations choose ICF coaches.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {outcomes.map((o) => (
              <div key={o.title} className={"rounded-2xl border border-border/70 bg-card p-8 " + CARD_SHADOW}>
                <p className="text-4xl font-bold tracking-tight text-primary">{o.stat}</p>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">How we work</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              A clear path from ambition to impact.
            </h2>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 btn-mono font-bold">{s.n}</span>
                    <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">Featured programmes</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Programmes tailored to your context.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {programmes.map((p) => (
              <a key={p.tag} href="#" className={"group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " + CARD_SHADOW}>
                <div className={"grid aspect-[4/3] w-full place-items-center " + p.bg + " " + p.fg}>
                  <Mark name={p.mark} className="h-1/2 w-1/2" />
                </div>
                <div className="p-6">
                  <p className="section-label">{p.tag}</p>
                  <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">{p.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">Get started</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Ready to bring coaching into your organisation?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">Talk to us</a>
              <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Case studies</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}