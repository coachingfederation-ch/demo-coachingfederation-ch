import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useCanonicalPath, useI18n } from "@/i18n";
import { isLocale, LOCALE_LABELS, localizePath, type Locale } from "@/i18n/config";

const KEY = "icf-locale";
/** Set once the visitor has acted on the notice — it then never returns. */
const DISMISS_KEY = "icf-locale-notice-seen";

function markSeen() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* storage unavailable — the notice simply reappears next visit */
  }
}

/** Offers — never forces — the visitor's previously chosen language. */
export function LanguageNotice() {
  const { t, locale } = useI18n();
  const path = useCanonicalPath();
  const router = useRouter();
  const [preferred, setPreferred] = useState<Locale | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) {
        setPreferred(null);
        return;
      }
      const stored = window.localStorage.getItem(KEY);
      if (isLocale(stored) && stored !== locale) setPreferred(stored);
      else setPreferred(null);
    } catch {
      setPreferred(null);
    }
  }, [locale]);

  if (!preferred) return null;

  // Account pages (member area, CMS, auth, claim) exist in English only, so a
  // localized target would 404. Ask the router instead of maintaining a list.
  const target = localizePath(path, preferred);
  if (!router.getMatchedRoutes(target).foundRoute) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("common.languageNotice.text")}</p>
        <div className="flex items-center gap-2">
          <a
            href={target}
            onClick={markSeen}
            className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
          >
            {t("common.languageNotice.cta")} · {LOCALE_LABELS[preferred]}
          </a>
          <button
            onClick={() => {
              markSeen();
              setPreferred(null);
            }}
            className="inline-flex h-8 items-center rounded-full border border-border/70 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("common.languageNotice.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
