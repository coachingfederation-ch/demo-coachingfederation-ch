import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { landingPathForSession } from "@/lib/roles";
import { safeNext } from "@/lib/safe-next";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search.next) }),
  head: () => ({
    meta: [{ title: "Signing in…" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    // Where a signed-in user lands is decided by their ROLES, never by email.
    const go = async (userId: string | null) => {
      // A preserved return target (OAuth consent, invite links) wins over the
      // usual role-based landing page.
      if (userId && next) {
        window.location.href = next;
        return;
      }
      const path = userId ? await landingPathForSession(userId) : "/auth";
      if (!cancelled) navigate({ to: path, replace: true });
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        void go(data.session.user.id);
        return;
      }
      // Session may still be hydrating from the URL — wait briefly.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) void go(session.user.id);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
      timer = setTimeout(() => {
        void supabase.auth.getSession().then(({ data }) => go(data.session?.user.id ?? null));
      }, 2000);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, [navigate, next]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Signing you in…
    </div>
  );
}
