import { Mark } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { useI18n, LocaleLink } from "@/i18n";

export default function ForCoachesPage() {
  const { t, tList } = useI18n();
  const benefits = tList<{ title: string; desc: string }>("coaches.benefits.items");
  const credentials = tList<{ level: string; hours: string; desc: string }>("coaches.credentials.items");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompactHero
        eyebrow={t("coaches.hero.eyebrow")}
        title={
          <>
            {t("coaches.hero.titlePre")}
            <span className="text-accent">{t("coaches.hero.titleAccent")}</span>
            {t("coaches.hero.titlePost")}
          </>
        }
        lede={t("coaches.hero.lede")}
        ctaLabel={t("coaches.hero.cta")}
      />
      <main>
        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">{t("coaches.benefits.eyebrow")}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {t("coaches.benefits.title")}
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
            <p className="eyebrow">{t("coaches.credentials.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("coaches.credentials.title")}
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
              <p className="eyebrow">{t("coaches.chapters.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {t("coaches.chapters.title")}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {t("coaches.chapters.desc")}
              </p>
              <LocaleLink to="/about" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
                {t("coaches.chapters.cta")}
              </LocaleLink>
            </div>
          </div>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">{t("coaches.join.eyebrow")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("coaches.join.title")}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">{t("coaches.join.cta1")}</a>
              <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">{t("coaches.join.cta2")}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
