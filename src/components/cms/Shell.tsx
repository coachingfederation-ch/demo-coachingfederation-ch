import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FileText, PencilLine, LogOut, Tags, ListTree, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useCms } from "@/i18n/cms";
import { LOCALE_LABELS, LOCALE_ORDER } from "@/i18n/config";

const nav = [
  { to: "/articles", key: "nav.articles", icon: FileText },
  { to: "/articles/new", key: "nav.newArticle", icon: PencilLine },
  { to: "/articles/categories", key: "nav.categories", icon: Tags },
  { to: "/vocabularies", key: "nav.vocabularies", icon: ListTree },
  { to: "/coach-finder", key: "nav.coachFinder", icon: SlidersHorizontal },
] as const;

function Logo({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 100 100" className="h-6 w-6" aria-hidden>
          <path
            d="M63 30a10 10 0 0 1 7 17L45 72l-13 4 4-13 25-25a10 10 0 0 1 2-8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <circle cx="72" cy="74" r="5" fill="var(--teal)" />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold leading-tight text-foreground">{title}</div>
        <div className="truncate text-xs text-muted-foreground">coachingfederation.ch</div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);
  const { t, locale, setLocale } = useCms();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const initials = (email ?? "??").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-border bg-card">
        <div>
          <Logo title={t("nav.workspace")} />
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {nav.map(({ to, key, icon: Icon }) => {
              const active = to === "/articles" ? pathname === "/articles" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors " +
                    (active
                      ? "bg-secondary font-semibold text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div>
          <div className="border-t border-border px-5 py-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("nav.language")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LOCALE_ORDER.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition " +
                    (l === locale
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground")
                  }
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{email ?? t("nav.signedIn")}</div>
            <div className="truncate text-xs text-muted-foreground">{t("nav.role")}</div>
          </div>
          <button
            onClick={handleSignOut}
            title={t("nav.signOut")}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}