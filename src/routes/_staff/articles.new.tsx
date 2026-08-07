/**
 * CMS "Create Article" route (/_staff/articles/new).
 * Exports: Route. Renders the initial language selection and creation
 * interface for starting a new Insight article.
 */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { requireStaffAccess, ARTICLE_ROLES } from "@/lib/staff-guard";
import { useState } from "react";
import { Shell } from "@/components/cms/Shell";
import { useCms } from "@/i18n/cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_staff/articles/new")({
  beforeLoad: ({ context }) => requireStaffAccess(context.queryClient, ARTICLE_ROLES),
  head: () => ({
    meta: [
      { title: "New article — The Switzerland Chapter of ICF Insights CMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewArticlePage,
});

const LANGS = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
] as const;

function NewArticlePage() {
  const navigate = useNavigate();
  const { t } = useCms();
  const [lang, setLang] = useState<(typeof LANGS)[number]["code"]>("en");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setCreating(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError(t("new.notSignedIn"));
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from("articles")
      .insert({
        language: lang,
        author_id: userData.user.id,
        // The four-eye rule keys off who *created* the row, which is not
        // necessarily the byline chosen later in the editor.
        created_by: userData.user.id,
        title: "Untitled",
      })
      .select("id")
      .single();
    if (error) {
      setError(error.message);
      setCreating(false);
      return;
    }
    navigate({ to: "/articles/$id", params: { id: data.id } });
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl px-10 py-16">
        <h1 className="text-2xl font-bold tracking-tight">{t("new.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("new.subtitle")}</p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={
                "rounded-2xl border p-4 text-left transition " +
                (lang === l.code
                  ? "border-primary bg-secondary/70"
                  : "border-border bg-card hover:bg-secondary/40")
              }
            >
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                {l.code}
              </div>
              <div className="mt-1 text-sm font-semibold">{l.label}</div>
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-xs text-destructive">{error}</p> : null}

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={create}
            disabled={creating}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 disabled:opacity-60"
          >
            {creating ? t("new.creating") : t("new.create")}
          </button>
          <Link
            to="/articles"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            {t("new.cancel")}
          </Link>
        </div>
      </div>
    </Shell>
  );
}
