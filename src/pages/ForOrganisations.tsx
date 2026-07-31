import { Mark, type MarkName } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { CultureSurvey } from "@/components/organisations/CultureSurvey";
import { BrevoChat } from "@/components/organisations/BrevoChat";
import { DeckSection } from "@/components/organisations/DeckSection";
import {
  Differentiators,
  EventsStrip,
  Initiatives,
  ProofBar,
} from "@/components/organisations/sections";
import { useI18n } from "@/i18n";

const programmeVisuals: { bg: string; fg: string; mark: MarkName }[] = [
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
];

export default function ForOrganisationsPage() {
  const { t, tList } = useI18n();
  const outcomes = tList<{ stat: string; title: string; desc: string }>(
    "organisations.outcomes.items",
  );
  const steps = tList<{ n: string; title: string; desc: string }>("organisations.steps.items");
  const programmes = tList<{ tag: string; title: string }>("organisations.programmes.items");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("organisations.hero.eyebrow")}
        title={
          <>
            {t("organisations.hero.titlePre")}
            <span className="text-accent">{t("organisations.hero.titleAccent")}</span>
            {t("organisations.hero.titlePost")}
          </>
        }
        lede={t("organisations.hero.lede")}
        ctaLabel={t("organisations.hero.cta")}
      />
      <main id="main">
        <ProofBar />

        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">{t("organisations.outcomes.eyebrow")}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {t("organisations.outcomes.title")}
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {outcomes.map((o) => (
              <div
                key={o.title}
                className={"rounded-2xl border border-border/70 bg-card p-8 " + CARD_SHADOW}
              >
                <p className="text-4xl font-bold tracking-tight text-primary">{o.stat}</p>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Differentiators />

        <DeckSection />

        {/* Raised surface: the numbered "how it works" list. */}
        <section className="bg-card py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("organisations.steps.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("organisations.steps.title")}
            </h2>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 btn-mono font-bold">
                      {s.n}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Initiatives />

        {/* Raised surface: programme cards. */}
        <section className="bg-card py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("organisations.programmes.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("organisations.programmes.title")}
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {programmes.map((p, i) => {
                const v = programmeVisuals[i];
                return (
                  <a
                    key={p.tag}
                    href="#"
                    className={
                      "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 " +
                      CARD_SHADOW
                    }
                  >
                    <div
                      className={"grid aspect-[4/3] w-full place-items-center " + v.bg + " " + v.fg}
                    >
                      <Mark name={v.mark} className="h-1/2 w-1/2" />
                    </div>
                    <div className="p-6">
                      <p className="section-label">{p.tag}</p>
                      <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">
                        {p.title}
                      </h3>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <CultureSurvey />

        <EventsStrip />

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">{t("organisations.getStarted.eyebrow")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("organisations.getStarted.title")}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#assessment"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                {t("organisations.getStarted.cta1")}
              </a>
              <a
                href="https://coachingfederation.org/resources/resource-library/?_topic=coaching-in-organizations&_resource_type=case-studies"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Case studies
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <BrevoChat />
    </div>
  );
}
