/**
 * Member Area chrome — deliberately minimal and self-contained.
 *
 * No CMS sidebar and no links into any staff screen: a member's only surface
 * is their own directory profile.
 */
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/i18n/cms";
import { LOCALE_LABELS, LOCALE_ORDER } from "@/i18n/config";

export function MemberShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useCms();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-4">
          <img src={icfLogo.url} alt="ICF Switzerland Charter Chapter" className="h-12 w-auto" />
          <span className="text-sm font-semibold">{t("member.areaTitle")}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {LOCALE_ORDER.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition " +
                    (l === locale
                      ? "bg-primary-foreground text-primary"
                      : "bg-white/10 text-primary-foreground hover:bg-white/20")
                  }
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              title={t("nav.signOut")}
              className="rounded-md p-1.5 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}