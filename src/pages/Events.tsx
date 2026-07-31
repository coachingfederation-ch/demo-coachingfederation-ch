import { Mark, type MarkName } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { LocaleLink, useI18n } from "@/i18n";
import { eventPlace, formatEventDate, type PublicEvent } from "@/lib/events";

/**
 * Events carry no artwork of their own in phase 1, so each card gets a stable
 * hand-drawn mark derived from its slug — same event, same mark, every visit.
 */
const VISUALS: { bg: string; fg: string; mark: MarkName }[] = [
  { bg: "bg-mark-indigo", fg: "text-mark-yellow", mark: "asterisk3" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "arrow2" },
  { bg: "bg-mark-blue", fg: "text-mark-cream", mark: "circular2" },
  { bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
];

function visualFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return VISUALS[hash % VISUALS.length];
}

const LOCATION_TAG: Record<string, string> = {
  in_person: "events.tag.inPerson",
  online: "events.tag.online",
  hybrid: "events.tag.hybrid",
};

export type EventsPageData = {
  featured: PublicEvent | null;
  upcoming: PublicEvent[];
  past: PublicEvent[];
};

export default function EventsPage({ data }: { data: EventsPageData }) {
  const { t, locale } = useI18n();
  const { featured, upcoming, past } = data;

  const tagsFor = (e: PublicEvent) => [
    (e.language ?? "en").toUpperCase(),
    t(LOCATION_TAG[e.location_mode ?? "in_person"]),
    ...(e.registration_mode === "rsvp" ? [t("events.tag.registration")] : []),
  ];
  const dateLine = (e: PublicEvent) =>
    `${formatEventDate(e.starts_at!, locale, e.timezone ?? "Europe/Zurich")} · ${eventPlace(e, t("events.tag.online"))}`;

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
        {featured ? (
          <section className="bg-background py-16">
            <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("events.featured.eyebrow")}</p>
            <LocaleLink
              to={`/events/${featured.slug}`}
              className={
                "group mt-6 grid overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 md:grid-cols-2 " +
                CARD_SHADOW
              }
            >
              <div
                className={
                  "grid aspect-[4/3] w-full place-items-center md:aspect-auto " +
                  visualFor(featured.slug ?? "").bg +
                  " " +
                  visualFor(featured.slug ?? "").fg
                }
              >
                {featured.image_url ? (
                  <img
                    src={featured.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Mark name={visualFor(featured.slug ?? "").mark} className="h-1/2 w-1/2" />
                )}
              </div>
              <div className="flex flex-col justify-center p-10">
                <p className="btn-mono !text-muted-foreground">{dateLine(featured)}</p>
                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                  {featured.title}
                </h2>
                {featured.summary ? (
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {featured.summary}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {tagsFor(featured).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {featured.is_full ? (
                    <span className="inline-flex items-center rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-semibold text-[color:var(--warn)]">
                      {t("events.tag.full")}
                    </span>
                  ) : null}
                </div>
              </div>
            </LocaleLink>
            </div>
          </section>
        ) : null}

        <section className="bg-card py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("events.upcoming.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl display-lg">
              {t("events.upcoming.title")}
            </h2>
            {upcoming.length === 0 && !featured ? (
              <p className="mt-8 text-base text-muted-foreground">{t("events.upcoming.empty")}</p>
            ) : (
              <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e) => {
                  const v = visualFor(e.slug ?? "");
                  return (
                    <LocaleLink
                      key={e.id}
                      to={`/events/${e.slug}`}
                      className={
                        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 " +
                        CARD_SHADOW
                      }
                    >
                      <div
                        className={
                          "grid aspect-[16/10] w-full place-items-center " + v.bg + " " + v.fg
                        }
                      >
                        {e.image_url ? (
                          <img
                            src={e.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Mark name={v.mark} className="h-3/5 w-3/5" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="btn-mono !text-muted-foreground">{dateLine(e)}</p>
                        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                          {e.title}
                        </h3>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          {tagsFor(e).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {e.is_full ? (
                            <span className="inline-flex items-center rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-semibold text-[color:var(--warn)]">
                              {t("events.tag.full")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </LocaleLink>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {past.length ? (
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">{t("events.past.eyebrow")}</p>
            <ul className="mt-8 divide-y divide-border/70 border-y border-border/70">
              {past.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="btn-mono !text-muted-foreground">{dateLine(e)}</p>
                    <p className="mt-1 text-base font-semibold tracking-tight">{e.title}</p>
                  </div>
                  <LocaleLink
                    to={`/events/${e.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {t("events.past.recap")}
                  </LocaleLink>
                </li>
              ))}
            </ul>
            </div>
          </section>
        ) : null}

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">{t("events.cta.eyebrow")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl display-lg">
              {t("events.cta.title")}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LocaleLink
                to="/about"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                {t("events.cta.propose")}
              </LocaleLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
