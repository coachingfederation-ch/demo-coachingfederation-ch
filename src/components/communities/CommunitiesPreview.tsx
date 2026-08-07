/**
 * About-page teaser for the local communities programme.
 *
 * Shows the community an admin flagged as featured in the operational
 * structure CMS (falling back to the first one), plus a link to the overview.
 */
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock } from "lucide-react";
import { CommunityRing } from "@/components/communities/CommunityRing";
import { LocaleLink, useI18n } from "@/i18n";
import { listCommunities } from "@/lib/communities.functions";

export function CommunitiesPreview() {
  const { t, locale } = useI18n();
  const { data } = useQuery({
    queryKey: ["communities", locale],
    queryFn: () => listCommunities({ data: { locale } }),
  });
  const communities = data ?? [];
  const featured = communities.find((c) => c.isFeatured) ?? communities[0];
  if (!featured) return null;

  return (
    <section id="communities" className="scroll-mt-24 bg-background py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-8 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <p className="eyebrow">{t("communities.preview.eyebrow")}</p>
          <h2 className="mt-3 display-lg">{t("communities.preview.title")}</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("communities.preview.body")}
          </p>
          <p className="mt-6 text-sm font-semibold">
            {t("communities.preview.featuredLabel").replace("{name}", featured.name)}
          </p>
          {featured.cadence ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 text-accent" /> {featured.cadence}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <LocaleLink
              to="/communities"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {t("communities.preview.cta")} <ArrowRight className="h-4 w-4" />
            </LocaleLink>
            <LocaleLink
              to={`/communities/${featured.slug}`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-5 text-sm font-semibold text-foreground transition hover:bg-secondary/70"
            >
              {t("communities.preview.ctaFeatured")}
            </LocaleLink>
          </div>
        </div>
        <CommunityRing name={featured.name} slug={featured.slug} members={featured.preview} />
      </div>
    </section>
  );
}
