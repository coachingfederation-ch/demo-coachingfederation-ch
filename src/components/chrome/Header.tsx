/**
 * Site header: logo, primary nav, language switcher, account control and the
 * compact hero variant used on inner pages. Toggles MobileMenu on small screens.
 */
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, User, X } from "lucide-react";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";
import { LocaleLink, useCanonicalPath, useI18n } from "@/i18n";
import {
  CARD_SHADOW,
  MENU_ITEM,
  navItems,
  signOutHere,
  useDismissable,
  useHeaderSession,
} from "@/components/chrome/constants";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { MobileMenu } from "@/components/chrome/MobileMenu";

function Logo({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const { t } = useI18n();
  return (
    <LocaleLink to="/" aria-label={t("common.nav.homeAria")} className="inline-flex">
      <img
        src={icfLogo.url}
        alt="The Switzerland Chapter of ICF"
        className={variant === "hero" ? "h-16 w-auto sm:h-24" : "h-12 w-auto sm:h-16"}
      />
    </LocaleLink>
  );
}

/** Member login (signed out) / account menu (signed in). */
function AccountControl() {
  const { t } = useI18n();
  const { userId, roles } = useHeaderSession();
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useDismissable(open, close);

  if (!userId) {
    return (
      <Link
        to="/auth"
        search={{ next: undefined }}
        className="hidden h-10 items-center rounded-full border border-white/25 px-4 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:border-white/60 hover:bg-white/10 sm:inline-flex"
      >
        {t("common.nav.memberLogin")}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("common.nav.accountMenu")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:border-white/60 hover:bg-white/10"
      >
        <User className="h-3.5 w-3.5" aria-hidden="true" />
        {t("common.nav.myAccount")}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>
      {open && (
        <div
          className={
            "absolute right-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-border/70 bg-card py-1 " +
            CARD_SHADOW
          }
        >
          <Link to="/my-profile" onClick={close} className={MENU_ITEM}>
            {t("common.nav.myProfile")}
          </Link>
          {roles.isEditor && (
            <Link to="/articles" onClick={close} className={MENU_ITEM}>
              {t("common.nav.insightsCms")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOutHere()}
            className={MENU_ITEM + " w-full"}
          >
            {t("common.nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}

function SiteNav() {
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
        className="hidden items-center gap-1 text-[12px] font-semibold lg:inline-flex"
      >
        {navItems.map((i) => (
          <LocaleLink
            key={i.to}
            to={i.to}
            activeOptions={{ exact: true }}
            className="relative inline-flex h-10 items-center px-3 text-white/75 transition after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-accent after:opacity-0 after:transition hover:text-white data-[status=active]:text-white data-[status=active]:after:opacity-100"
          >
            {t(`common.nav.${i.key}`)}
          </LocaleLink>
        ))}
      </nav>
      <LanguageSwitcher />
      <AccountControl />
      <LocaleLink
        to="/find-a-coach"
        className="hidden h-10 items-center rounded-full bg-accent px-5 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground transition hover:brightness-105 lg:inline-flex"
      >
        {t("common.nav.findACoach")}
      </LocaleLink>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-mobile-nav"
        aria-label={menuOpen ? t("common.nav.menuClose") : t("common.nav.menuOpen")}
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10 lg:hidden"
      >
        {menuOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

export function SiteHeaderBar({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div
      className={
        "relative flex items-center justify-between gap-3 sm:items-start sm:gap-4 " +
        (compact ? "mb-0" : "mb-10")
      }
    >
      {/* WCAG 2.4.1: lets keyboard users bypass the header on every page. */}
      <a
        href="#main"
        className="sr-only left-0 top-0 z-50 rounded-full bg-white text-sm font-semibold text-primary focus:not-sr-only focus:absolute focus:!px-4 focus:!py-2.5"
      >
        {t("common.nav.skipToContent")}
      </a>
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
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-20 sm:px-8">
        <SiteHeaderBar compact />
        <div className="mt-14 max-w-3xl">
          <p className="eyebrow !text-accent">{eyebrow}</p>
          <h1 className="display-xl mt-4">{title}</h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.65] text-white/85">{lede}</p>
          {ctaLabel && (
            <div className="mt-9">
              <a
                href={ctaHref}
                className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
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
