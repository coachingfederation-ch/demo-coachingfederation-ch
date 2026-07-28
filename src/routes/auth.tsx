import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useCms } from "@/i18n/cms";
import { LOCALE_LABELS, LOCALE_ORDER } from "@/i18n/config";
import { landingPathForSession } from "@/lib/roles";
import { getMemberClaimStatus } from "@/lib/members.functions";
import { safeNext } from "@/lib/safe-next";

export const Route = createFileRoute("/auth")({
  // `next` lets a flow that needed sign-in (e.g. the OAuth consent screen)
  // resume exactly where it left off.
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search.next) }),
  head: () => ({
    meta: [
      { title: "Sign in — ICF Switzerland Insights CMS" },
      {
        name: "description",
        content: "Sign in to the ICF Switzerland Insights editorial workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { t, locale, setLocale } = useCms();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // The claim entry point stays hidden until the chapter opens the Member Area
  // after the LIVE cutover — same gate the server functions enforce.
  const claimStatus = useQuery({
    queryKey: ["member-claim-status"],
    queryFn: () => getMemberClaimStatus(),
  });

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      if (next) {
        window.location.href = next;
        return;
      }
      navigate({ to: await landingPathForSession(data.session.user.id) });
    });
  }, [navigate, next]);

  /** Destination is role-driven: staff -> CMS, member -> Member Area. */
  const goToArea = async () => {
    if (next) {
      window.location.href = next;
      return;
    }
    const { data } = await supabase.auth.getUser();
    navigate({ to: data.user ? await landingPathForSession(data.user.id) : "/auth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              window.location.origin +
              (next ? `/auth/callback?next=${encodeURIComponent(next)}` : "/articles"),
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await goToArea();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
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
          <h1 className="text-xl font-bold tracking-tight">{t("nav.workspace")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? t("auth.signInSub") : t("auth.signUpSub")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {LOCALE_ORDER.map((l) => (
              <button
                key={l}
                type="button"
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
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> {t("auth.or")}{" "}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 disabled:opacity-60"
          >
            {loading
              ? t("auth.wait")
              : mode === "signin"
                ? t("auth.signIn")
                : t("auth.createAccount")}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" ? t("auth.newHere") : t("auth.haveAccount")}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? t("auth.createAccount") : t("auth.signIn")}
          </button>
        </p>
        {claimStatus.data?.enabled ? (
          <p className="mt-2 text-center text-xs">
            <Link to="/claim" className="font-semibold text-primary hover:underline">
              {t("claim.signUpPrompt")}
            </Link>
          </p>
        ) : null}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            ← Back to icf.ch
          </Link>
        </p>
      </div>
    </div>
  );
}
