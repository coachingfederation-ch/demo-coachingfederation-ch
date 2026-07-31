/**
 * Europe Pulse — the weekly, multilingual feed of what other ICF chapters in
 * Europe are doing. Read-only: everything here is curated by the weekly scan
 * and simply links back to the originating chapter's own site.
 */
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Globe2 } from "lucide-react";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { useI18n } from "@/i18n";
import { flagFor, formatPulseDate, type PulseItem } from "@/lib/europe-pulse";
import { listEuropePulse } from "@/lib/europe-pulse.functions";

function TypeChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-chip-foreground">
      {label}
    </span>
  );
}

function PulseCard({ item }: { item: PulseItem }) {
  const { t, locale } = useI18n();
  const date = formatPulseDate(item.eventDate, locale);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        "group flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 " +
        CARD_SHADOW
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden className="text-base">
            {flagFor(item.countryCode)}
          </span>
          <span className="truncate">{item.chapter}</span>
        </span>
        <TypeChip label={t(`europe-pulse.types.${item.type}`)} />
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug tracking-tight">{item.title}</h3>
      {item.description ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        {date ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-accent" /> {date}
          </span>
        ) : (
          <span>{item.country}</span>
        )}
        <span className="btn-mono inline-flex items-center gap-1 !text-primary">
          {t("europe-pulse.card.source")} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}

export default function EuropePulsePage() {
  const { t, locale } = useI18n();
  const { data, isPending, isError } = useQuery({
    queryKey: ["europe-pulse", locale],
    queryFn: () => listEuropePulse({ data: { locale } }),
  });
  const items = data?.items ?? [];
  const weekLabel = formatPulseDate(data?.weekOf ?? null, locale);
  const countries = new Set(items.map((i) => i.countryCode)).size;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("europe-pulse.hero.eyebrow")}
        title={
          <>
            {t("europe-pulse.hero.titleLead")}{" "}
            <span className="text-accent">{t("europe-pulse.hero.titleAccent")}</span>{" "}
            {t("europe-pulse.hero.titleTail")}
          </>
        }
        lede={t("europe-pulse.hero.lede")}
      />
      <main id="main" className="mx-auto max-w-7xl px-8 py-16">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {weekLabel ? (
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent" />
              {t("europe-pulse.meta.week").replace("{date}", weekLabel)}
            </span>
          ) : null}
          {items.length ? (
            <span className="inline-flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-accent" />
              {t("europe-pulse.meta.summary")
                .replace("{items}", String(items.length))
                .replace("{countries}", String(countries))}
            </span>
          ) : null}
        </div>

        {isPending ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={
                  "h-52 animate-pulse rounded-2xl border border-border/70 bg-secondary/60 " +
                  CARD_SHADOW
                }
              />
            ))}
          </div>
        ) : isError ? (
          <div
            className={
              "mt-10 rounded-2xl border border-border/70 bg-card px-8 py-20 text-center " +
              CARD_SHADOW
            }
          >
            <h2 className="text-xl font-bold tracking-tight">{t("europe-pulse.error.title")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              {t("europe-pulse.error.body")}
            </p>
          </div>
        ) : !items.length ? (
          <div
            className={
              "mt-10 rounded-2xl border border-border/70 bg-card px-8 py-20 text-center " +
              CARD_SHADOW
            }
          >
            <h2 className="text-xl font-bold tracking-tight">{t("europe-pulse.empty.title")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              {t("europe-pulse.empty.body")}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PulseCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {t("europe-pulse.disclaimer")}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}