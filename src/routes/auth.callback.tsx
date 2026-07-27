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
    // Where a signed-in user lands is decided by their ROLES, never by email.
    const go = async (userId: string | null) => {
      const path = userId ? await landingPathForSession(userId) : "/auth";
      if (!cancelled) navigate({ to: path, replace: true });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) return go(data.session.user.id);
      // Session may still be hydrating from the URL — wait briefly.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) go(session.user.id);
      });
      const timer = setTimeout(() => {
        supabase.auth.getSession().then(({ data }) => go(data.session?.user.id ?? null));
      }, 2000);
      return () => {
        clearTimeout(timer);
        sub.subscription.unsubscribe();
      };
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Signing you in…
    </div>
  );
}