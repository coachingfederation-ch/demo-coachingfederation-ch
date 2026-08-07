/**
 * Upcoming events shown on a local community page.
 *
 * Purely presentational: the caller decides which events belong here and in
 * which order. Events that belong to a different community carry their
 * community name as a chip, so the fallback list never reads as if this
 * community were hosting them.
 */
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { CARD_SHADOW } from "@/components/site-chrome";
import { LocaleLink, useI18n } from "@/i18n";
import {
  eventPlace,
  formatEventDate,
  formatEventTimeRange,
  type PublicEvent,
} from "@/lib/events";

type CommunityEvent = PublicEvent & { resolvedLocale?: string };

export function CommunityEvents({
  events,
  communitySlug,
  hasOwn,
}: {
  events: CommunityEvent[];
  communitySlug: string;
  hasOwn: boolean;
}) {
  const { t, locale } = useI18n();
  if (events.length === 0) return null;

  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <p className="eyebrow">{t("communities.detail.events.eyebrow")}</p>
        <h2 className="mt-3 max-w-2xl display-md">
          {hasOwn
            ? t("communities.detail.events.title")
            : t("communities.detail.events.fallbackTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {hasOwn
            ? t("communities.detail.events.lede")
            : t("communities.detail.events.fallbackLede")}
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {events.map((e) => {
            const tz = e.timezone ?? "Europe/Zurich";
            const elsewhere = e.community_slug !== communitySlug;
            return (
              <li key={e.id}>
                <LocaleLink
                  to={`/events/${e.slug}`}
                  className={
                    "group flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-0.5 " +
                    CARD_SHADOW
                  }
                >
                  <p className="btn-mono !text-muted-foreground">
                    <CalendarDays className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                    {formatEventDate(e.starts_at!, locale, tz)} ·{" "}
                    {formatEventTimeRange(e.starts_at!, e.ends_at, locale, tz)}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                    {e.title}
                  </h3>
                  {e.summary ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {e.summary}
                    </p>
                  ) : null}
                  <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {eventPlace(e, t("events.tag.online"))}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground">
                      {(e.language ?? "en").toUpperCase()}
                    </span>
                    {elsewhere && e.community_name ? (
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground">
                        {e.community_name}
                      </span>
                    ) : null}
                    {e.is_full ? (
                      <span className="inline-flex items-center rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-semibold text-[color:var(--warn)]">
                        {t("events.tag.full")}
                      </span>
                    ) : null}
                  </div>
                </LocaleLink>
              </li>
            );
          })}
        </ul>

        <LocaleLink
          to="/events"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t("communities.detail.events.all")} <ArrowUpRight className="h-4 w-4" />
        </LocaleLink>
      </div>
    </section>
  );
}