import conversationImg from "@/assets/real-conversation.jpg";
import { Mark } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { useI18n } from "@/i18n";

export default function AboutPage() {
  const { t, tList } = useI18n();
  const values = tList<{ title: string; desc: string }>("about.values");
  const communities = tList<{ city: string; region: string; cadence: string; langs: string[]; lead: string }>(
    "about.communities.items",
  );
  const partners = tList<string>("about.research.partners");
  const research = tList<{ title: string; desc: string }>("about.research.items");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("about.hero.eyebrow")}
        title={
          <>
            {t("about.hero.titlePrefix")}
            <span className="text-accent">{t("about.hero.titleAccent")}</span>
          </>
        }
        lede={t("about.hero.lede")}
      />
      <main id="main">
        <section className="mx-auto max-w-7xl px-8 py-24">
          <div className="grid gap-14 md:grid-cols-2 md:items-center">
            <img
              src={conversationImg}
              alt={t("about.why.imageAlt")}
              width={1400}
              height={1400}
              loading="lazy"
              className="aspect-square w-full rounded-2xl object-cover"
            />
            <div>
              <p className="eyebrow">{t("about.why.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {t("about.why.title")}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {t("about.why.body")}
              </p>
              <div className="mt-10 space-y-6">
                {values.map((v, i) => (
                  <div key={v.title} className="flex gap-5 border-t border-border/70 pt-6">
                    <span className="btn-mono text-lg font-bold text-teal-foreground">0{i + 1}</span>
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

        <section id="communities" className="bg-muted py-24 scroll-mt-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("about.communities.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("about.communities.title")}
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
          <p className="eyebrow">{t("about.research.eyebrow")}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {t("about.research.title")}
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
              <p className="eyebrow !text-accent">{t("about.mission.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {t("about.mission.title")}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
                {t("about.mission.body")}
              </p>
            </div>
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-white/5">
              <Mark name="circular2" className="h-1/2 w-1/2 text-mark-cream" />
            </div>
          </div>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">{t("about.cta.eyebrow")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("about.cta.title")}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">{t("about.cta.join")}</a>
              <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">{t("about.cta.contact")}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
