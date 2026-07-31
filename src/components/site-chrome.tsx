import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Globe, Menu, User, X } from "lucide-react";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";
import { LocaleLink, useCanonicalPath, useI18n } from "@/i18n";
import { LOCALE_LABELS, LOCALE_ORDER, localizePath } from "@/i18n/config";
import { supabase } from "@/integrations/supabase/client";
import { myRolesQueryOptions, EMPTY_ROLES } from "@/lib/roles";

const navItems = [
  { key: "home", to: "/" },
  { key: "forOrganisations", to: "/for-organisations" },
  { key: "forCoaches", to: "/for-coaches" },
  { key: "insights", to: "/insights" },
  { key: "europePulse", to: "/europe-pulse" },
  { key: "events", to: "/events" },
  { key: "about", to: "/about" },
] as const;

export function Logo({ variant = "hero" }: { variant?: "hero" | "compact" }) {
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

function setStoredLocale(l: string) {
  try {
    window.localStorage.setItem("icf-locale", l);
  } catch {
    /* ignore */
  }
}

/**
 * Header-local session state. The header renders during SSR, so the signed-out
 * shape is what hydrates; the client query then resolves the real state and the
 * shared `onAuthStateChange` invalidation keeps it honest after sign-in/out.
 */
function useHeaderSession() {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
    staleTime: 5 * 60_000,
  });
  const userId = session.data ?? null;
  const roles = useQuery({ ...myRolesQueryOptions(userId), enabled: session.isSuccess });

  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ["auth-user-id"] });
      void queryClient.invalidateQueries({ queryKey: ["my-roles"] });
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  return { userId, roles: roles.data ?? EMPTY_ROLES };
}

/** Shared dropdown primitive: outside-click + Escape close. */
function useDismissable(open: boolean, close: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const MENU_ITEM =
  "block min-h-11 px-4 py-3 text-left text-[12px] font-semibold leading-5 text-foreground/80 hover:bg-muted hover:text-foreground";

function LanguageSwitcher() {
  const { t, locale } = useI18n();
  const path = useCanonicalPath();
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useDismissable(open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("common.nav.languageSwitch")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:bg-white/20"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        {LOCALE_LABELS[locale]}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>
      {open && (
        <ul
          aria-label={t("common.nav.languageLabel")}
          className={
            "absolute right-0 z-50 mt-2 min-w-[6rem] overflow-hidden rounded-xl border border-border/70 bg-card py-1 " +
            CARD_SHADOW
          }
        >
          {LOCALE_ORDER.map((l) => (
            <li key={l}>
              <a
                href={localizePath(path, l)}
                hrefLang={l}
                aria-current={l === locale ? "true" : undefined}
                onClick={() => {
                  setStoredLocale(l);
                  setOpen(false);
                }}
                className={
                  "block min-h-11 px-4 py-3 text-[11px] font-semibold uppercase leading-5 tracking-wider hover:bg-muted hover:text-foreground " +
                  (l === locale ? "bg-muted text-foreground" : "text-foreground/80")
                }
              >
                {LOCALE_LABELS[l]}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function signOutHere() {
  await supabase.auth.signOut();
  window.location.reload();
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
        className="hidden h-8 items-center rounded-full bg-white/10 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:bg-white/20 sm:inline-flex"
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
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:bg-white/20"
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

/** Account entries inside the mobile menu sheet. */
function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  const { userId, roles } = useHeaderSession();
  const item = "rounded-full px-4 py-2.5 text-left text-white/85 transition hover:text-white";

  return (
    <div className="mt-2 flex flex-col border-t border-white/15 pt-2">
      {!userId ? (
        <Link to="/auth" search={{ next: undefined }} onClick={onNavigate} className={item}>
          {t("common.nav.memberLogin")}
        </Link>
      ) : (
        <>
          <Link to="/my-profile" onClick={onNavigate} className={item}>
            {t("common.nav.myProfile")}
          </Link>
          {roles.isEditor && (
            <Link to="/articles" onClick={onNavigate} className={item}>
              {t("common.nav.insightsCms")}
            </Link>
          )}
          <button type="button" onClick={() => void signOutHere()} className={item}>
            {t("common.nav.signOut")}
          </button>
        </>
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
      <LanguageSwitcher />
      <AccountControl />
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
        {menuOpen ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Menu className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      {menuOpen && (
        <nav
          id="site-mobile-nav"
          aria-label={t("common.nav.primaryLabel")}
          className="absolute inset-x-0 top-full z-40 mt-3 flex flex-col rounded-2xl bg-hero p-2 text-[13px] font-semibold shadow-xl ring-1 ring-white/15 lg:hidden"
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
          <MobileAccountLinks onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}
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
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">{lede}</p>
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
        <p className="text-white/80">
          © {new Date().getFullYear()} {t("common.footer.copyright")}
        </p>
        <nav aria-label={t("common.nav.footerLabel")} className="flex flex-wrap items-center gap-4">
          <LocaleLink to="/find-a-coach" className="text-white/80 hover:text-white">
            {t("common.nav.findACoach")}
          </LocaleLink>
          <LocaleLink to="/for-organisations" className="text-white/80 hover:text-white">
            {t("common.nav.forOrganisations")}
          </LocaleLink>
          <LocaleLink to="/for-coaches" className="text-white/80 hover:text-white">
            {t("common.nav.forCoaches")}
          </LocaleLink>
          <LocaleLink to="/insights" className="text-white/80 hover:text-white">
            {t("common.nav.insights")}
          </LocaleLink>
          <LocaleLink to="/events" className="text-white/80 hover:text-white">
            {t("common.nav.events")}
          </LocaleLink>
          <LocaleLink to="/about" className="text-white/80 hover:text-white">
            {t("common.nav.about")}
          </LocaleLink>
          <LocaleLink to="/privacy" className="text-white/80 hover:text-white">
            {t("common.footer.privacy")}
          </LocaleLink>
          <a
            href="https://coachingfederation.org/credentialing/coaching-ethics/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white"
          >
            {t("common.footer.ethics")}
          </a>
          <LocaleLink to="/imprint" className="text-white/80 hover:text-white">
            {t("common.footer.imprint")}
          </LocaleLink>
        </nav>
      </div>
    </footer>
  );
}

export const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(20,20,60,0.04),0_8px_20px_-14px_rgba(20,20,60,0.08)]";
