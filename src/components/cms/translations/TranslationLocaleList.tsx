/**
 * Presentational list of per-locale translation rows: locale label, status
 * badge, translate/open buttons and an optional inline editor slot. This is
 * the one piece of markup every translation panel (articles, events) shares,
 * so the locale-tab structure only exists once.
 */
import { Loader2 } from "lucide-react";
import type { TranslationLocaleItem } from "./types";

export function TranslationLocaleList({ items }: { items: TranslationLocaleItem[] }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.locale} className="border-t border-border pt-3 first:border-0 first:pt-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{item.locale.toUpperCase()}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.badgeClassName}`}
            >
              {item.badgeLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={item.onTranslate}
              disabled={item.translateDisabled}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              {item.translating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {item.translateLabel}
            </button>
            {item.showOpenToggle ? (
              <button
                type="button"
                onClick={item.onToggleOpen}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                {item.isOpen ? item.closeLabel : item.openLabel}
              </button>
            ) : null}
          </div>
          {item.isOpen ? (item.editor ?? null) : null}
        </div>
      ))}
    </>
  );
}
