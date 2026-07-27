import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { landingPathForSession } from "@/lib/roles";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing in…" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    // Where a signed-in user lands is decided by their ROLES, never by email.
    const go = async (userId: string | null) => {
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
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Signing you in…
    </div>
  );
}