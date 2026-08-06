/**
 * Locale dropdown shown in the header nav bar. Renders links to the same page
 * in every supported locale and persists the choice for future visits.
 */
import * as React from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useCanonicalPath, useI18n } from "@/i18n";
import { LOCALE_LABELS, LOCALE_ORDER, localizePath } from "@/i18n/config";
import { CARD_SHADOW, setStoredLocale, useDismissable } from "@/components/chrome/constants";

export function LanguageSwitcher() {
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
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-3 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:border-white/60 hover:bg-white/10"
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
