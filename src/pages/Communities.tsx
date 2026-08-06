/**
 * Listing page for ICF Switzerland communities and chapters.
 * Exports: CommunitiesPage (default). Rendered by src/routes/communities.index.tsx and
 * the locale-prefixed equivalent in src/routes/$locale/communities.index.tsx.
 */
import { useQuery } from "@tanstack/react-query";
import { CompactHero, SiteFooter } from "@/components/site-chrome";
import { useI18n } from "@/i18n";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { listCommunities } from "@/lib/communities.functions";

export default function CommunitiesPage() {
  const { t, locale } = useI18n();
  const { data, isPending } = useQuery({
    queryKey: ["communities", locale],
    queryFn: () => listCommunities({ data: { locale } }),
  });
  const communities = data ?? [];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("communities.hero.eyebrow")}
        title={
          <>
            {t("communities.hero.titlePre")}
            <span className="text-accent">{t("communities.hero.titleAccent")}</span>
          </>
        }
        lede={t("communities.hero.lede")}
      />
      <main id="main">
        <section className="bg-background py-16">
          <p className="mx-auto max-w-2xl px-6 text-center text-base leading-relaxed text-muted-foreground sm:px-8">
            {t("communities.intro")}
          </p>
        </section>
        <section className="bg-card py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            {isPending ? (
              <p className="text-center text-sm text-muted-foreground">
                {t("communities.loading")}
              </p>
            ) : communities.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">{t("communities.empty")}</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communities.map((c) => (
                  <CommunityCard key={c.slug} community={c} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
