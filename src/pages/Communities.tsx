import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";
import { LocaleLink, useI18n } from "@/i18n";
import { listCommunities } from "@/lib/communities.functions";
import type { CommunitySummary } from "@/lib/communities";
import type { TeamMember } from "@/lib/team";

function AvatarStack({ members }: { members: TeamMember[] }) {
  if (!members.length) return null;
  return (
    <div className="flex -space-x-2" aria-hidden="true">
      {members.map((m) => (
        <span
          key={m.memberId}
          className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-2 ring-card"
        >
          {m.imageUrl ? (
            <img src={m.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            m.initials
          )}
        </span>
      ))}
    </div>
  );
}

/** First sentence / paragraph of the markdown description, stripped of syntax. */
function excerpt(markdown: string | null, max = 180): string | null {
  if (!markdown) return null;
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return null;
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}

function CommunityCard({ community }: { community: CommunitySummary }) {
  const { t } = useI18n();
  const summary = excerpt(community.description);
  return (
    <LocaleLink
      to={`/communities/${community.slug}`}
      className={
        "group flex flex-col rounded-2xl border border-border/70 bg-card p-7 transition hover:-translate-y-0.5 " +
        CARD_SHADOW
      }
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold leading-tight tracking-tight">{community.name}</h2>
        <AvatarStack members={community.preview} />
      </div>
      {summary ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
      ) : null}
      {community.cadence ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MapPin className="h-3.5 w-3.5 text-accent" /> {community.cadence}
        </p>
      ) : null}
      {community.languages.length ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {community.languages.map((lang) => (
            <li
              key={lang}
              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
            >
              {lang}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {t("communities.list.members").replace("{count}", String(community.memberCount))}
        </span>
        <span className="inline-flex items-center gap-1 text-primary">
          {t("communities.list.open")}
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </LocaleLink>
  );
}

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
