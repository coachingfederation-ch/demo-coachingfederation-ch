/**
 * Shared building blocks for the two sign-in screens.
 *
 * `/auth` is the member entry point (email + password only — members are
 * imported and must claim an account first), and `/staff-sign-in` is the
 * low-key internal entry point that additionally offers Google. Both reuse the
 * same session handling, so there is exactly one auth system: the screens
 * differ only in which affordances they show.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/i18n/cms";
import { LOCALE_LABELS, LOCALE_ORDER } from "@/i18n/config";
import { landingPathForSession } from "@/lib/roles";

/** Destination is role-driven: staff -> CMS, member -> Member Area. */
export function useAuthSession(next: string | undefined) {
  const navigate = useNavigate();

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

  return async () => {
    if (next) {
      window.location.href = next;
      return;
    }
    const { data } = await supabase.auth.getUser();
    navigate({ to: data.user ? await landingPathForSession(data.user.id) : "/auth" });
  };
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { locale, setLocale } = useCms();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
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
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {LOCALE_ORDER.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={l === locale}
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
        {children}
      </div>
    </div>
  );
}

/** Email + password sign-in. No sign-up: accounts are created by claiming. */
export function SignInForm({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const { t } = useCms();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        required
        autoComplete="email"
        aria-label={t("auth.emailPlaceholder")}
        placeholder={t("auth.emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
      />
      <input
        type="password"
        required
        minLength={6}
        autoComplete="current-password"
        aria-label={t("auth.passwordPlaceholder")}
        placeholder={t("auth.passwordPlaceholder")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 disabled:opacity-60"
      >
        {loading ? t("auth.wait") : t("auth.signIn")}
      </button>
    </form>
  );
}