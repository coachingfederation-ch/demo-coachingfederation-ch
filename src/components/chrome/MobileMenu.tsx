/**
 * Mobile navigation sheet shown under the header on small screens, plus the
 * account links block reused inside it. Rendered by Header's SiteNav.
 */
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { LocaleLink, useI18n } from "@/i18n";
import { navItems, signOutHere, useHeaderSession } from "@/components/chrome/constants";

/** Account entries inside the mobile menu sheet. */
export function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
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

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <nav
      id="site-mobile-nav"
      aria-label={t("common.nav.primaryLabel")}
      className="absolute inset-x-0 top-full z-40 mt-3 flex flex-col rounded-2xl bg-hero p-2 text-[13px] font-semibold shadow-lg ring-1 ring-white/20 lg:hidden"
    >
      {navItems.map((i) => (
        <LocaleLink
          key={i.to}
          to={i.to}
          activeOptions={{ exact: true }}
          onClick={onClose}
          className="rounded-full px-4 py-3 text-white/85 transition hover:bg-white/10 hover:text-white data-[status=active]:bg-white/15 data-[status=active]:text-white"
        >
          {t(`common.nav.${i.key}`)}
        </LocaleLink>
      ))}
      <LocaleLink
        to="/find-a-coach"
        onClick={onClose}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground"
      >
        {t("common.nav.findACoach")}
      </LocaleLink>
      <MobileAccountLinks onNavigate={onClose} />
    </nav>
  );
}
