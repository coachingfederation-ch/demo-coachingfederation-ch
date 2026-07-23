import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/articles/$id")({
  head: () => ({
    meta: [
      { title: "Editor — ICF Switzerland Insights CMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorPage,
});

type Status = "draft" | "scheduled" | "published" | "unpublished";
type Lang = "en" | "fr" | "de" | "it";

interface Article {
  id: string;
  language: Lang;
  title: string;
  excerpt: string;
  content: string;
  status: Status;
  scheduled_at: string | null;
  published_at: string | null;
  first_published_at: string | null;
  updated_at: string;
}

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { cls: string; dot: string; label: string }> = {
    draft: { cls: "bg-warn-soft text-[color:var(--warn)]", dot: "var(--warn)", label: "Draft" },
    scheduled: { cls: "bg-teal-soft text-teal-foreground", dot: "var(--teal)", label: "Scheduled" },
    published: { cls: "bg-teal-soft text-teal-foreground", dot: "var(--teal)", label: "Published" },
    unpublished: { cls: "bg-secondary text-muted-foreground", dot: "var(--muted-foreground)", label: "Unpublished" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function EditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosave = useRef(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setArticle(data as Article);
      });
  }, [id]);

  // Autosave title/excerpt/content/language
  useEffect(() => {
    if (!article) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("articles")
        .update({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          language: article.language,
        })
        .eq("id", article.id);
      if (!error) setSaveState("saved");
      else setSaveState("idle");
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.title, article?.excerpt, article?.content, article?.language]);

  const update = (patch: Partial<Article>) => setArticle((a) => (a ? { ...a, ...patch } : a));

  const publishNow = async () => {
    if (!article) return;
    const now = new Date().toISOString();
    const patch = {
      status: "published" as const,
      published_at: now,
      first_published_at: article.first_published_at ?? now,
      scheduled_at: null,
    };
    const { error } = await supabase.from("articles").update(patch).eq("id", article.id);
    if (!error) update(patch);
  };

  const schedule = async () => {
    if (!article) return;
    const input = window.prompt(
      "Publish at (YYYY-MM-DD HH:MM, local time)",
      new Date(Date.now() + 3600_000).toISOString().slice(0, 16).replace("T", " "),
    );
    if (!input) return;
    const dt = new Date(input.replace(" ", "T"));
    if (isNaN(dt.getTime())) {
      alert("Invalid date");
      return;
    }
    const patch = {
      status: "scheduled" as const,
      scheduled_at: dt.toISOString(),
      first_published_at: article.first_published_at ?? dt.toISOString(),
    };
    const { error } = await supabase.from("articles").update(patch).eq("id", article.id);
    if (!error) update(patch);
  };

  const unpublish = async () => {
    if (!article) return;
    const patch = { status: "unpublished" as const, scheduled_at: null };
    const { error } = await supabase.from("articles").update(patch).eq("id", article.id);
    if (!error) update(patch);
  };

  const remove = async () => {
    if (!article) return;
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    const { error } = await supabase.from("articles").delete().eq("id", article.id);
    if (!error) navigate({ to: "/articles" });
  };

  if (notFound) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-10 py-16 text-center">
          <h1 className="text-2xl font-bold">Article not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been deleted.</p>
          <Link to="/articles" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            ← Back to articles
          </Link>
        </div>
      </Shell>
    );
  }

  if (!article) {
    return (
      <Shell>
        <div className="px-10 py-16 text-sm text-muted-foreground">Loading…</div>
      </Shell>
    );
  }

  const languageLocked = !!article.first_published_at;
  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved just now" : `Last saved ${new Date(article.updated_at).toLocaleTimeString()}`;

  return (
    <Shell>
      <div className="flex items-center justify-between border-b border-border bg-card px-8 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
            Articles
          </Link>
          <StatusPill status={article.status} />
          <span className="text-xs text-muted-foreground">{saveLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {article.status === "published" || article.status === "scheduled" ? (
            <button
              onClick={unpublish}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Unpublish
            </button>
          ) : null}
          <button
            onClick={schedule}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Schedule…
          </button>
          <button
            onClick={publishNow}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
          >
            {article.status === "published" ? "Republish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-8 px-8 py-8">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                disabled={languageLocked && article.language !== l.code}
                onClick={() => update({ language: l.code })}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition " +
                  (article.language === l.code
                    ? "bg-primary text-primary-foreground"
                    : languageLocked
                      ? "cursor-not-allowed border border-dashed border-border text-muted-foreground opacity-50"
                      : "bg-card border border-border text-foreground hover:bg-secondary")
                }
              >
                {l.code.toUpperCase()} <span className="font-medium opacity-80">· {l.label}</span>
              </button>
            ))}
            {languageLocked ? (
              <span className="ml-2 text-xs text-muted-foreground">Locked after first publication</span>
            ) : null}
          </div>

          <input
            value={article.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Article title"
            className="mt-8 w-full border-none bg-transparent text-4xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <textarea
            value={article.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            placeholder="Lead paragraph — a short summary that appears under the headline and in article cards."
            rows={2}
            className="mt-4 w-full resize-none border-none bg-transparent text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/60"
          />

          <textarea
            value={article.content}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="Body text — write your article here. Markdown-friendly."
            rows={20}
            className="mt-6 w-full resize-y rounded-2xl border border-border bg-card p-5 text-[15px] leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-ring/20"
          />
        </article>

        <aside className="space-y-6">
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Publishing
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusPill status={article.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-semibold">{article.language.toUpperCase()}</span>
              </div>
              {article.published_at ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span>{new Date(article.published_at).toLocaleString()}</span>
                </div>
              ) : null}
              {article.scheduled_at ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{new Date(article.scheduled_at).toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{new Date(article.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Danger zone
            </div>
            <button
              onClick={remove}
              className="w-full rounded-xl border border-destructive/40 bg-card px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Delete article
            </button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}