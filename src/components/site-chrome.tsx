import * as React from "react";
import { Globe, Menu, X } from "lucide-react";
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
        className={variant === "hero" ? "h-16 w-auto sm:h-24" : "h-12 w-auto sm:h-16"}
      />
    </LocaleLink>
  );
}

function setStoredLocale(l: string) {
  try {
    window.localStorage.setItem("icf-locale", l);
  } catch {
    /* ignore */
  }
}

function CompactLanguageSwitcher() {
  const { t, locale } = useI18n();
  const path = useCanonicalPath();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("common.nav.languageSwitch")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-sm"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        {LOCALE_LABELS[locale]}
      </button>
      {open && (
        <div
          role="menu"
          className={
            "absolute right-0 z-50 mt-2 min-w-[6rem] overflow-hidden rounded-xl border border-border/70 bg-card py-1 " +
            CARD_SHADOW
          }
        >
          {LOCALE_ORDER.filter((l) => l !== locale).map((l) => (
            <a
              key={l}
              role="menuitem"
              href={localizePath(path, l)}
              hrefLang={l}
              onClick={() => {
                setStoredLocale(l);
                setOpen(false);
              }}
              className="block px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {LOCALE_LABELS[l]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteNav() {
  const { t, locale } = useI18n();
  const path = useCanonicalPath();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [path, locale]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
        className="hidden items-center rounded-full bg-white/10 p-0.5 text-[11px] font-semibold lg:inline-flex"
      >
        {LOCALE_ORDER.map((l) => (
          <a
            key={l}
            href={localizePath(path, l)}
            hrefLang={l}
            onClick={() => setStoredLocale(l)}
            className={
              "inline-flex h-6 items-center rounded-full px-2.5 uppercase tracking-wider " +
              (l === locale ? "bg-white text-primary shadow-sm" : "text-white/80 hover:text-white")
            }
          >
            {LOCALE_LABELS[l]}
          </a>
        ))}
      </div>
      <CompactLanguageSwitcher />
      <LocaleLink
        to="/find-a-coach"
        className="hidden h-8 items-center rounded-full bg-accent px-4 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground transition hover:opacity-90 lg:inline-flex"
      >
        {t("common.nav.findACoach")}
      </LocaleLink>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-mobile-nav"
        aria-label={menuOpen ? t("common.nav.menuClose") : t("common.nav.menuOpen")}
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
      >
        {menuOpen ? <Menu className="hidden" /> : null}
        {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
      </button>
      {menuOpen && (
        <nav
          id="site-mobile-nav"
          aria-label={t("common.nav.primaryLabel")}
          className="absolute inset-x-5 top-full z-40 mt-3 flex flex-col rounded-2xl bg-white/10 p-2 text-[13px] font-semibold backdrop-blur-sm sm:inset-x-8 lg:hidden"
        >
          {navItems.map((i) => (
            <LocaleLink
              key={i.to}
              to={i.to}
              activeOptions={{ exact: true }}
              onClick={() => setMenuOpen(false)}
              className="rounded-full px-4 py-2.5 text-white/85 transition hover:text-white data-[status=active]:bg-white data-[status=active]:text-primary"
            >
              {t(`common.nav.${i.key}`)}
            </LocaleLink>
          ))}
          <LocaleLink
            to="/find-a-coach"
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex h-9 items-center justify-center rounded-full bg-accent px-4 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground"
          >
            {t("common.nav.findACoach")}
          </LocaleLink>
        </nav>
      )}
    </div>
  );
}

export function SiteHeaderBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        "relative flex items-center justify-between gap-3 sm:items-start sm:gap-4 " +
        (compact ? "mb-0" : "mb-10")
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
          <LocaleLink to="/find-a-coach" className="text-white/80 hover:text-white">{t("common.nav.findACoach")}</LocaleLink>
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