import heroImg from "@/assets/hero-coaching.jpg";
import leadershipImg from "@/assets/leadership-team.jpg";
import { Mark, type MarkName } from "@/components/marks";
import { SiteHeaderBar, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { useI18n, LocaleLink } from "@/i18n";

function HeroHeader() {
  const { t } = useI18n();
  return (
    <header className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-16 sm:px-8">
        <div className="mb-10">
          <SiteHeaderBar />
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow !text-accent">{t("home.hero.eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {t("home.hero.titlePre")}
              <span className="text-accent">{t("home.hero.titleAccent")}</span>
              {t("home.hero.titlePost")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
              {t("home.hero.subtitle")}
            </p>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt={t("home.hero.imgAlt")}
              width={1600}
              height={1200}
              className="aspect-[5/4] w-full rounded-2xl object-cover"
            />
            <Mark
              name="asterisk1"
              className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 text-mark-yellow"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Audiences() {
  const { tList } = useI18n();
  const audiences = tList<{ eyebrow: string; title: string; desc: string; cta: string }>(
    "home.audiences",
  );
  const targets = [
    "/find-a-coach",
    "/for-organisations",
    "/for-coaches",
    "https://coachingfederation.org/become-a-coach/why-become-a-coach/",
  ];
  const isExternal = [false, false, false, true];
  const cardClassName =
    "group flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 hover:border-chip-active-border " +
    CARD_SHADOW;
  return (
    <section id="find-a-coach" className="mx-auto -mt-8 max-w-7xl px-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a, i) => {
          const children = (
            <>
              <p className="section-label">{a.eyebrow}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
              <span className="mt-6 text-sm font-semibold text-primary">{a.cta} →</span>
            </>
          );
          if (isExternal[i]) {
            return (
              <a
                key={a.title + a.eyebrow}
                href={targets[i]}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClassName}
              >
                {children}
              </a>
            );
          }
          return (
            <LocaleLink key={a.title + a.eyebrow} to={targets[i] ?? "/about"} className={cardClassName}>
              {children}
            </LocaleLink>
          );
        })}
      </div>
    </section>
  );
}

function WhyCredentialed() {
  const { t, tList } = useI18n();
  const pillars = tList<{ title: string; desc: string }>("home.pillars.items");
  return (
    <section className="relative bg-muted py-24 mt-16">
      <Mark
        name="circular1"
        className="pointer-events-none absolute -right-16 top-10 h-72 w-72 text-mark-indigo opacity-30"
      />
      <div className="mx-auto max-w-7xl px-8">
        <p className="eyebrow">{t("home.pillars.eyebrow")}</p>
        <div className="mt-4 grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            {t("home.pillars.title")}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {t("home.pillars.subtitle")}
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <div key={p.title} className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 btn-mono font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{p.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const THEME_STYLES: { bg: string; fg: string; mark: MarkName }[] = [
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
  { bg: "bg-mark-blue", fg: "text-mark-cream", mark: "circular2" },
];

function CoachingInAction() {
  const { t, tList } = useI18n();
  const themes = tList<{ tag: string; title: string }>("home.insights.themes").map((item, i) => ({
    ...item,
    ...THEME_STYLES[i],
  }));
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{t("home.insights.eyebrow")}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            {t("home.insights.title")}
          </h2>
        </div>
        <LocaleLink to="/insights" className="text-sm font-semibold text-primary hover:underline">
          {t("home.insights.cta")}
        </LocaleLink>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {themes.map((th) => (
          <LocaleLink
            key={th.tag}
            to="/insights"
            className={
              "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " +
              CARD_SHADOW
            }
          >
            <div className={"grid aspect-[4/3] w-full place-items-center " + th.bg + " " + th.fg}>
              <Mark name={th.mark} className="h-1/2 w-1/2" />
            </div>
            <div className="p-6">
              <p className="section-label">{th.tag}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground">
                {th.title}
              </h3>
            </div>
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}

function ForOrganisations() {
  const { t } = useI18n();
  return (
    <section id="organisations" className="bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-8 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="eyebrow !text-accent">{t("home.organisations.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {t("home.organisations.title")}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85">
            {t("home.organisations.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocaleLink
              to="/for-organisations"
              hash="organisation-contact"
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              {t("home.organisations.talkToUs")}
            </LocaleLink>
            <a
              href="https://coachingfederation.org/resources/resource-library/?_topic=coaching-in-organizations&_resource_type=case-studies"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("home.organisations.caseStudies")}
            </a>
          </div>
        </div>
        <img
          src={leadershipImg}
          alt={t("home.organisations.imgAlt")}
          width={1600}
          height={1200}
          loading="lazy"
          className="aspect-[5/4] w-full rounded-2xl object-cover"
        />
      </div>
    </section>
  );
}

const COMMUNITY_LANGS: string[][] = [
  ["DE", "EN"],
  ["FR", "EN"],
  ["IT", "EN"],
  ["DE", "FR", "IT", "EN"],
];

function Communities() {
  const { t, tList } = useI18n();
  const communities = tList<{ city: string; region: string }>("home.communities.items").map(
    (item, i) => ({
      ...item,
      langs: COMMUNITY_LANGS[i],
    }),
  );
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <p className="eyebrow">{t("home.communities.eyebrow")}</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        {t("home.communities.title")}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {t("home.communities.subtitle")}
      </p>
      <div className="mt-14 grid gap-4 text-left md:grid-cols-2 lg:grid-cols-4">
        {communities.map((c) => (
          <LocaleLink
            key={c.city}
            to="/about"
            hash="communities"
            className={
              "block rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 hover:border-chip-active-border " +
              CARD_SHADOW
            }
          >
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{c.city}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.region}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {c.langs.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-chip-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}

const EVENT_STYLES: { bg: string; fg: string; mark: MarkName }[] = [
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "arrow1" },
  { bg: "bg-mark-indigo", fg: "text-mark-yellow", mark: "asterisk3" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "arrow2" },
];

function Events() {
  const { t, tList } = useI18n();
  const events = tList<{ date: string; city: string; title: string; tags: string[] }>(
    "home.events.items",
  ).map((item, i) => ({ ...item, ...EVENT_STYLES[i] }));
  return (
    <section className="bg-muted py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{t("home.events.eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              {t("home.events.title")}
            </h2>
          </div>
          <LocaleLink to="/events" className="text-sm font-semibold text-primary hover:underline">
            {t("home.events.viewAll")}
          </LocaleLink>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {events.map((e) => (
            <LocaleLink
              key={e.title}
              to="/events"
              className={
                "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " +
                CARD_SHADOW
              }
            >
              <div className={"grid aspect-[16/10] w-full place-items-center " + e.bg + " " + e.fg}>
                <Mark name={e.mark} className="h-3/5 w-3/5" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="btn-mono !text-muted-foreground">
                  {e.date} · {e.city}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground">
                  {e.title}
                </h3>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {e.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </LocaleLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function Research() {
  const { t, tList } = useI18n();
  const partners = tList<string>("home.research.partners");
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <p className="eyebrow">{t("home.research.eyebrow")}</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        {t("home.research.title")}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {t("home.research.subtitle")}
      </p>
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
        {partners.map((p) => (
          <div
            key={p}
            className={
              "grid h-20 place-items-center rounded-2xl border border-border/70 bg-card text-sm font-semibold text-foreground/70 " +
              CARD_SHADOW
            }
          >
            {p}
          </div>
        ))}
      </div>
    </section>
  );
}

function Join() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-hero text-hero-foreground">
      <Mark
        name="circular2"
        className="pointer-events-none absolute -right-16 -top-10 h-96 w-96 text-mark-cream opacity-40"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-8 py-24 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="eyebrow !text-accent">{t("home.join.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {t("home.join.title")}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85">
            {t("home.join.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocaleLink
              to="/for-coaches"
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              {t("home.join.becomeMember")}
            </LocaleLink>
            <LocaleLink
              to="/for-coaches"
              hash="credentials"
              className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("home.join.exploreCredentials")}
            </LocaleLink>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
          <h3 className="text-xl font-semibold tracking-tight">{t("home.join.newsletterTitle")}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            {t("home.join.newsletterSubtitle")}
          </p>
          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="home-newsletter-email" className="sr-only">
              {t("common.form.emailLabel")}
            </label>
            <input
              id="home-newsletter-email"
              name="email"
              autoComplete="email"
              type="email"
              required
              placeholder={t("home.join.emailPlaceholder")}
              className="h-10 w-full rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/70 outline-none focus:border-white/60"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              {t("home.join.subscribe")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <HeroHeader />
      <main id="main">
        <Audiences />
        <WhyCredentialed />
        <CoachingInAction />
        <ForOrganisations />
        <Communities />
        <Events />
        <Research />
        <Join />
      </main>
      <SiteFooter />
    </div>
  );
}
