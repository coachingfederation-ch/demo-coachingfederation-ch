import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FileText, PencilLine, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const nav = [
  { to: "/articles", label: "Articles", icon: FileText },
  { to: "/articles/new", label: "New article", icon: PencilLine },
] as const;

function Logo() {
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
        <div className="text-[15px] font-semibold leading-tight text-foreground">Insights CMS</div>
        <div className="truncate text-xs text-muted-foreground">coachingfederation.ch</div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);

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
          <Logo />
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {nav.map(({ to, label, icon: Icon }) => {
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
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{email ?? "Signed in"}</div>
            <div className="truncate text-xs text-muted-foreground">Editor</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}