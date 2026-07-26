import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Image as ImageIcon, Upload, X } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownToolbar } from "@/components/cms/MarkdownToolbar";
import { TranslationsPanel } from "@/components/cms/TranslationsPanel";
import { authorName, categoryLabel, type CategoryRow } from "@/lib/articles";
import { useCms } from "@/i18n/cms";

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
  category: string | null;
  category_id: string | null;
  author_id: string;
  content_updated_at: string | null;
  featured_image_url: string | null;
  is_featured: boolean;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

function StatusPill({ status, t }: { status: Status; t: (k: string) => string }) {
  const map: Record<Status, { cls: string; dot: string; label: string }> = {
    draft: { cls: "bg-warn-soft text-[color:var(--warn)]", dot: "var(--warn)", label: t("status.draft") },
    scheduled: { cls: "bg-teal-soft text-teal-foreground", dot: "var(--teal)", label: t("status.scheduled") },
    published: { cls: "bg-teal-soft text-teal-foreground", dot: "var(--teal)", label: t("status.published") },
    unpublished: {
      cls: "bg-secondary text-muted-foreground",
      dot: "var(--muted-foreground)",
      label: t("status.unpublished"),
    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function LangTab({
  code,
  label,
  active,
  disabled,
  onClick,
}: {
  code: Lang;
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition " +
        (active
          ? "bg-primary text-primary-foreground"
          : disabled
            ? "cursor-not-allowed border border-dashed border-border bg-transparent text-muted-foreground opacity-60"
            : "bg-teal-soft text-teal-foreground hover:opacity-90")
      }
    >
      <span>{code.toUpperCase()}</span>
      <span className="font-medium opacity-80">· {label}</span>
    </button>
  );
}

function EditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { t, locale } = useCms();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosave = useRef(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [featuredNote, setFeaturedNote] = useState<string | null>(null);

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

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, slug, name, name_de, name_fr, name_it, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCategories((data ?? []) as CategoryRow[]));
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .order("last_name", { ascending: true })
      .then(({ data }) => setProfiles((data ?? []) as ProfileRow[]));
  }, []);

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
          category_id: article.category_id,
          author_id: article.author_id,
          featured_image_url: article.featured_image_url,
        })
        .eq("id", article.id);
      if (!error) setSaveState("saved");
      else setSaveState("idle");
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    article?.title,
    article?.excerpt,
    article?.content,
    article?.language,
    article?.category_id,
    article?.author_id,
    article?.featured_image_url,
  ]);

  const update = (patch: Partial<Article>) => setArticle((a) => (a ? { ...a, ...patch } : a));

  const uploadImage = async (file: File) => {
    if (!article) return;
    setUploadError(null);
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${article.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("article-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }
    const { data: signed, error: signErr } = await supabase.storage
      .from("article-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setUploading(false);
    if (signErr || !signed) {
      setUploadError(signErr?.message ?? t("editor.imageError"));
      return;
    }
    update({ featured_image_url: signed.signedUrl });
  };

  const toggleFeatured = async () => {
    if (!article) return;
    const next = !article.is_featured;
    const { error } = await supabase
      .from("articles")
      .update({ is_featured: next })
      .eq("id", article.id);
    if (error) return;
    update({ is_featured: next });
    setFeaturedNote(next ? t("editor.featuredOn") : t("editor.featuredOff"));
  };

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
      t("editor.schedulePrompt"),
      new Date(Date.now() + 3600_000).toISOString().slice(0, 16).replace("T", " "),
    );
    if (!input) return;
    const dt = new Date(input.replace(" ", "T"));
    if (isNaN(dt.getTime())) {
      alert(t("editor.invalidDate"));
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
    if (!window.confirm(t("editor.confirmDelete"))) return;
    const { error } = await supabase.from("articles").delete().eq("id", article.id);
    if (!error) navigate({ to: "/articles" });
  };

  if (notFound) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-10 py-16 text-center">
          <h1 className="text-2xl font-bold">{t("editor.notFound")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("editor.notFoundBody")}</p>
          <Link to="/articles" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            {t("editor.backToArticles")}
          </Link>
        </div>
      </Shell>
    );
  }

  if (!article) {
    return (
      <Shell>
        <div className="px-10 py-16 text-sm text-muted-foreground">{t("editor.loading")}</div>
      </Shell>
    );
  }

  const languageLocked = !!article.first_published_at;
  const saveLabel =
    saveState === "saving"
      ? t("editor.saving")
      : saveState === "saved"
        ? t("editor.saved")
        : `${t("editor.lastSaved")} ${new Date(article.updated_at).toLocaleTimeString()}`;

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {LANGS.map((l) => (
                <LangTab
                  key={l.code}
                  code={l.code}
                  label={l.label}
                  active={article.language === l.code}
                  disabled={languageLocked && article.language !== l.code}
                  onClick={() => update({ language: l.code })}
                />
              ))}
            </div>
            {languageLocked ? (
              <span className="text-xs text-muted-foreground">Language locked after first publication</span>
            ) : (
              <span className="text-xs text-muted-foreground">Language can be changed until first publication</span>
            )}
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
            className="mt-4 w-full max-w-2xl resize-none border-none bg-transparent text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/60"
          />

          <div className="mt-6 space-y-3">
            {article.featured_image_url ? (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={article.featured_image_url}
                  alt="Featured"
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={() => update({ featured_image_url: null })}
                  aria-label="Remove featured image"
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-[var(--shadow-soft)] hover:bg-card"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60">
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">
                  {uploading ? "Uploading…" : "Upload a featured image"}
                </span>
                <span className="text-xs">JPG, PNG or WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(f);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={article.featured_image_url ?? ""}
                onChange={(e) => update({ featured_image_url: e.target.value || null })}
                placeholder="…or paste an image URL"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
          </div>

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
              <div className="border-t border-border pt-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Category</span>
                  <select
                    value={article.category ?? ""}
                    onChange={(e) => update({ category: e.target.value || null })}
                    className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">None</option>
                    {ARTICLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="border-t border-border pt-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Featured on Insights</span>
                  <input
                    type="checkbox"
                    checked={article.is_featured}
                    onChange={toggleFeatured}
                    className="h-4 w-4 accent-[color:var(--primary)]"
                  />
                </label>
                {featuredNote ? (
                  <p className="mt-2 text-xs text-muted-foreground">{featuredNote}</p>
                ) : null}
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