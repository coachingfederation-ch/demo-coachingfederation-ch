/**
 * Coach directory search page allowing users to find credentialed ICF coaches.
 * Exports: FindACoachPage (default). Rendered by src/routes/find-a-coach.tsx and
 * the locale-prefixed equivalent in src/routes/$locale/find-a-coach.tsx.
 */
import { CompactHero, SiteFooter } from "@/components/site-chrome";
import { CoachDirectory } from "@/components/coaches/directory";
import { CoachFinderContext } from "@/components/coaches/CoachFinderContext";
import { useI18n } from "@/i18n";

export default function FindACoachPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CompactHero
        eyebrow={t("directory.hero.eyebrow")}
        title={
          <>
            {t("directory.hero.titlePre")}
            <span className="text-accent">{t("directory.hero.titleAccent")}</span>
            {t("directory.hero.titlePost")}
          </>
        }
        lede={t("directory.hero.lede")}
      />
      <main id="main">
        <CoachFinderContext />
        <CoachDirectory />
      </main>
      <SiteFooter />
    </div>
  );
}
