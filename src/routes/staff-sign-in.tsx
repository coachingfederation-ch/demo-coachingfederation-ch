/**
 * Internal (staff/admin) sign-in.
 *
 * Deliberately separate from `/auth`: Google is an internal convenience for
 * chapter staff, not a public member entry point. It is the same auth system —
 * same provider, same `/auth/callback`, same role-driven landing — so an
 * account signing in here still lands wherever its ROLES say (an account with
 * no roles ends up on `/no-access`).
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { lovable } from "@/integrations/lovable";
import { useCms } from "@/i18n/cms";
import { safeNext } from "@/lib/safe-next";
import { AuthCard, SignInForm, useAuthSession } from "@/components/auth/auth-screen";

export const Route = createFileRoute("/staff-sign-in")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search.next) }),
  head: () => ({
    meta: [
      { title: "Internal sign-in — ICF Switzerland" },
      { name: "description", content: "Sign-in for ICF Switzerland staff and administrators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffSignInPage,
});

function StaffSignInPage() {
  const { t } = useCms();
  const { next } = Route.useSearch();
  const goToArea = useAuthSession(next);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri:
        window.location.origin +
        "/auth/callback" +
        (next ? `?next=${encodeURIComponent(next)}` : ""),
    });
    if (result.error) {
      setError(result.error.message ?? t("auth.googleError"));
      return;
    }
    if (result.redirected) return;
    await goToArea();
  };

  return (
    <AuthCard title={t("auth.staffTitle")} subtitle={t("auth.staffSub")}>
      <button
        onClick={handleGoogle}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
          <path
            fill="#EA4335"
            d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.4 13.4 17.7 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.4z"
          />
          <path
            fill="#FBBC05"
            d="M10.4 28.8c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.2 0 11.5-2.1 15.3-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.7 2.3-6.3 0-11.6-3.9-13.6-9.6l-7.8 6C6.5 42.6 14.6 48 24 48z"
          />
        </svg>
        {t("auth.google")}
      </button>
      {error ? (
        <p role="alert" className="mb-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mb-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> {t("auth.or")}{" "}
        <span className="h-px flex-1 bg-border" />
      </div>

      <SignInForm onSignedIn={goToArea} />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link to="/auth" search={{ next }} className="hover:underline">
          {t("auth.backToMemberSignIn")}
        </Link>
      </p>
    </AuthCard>
  );
}
