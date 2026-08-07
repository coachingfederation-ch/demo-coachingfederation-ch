/**
 * Small teaser of the operational structure for the About page. Shows a
 * handful of volunteers and links through to the full team page.
 */
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { LocaleLink, useI18n } from "@/i18n";
import { TeamHoneycomb } from "@/components/team/TeamGrid";
import { listTeamDirectory } from "@/lib/team.functions";

export function TeamPreview() {
  const { t, locale } = useI18n();
  const { data } = useQuery({
    queryKey: ["team-directory", locale],
    queryFn: () => listTeamDirectory({ data: { locale } }),
  });
  const members = (data?.members ?? []).slice(0, 7);
  if (!members.length) return null;

  return (
    <section className="bg-card py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-8 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <p className="eyebrow">{t("team.preview.eyebrow")}</p>
          <h2 className="mt-3 display-lg">{t("team.preview.title")}</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {t("team.preview.body")}
          </p>
          <LocaleLink
            to="/team"
            className="mt-8 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {t("team.preview.cta")} <ArrowRight className="h-4 w-4" />
          </LocaleLink>
        </div>
        <TeamHoneycomb members={members} />
      </div>
    </section>
  );
}
