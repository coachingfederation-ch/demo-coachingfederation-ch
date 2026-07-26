import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";
import { LocaleLink, useCanonicalPath, useI18n } from "@/i18n";
import { LOCALE_LABELS, LOCALE_ORDER, localizePath } from "@/i18n/config";

const navItems = [
  { key: "home", to: "/" },
  { key: "forOrganisations", to: "/for-organisations" },
  { key: "forCoaches", to: "/for-coaches" },
  { key: "insights", to: "/insights" },
  { key: "events", to: "/events" },
  { key: "about", to: "/about" },
] as const;

export function Logo({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const { t } = useI18n();
  return (
    <LocaleLink to="/" aria-label={t("common.nav.homeAria")} className="inline-flex">
      <img
        src={icfLogo.url}
        alt="ICF Switzerland Charter Chapter"
        className={variant === "hero" ? "h-24 w-auto" : "h-16 w-auto"}
      />
    </LocaleLink>
  );
}

export function SiteNav() {
  const { t, locale } = useI18n();
  const path = useCanonicalPath();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav
        aria-label={t("common.nav.primaryLabel")}
        className="hidden items-center rounded-full bg-white/10 p-1 text-[11px] font-semibold lg:inline-flex"
      >
        {navItems.map((i) => (
          <LocaleLink
            key={i.to}
            to={i.to}
            activeOptions={{ exact: true }}
            className="inline-flex h-7 items-center rounded-full px-3 text-white/80 transition hover:text-white data-[status=active]:bg-white data-[status=active]:text-primary data-[status=active]:shadow-sm"
          >
            {t(`common.nav.${i.key}`)}
          </LocaleLink>
        ))}
      </nav>
      <div
        role="group"
        aria-label={t("common.nav.languageLabel")}
        className="inline-flex items-center rounded-full bg-white/10 p-0.5 text-[11px] font-semibold"
      >
        {LOCALE_ORDER.map((l) => (
          <a
            key={l}
            href={localizePath(path, l)}
            hrefLang={l}
            onClick={() => {
              try {
                window.localStorage.setItem("icf-locale", l);
              } catch {
                /* ignore */
              }
            }}
            className={
              "inline-flex h-6 items-center rounded-full px-2.5 uppercase tracking-wider " +
              (l === locale ? "bg-white text-primary shadow-sm" : "text-white/80 hover:text-white")
            }
          >
            {LOCALE_LABELS[l]}
          </a>
        ))}
      </div>
      <a
        href="#find-a-coach"
        className="inline-flex h-8 items-center rounded-full bg-accent px-4 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground transition hover:opacity-90"
      >
        {t("common.nav.findACoach")}
      </a>
    </div>
  );
}

export function SiteHeaderBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        "flex flex-wrap items-start justify-between gap-4 " + (compact ? "mb-0" : "mb-10")
      }
    >
      <Logo variant={compact ? "compact" : "hero"} />
      <SiteNav />
    </div>
  );
}

export function CompactHero({
  eyebrow,
  title,
  lede,
  ctaLabel,
  ctaHref = "#",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <header className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-8 pt-6 pb-20">
        <SiteHeaderBar compact />
        <div className="mt-14 max-w-3xl">
          <p className="eyebrow !text-accent">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">{lede}</p>
          {ctaLabel && (
            <div className="mt-8">
              <a
                href={ctaHref}
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                {ctaLabel} →
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-8 py-6 text-xs sm:flex-row sm:items-center">
        <p className="text-white/70">© {new Date().getFullYear()} {t("common.footer.copyright")}</p>
        <nav aria-label={t("common.nav.footerLabel")} className="flex flex-wrap items-center gap-4">
          <LocaleLink to="/for-organisations" className="text-white/80 hover:text-white">{t("common.nav.forOrganisations")}</LocaleLink>
          <LocaleLink to="/for-coaches" className="text-white/80 hover:text-white">{t("common.nav.forCoaches")}</LocaleLink>
          <LocaleLink to="/insights" className="text-white/80 hover:text-white">{t("common.nav.insights")}</LocaleLink>
          <LocaleLink to="/events" className="text-white/80 hover:text-white">{t("common.nav.events")}</LocaleLink>
          <LocaleLink to="/about" className="text-white/80 hover:text-white">{t("common.nav.about")}</LocaleLink>
          <a href="#" className="text-white/80 hover:text-white">{t("common.footer.privacy")}</a>
          <a href="#" className="text-white/80 hover:text-white">{t("common.footer.ethics")}</a>
          <a href="#" className="text-white/80 hover:text-white">{t("common.footer.imprint")}</a>
        </nav>
      </div>
    </footer>
  );
}

export const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(20,20,60,0.04),0_8px_20px_-14px_rgba(20,20,60,0.08)]";