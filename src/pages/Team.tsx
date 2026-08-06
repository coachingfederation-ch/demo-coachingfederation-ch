/**
 * Chapter team directory showing board and project members in a honeycomb grid.
 * Exports: TeamPage (default). Rendered by src/routes/team.tsx and
 * the locale-prefixed equivalent in src/routes/$locale/team.tsx.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompactHero, SiteFooter } from "@/components/site-chrome";
import { TeamFilters, TeamHoneycomb } from "@/components/team/TeamGrid";
import { useI18n } from "@/i18n";
import { listTeamDirectory } from "@/lib/team.functions";

export default function TeamPage() {
  const { t, locale } = useI18n();
  const [project, setProject] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["team-directory", locale],
    queryFn: () => listTeamDirectory({ data: { locale } }),
  });

  const members = useMemo(() => {
    const all = data?.members ?? [];
    if (!project) return all;
    return all.filter((m) => m.assignments.some((a) => a.projectSlug === project));
  }, [data, project]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("team.hero.eyebrow")}
        title={
          <>
            {t("team.hero.titlePre")}
            <span className="text-accent">{t("team.hero.titleAccent")}</span>
          </>
        }
        lede={t("team.hero.lede")}
      />
      <main id="main">
        <section className="bg-background py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-muted-foreground">
              {t("team.intro")}
            </p>
            <div className="mt-10">
              <TeamFilters
                projects={data?.projects ?? []}
                active={project}
                onChange={setProject}
              />
            </div>
          </div>
        </section>
        <section className="bg-card py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            {isPending ? (
              <p className="text-center text-sm text-muted-foreground">{t("team.loading")}</p>
            ) : members.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">{t("team.empty")}</p>
            ) : (
              <TeamHoneycomb members={members} />
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
