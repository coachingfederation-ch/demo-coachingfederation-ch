import { Mark, type MarkName } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { useI18n } from "@/i18n";

const featuredVisual = {
  bg: "bg-mark-cream",
  fg: "text-mark-indigo",
  mark: "arrow1" as MarkName,
};

const upcomingVisuals: { bg: string; fg: string; mark: MarkName }[] = [
  { bg: "bg-mark-indigo", fg: "text-mark-yellow", mark: "asterisk3" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "arrow2" },
  { bg: "bg-mark-blue", fg: "text-mark-cream", mark: "circular2" },
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
];

export default function EventsPage() {
  const { t, tList } = useI18n();
  const featured = {
    date: t("events.featured.date"),
    city: t("events.featured.city"),
    title: t("events.featured.title"),
    desc: t("events.featured.desc"),
    tags: tList<string>("events.featured.tags"),
    ...featuredVisual,
  };
  const upcomingItems = tList<{ date: string; city: string; title: string; tags: string[] }>(
    "events.upcoming.items",
  );
  const upcoming = upcomingItems.map((e, i) => ({ ...e, ...upcomingVisuals[i] }));
  const past = tList<{ date: string; city: string; title: string }>("events.past.items");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("events.hero.eyebrow")}
        title={
          <>
            {t("events.hero.titlePrefix")}
            <span className="text-accent">{t("events.hero.titleAccent")}</span>
            {t("events.hero.titleSuffix")}
          </>
        }
        lede={t("events.hero.lede")}
      />
      <main id="main">
        <section className="mx-auto max-w-7xl px-8 py-16">
          <p className="eyebrow">{t("events.featured.eyebrow")}</p>
          <a href="#" className={"group mt-6 grid overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 md:grid-cols-2 " + CARD_SHADOW}>
            <div className={"grid aspect-[4/3] w-full place-items-center md:aspect-auto " + featured.bg + " " + featured.fg}>
              <Mark name={featured.mark} className="h-1/2 w-1/2" />
            </div>
            <div className="flex flex-col justify-center p-10">
              <p className="btn-mono !text-muted-foreground">{featured.date} · {featured.city}</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{featured.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{featured.desc}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {featured.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground">{tag}</span>
                ))}
              </div>
            </div>
          </a>
        </section>

        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("events.upcoming.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("events.upcoming.title")}
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <a key={e.title} href="#" className={"group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " + CARD_SHADOW}>
                  <div className={"grid aspect-[16/10] w-full place-items-center " + e.bg + " " + e.fg}>
                    <Mark name={e.mark} className="h-3/5 w-3/5" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="btn-mono !text-muted-foreground">{e.date} · {e.city}</p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{e.title}</h3>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {e.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">{t("events.past.eyebrow")}</p>
          <ul className="mt-8 divide-y divide-border/70 border-y border-border/70">
            {past.map((e) => (
              <li key={e.title} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="btn-mono !text-muted-foreground">{e.date} · {e.city}</p>
                  <p className="mt-1 text-base font-semibold tracking-tight">{e.title}</p>
                </div>
                <a href="#" className="text-sm font-semibold text-primary hover:underline">{t("events.past.recap")}</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">{t("events.cta.eyebrow")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("events.cta.title")}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">{t("events.cta.propose")}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
