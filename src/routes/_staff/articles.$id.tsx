import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { requireStaffAccess, ARTICLE_ROLES } from "@/lib/staff-guard";
import { useMyRoles } from "@/lib/roles";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Image as ImageIcon, Upload, X } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownEditor } from "@/components/cms/MarkdownEditor";
import { TranslationsPanel } from "@/components/cms/TranslationsPanel";
import { UnsplashPicker } from "@/components/cms/UnsplashPicker";
import {
  authorName,
  categoryLabel,
  type ArticleLang,
  type ArticleRow,
  type ArticleStatus,
  type CategoryRow,
  type ProfileRow,
} from "@/lib/articles";
import { ARTICLE_IMAGE_BUCKET, ARTICLE_IMAGE_TTL_SECONDS } from "@/lib/storage";
import {
  changeArticleStatus,
  getArticleEditorData,
  removeArticle,
  saveArticle,
  setArticleFeaturedFlag,
} from "@/lib/articles.functions";
import { useCms } from "@/i18n/cms";

export const Route = createFileRoute("/_staff/articles/$id")({
  beforeLoad: ({ context }) => requireStaffAccess(context.queryClient, ARTICLE_ROLES),
  head: () => ({
    meta: [
      { title: "Editor — The Switzerland Chapter of ICF Insights CMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorPage,
});

type Status = ArticleStatus;
type Lang = ArticleLang;
type Article = ArticleRow;

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

function StatusPill({ status, t }: { status: Status; t: (k: string) => string }) {
  const map: Record<Status, { cls: string; dot: string; label: string }> = {
    draft: {
      cls: "bg-warn-soft text-[color:var(--warn)]",
      dot: "var(--warn)",
      label: t("status.draft"),
    },
    scheduled: {
      cls: "bg-teal-soft text-teal-foreground",
      dot: "var(--teal)",
      label: t("status.scheduled"),
    },
    published: {
      cls: "bg-teal-soft text-teal-foreground",
      dot: "var(--teal)",
      label: t("status.published"),
    },
    unpublished: {
      cls: "bg-secondary text-muted-foreground",
      dot: "var(--muted-foreground)",
      label: t("status.unpublished"),
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}
    >
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
  const { roles } = useMyRoles();
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
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getArticleEditorData({ data: { id } });
        setCategories(data.categories);
        setProfiles(data.profiles);
        if (!data.article) setNotFound(true);
        else setArticle(data.article);
      } catch {
        setNotFound(true);
      }
    })();
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
      try {
        await saveArticle({
          data: {
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            language: article.language,
            category_id: article.category_id,
            author_id: article.author_id,
            featured_image_url: article.featured_image_url,
            image_credit_name: article.image_credit_name,
            image_credit_url: article.image_credit_url,
            image_source: article.image_source,
          },
        });
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
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
    article?.image_credit_name,
    article?.image_credit_url,
    article?.image_source,
  ]);

  const update = (patch: Partial<Article>) => setArticle((a) => (a ? { ...a, ...patch } : a));

  const uploadImage = async (file: File) => {
    if (!article) return;
    setUploadError(null);
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${article.id}/${Date.now()}.${ext}`;
    // The upload stays on the browser client (RLS on storage.objects is the
    // boundary) so the file bytes never cross the server-function RPC. Bucket
    // and TTL come from @/lib/storage so they are declared in one place.
    const { error } = await supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }
    const { data: signed, error: signErr } = await supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .createSignedUrl(path, ARTICLE_IMAGE_TTL_SECONDS);
    setUploading(false);
    if (signErr || !signed) {
      setUploadError(signErr?.message ?? t("editor.imageError"));
      return;
    }
    update({
      featured_image_url: signed.signedUrl,
      image_source: "upload",
      image_credit_name: null,
      image_credit_url: null,
    });
  };

  const toggleFeatured = async () => {
    if (!article) return;
    const next = !article.is_featured;
    try {
      await setArticleFeaturedFlag({ data: { id: article.id, featured: next } });
    } catch {
      return;
    }
    update({ is_featured: next });
    setFeaturedNote(next ? t("editor.featuredOn") : t("editor.featuredOff"));
  };

  const publishNow = async () => {
    if (!article) return;
    try {
      const patch = await changeArticleStatus({ data: { id: article.id, action: "publish" } });
      update(patch as Partial<Article>);
    } catch {
      /* the status pill simply stays as it was */
    }
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
    try {
      const patch = await changeArticleStatus({
        data: { id: article.id, action: "schedule", scheduledAt: dt.toISOString() },
      });
      update(patch as Partial<Article>);
    } catch {
      /* keep the current status */
    }
  };

  const unpublish = async () => {
    if (!article) return;
    try {
      const patch = await changeArticleStatus({ data: { id: article.id, action: "unpublish" } });
      update(patch as Partial<Article>);
    } catch {
      /* keep the current status */
    }
  };

  const remove = async () => {
    if (!article) return;
    if (!window.confirm(t("editor.confirmDelete"))) return;
    try {
      await removeArticle({ data: { id: article.id } });
      navigate({ to: "/articles" });
    } catch {
      /* RLS refused the delete; stay on the page */
    }
  };

  if (notFound) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-10 py-16 text-center">
          <h1 className="text-2xl font-bold">{t("editor.notFound")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("editor.notFoundBody")}</p>
          <Link
            to="/articles"
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
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
            {t("editor.back")}
          </Link>
          <StatusPill status={article.status} t={t} />
          <span className="text-xs text-muted-foreground">{saveLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {roles.isEditor && (article.status === "published" || article.status === "scheduled") ? (
            <button
              onClick={unpublish}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("editor.unpublish")}
            </button>
          ) : null}
          {roles.isEditor ? (
            <>
              <button
                onClick={schedule}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                {t("editor.schedule")}
              </button>
              <button
                onClick={publishNow}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
              >
                {article.status === "published" ? t("editor.republish") : t("editor.publish")}
              </button>
            </>
          ) : null}
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
              <span className="text-xs text-muted-foreground">{t("editor.languageLocked")}</span>
            ) : (
              <span className="text-xs text-muted-foreground">{t("editor.languageUnlocked")}</span>
            )}
          </div>

          <input
            value={article.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder={t("editor.titlePlaceholder")}
            className="mt-8 w-full border-none bg-transparent text-4xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <textarea
            value={article.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            placeholder={t("editor.excerptPlaceholder")}
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
                  aria-label={t("editor.removeImage")}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-[var(--shadow-soft)] hover:bg-card"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60">
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">
                  {uploading ? t("editor.uploading") : t("editor.uploadImage")}
                </span>
                <span className="text-xs">{t("editor.uploadHint")}</span>
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
            {article.image_credit_name ? (
              <p className="text-xs text-muted-foreground">
                {t("unsplash.creditPrefix")}{" "}
                <a
                  href={article.image_credit_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {article.image_credit_name}
                </a>{" "}
                {t("unsplash.creditSuffix")}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={article.featured_image_url ?? ""}
                onChange={(e) =>
                  update({
                    featured_image_url: e.target.value || null,
                    image_source: e.target.value ? "url" : null,
                    image_credit_name: null,
                    image_credit_url: null,
                  })
                }
                placeholder={t("editor.orPasteUrl")}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={() => setUnsplashOpen(true)}
                className="shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {t("unsplash.button")}
              </button>
            </div>
            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
          </div>
          <UnsplashPicker
            open={unsplashOpen}
            onOpenChange={setUnsplashOpen}
            onPick={(pick) =>
              update({
                featured_image_url: pick.url,
                image_credit_name: pick.creditName,
                image_credit_url: pick.creditUrl,
                image_source: "unsplash",
              })
            }
          />

          <MarkdownEditor
            textareaRef={bodyRef}
            value={article.content}
            onChange={(next) => update({ content: next })}
            placeholder={t("editor.bodyPlaceholder")}
          />
        </article>

        <aside className="space-y-6">
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("editor.publishing")}
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("editor.statusLabel")}</span>
                <StatusPill status={article.status} t={t} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("editor.sourceLanguage")}</span>
                <span className="font-semibold">{article.language.toUpperCase()}</span>
              </div>
              {article.published_at ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("editor.publishedAt")}</span>
                  <span>{new Date(article.published_at).toLocaleString()}</span>
                </div>
              ) : null}
              {article.scheduled_at ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("editor.scheduledAt")}</span>
                  <span>{new Date(article.scheduled_at).toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("editor.updated")}</span>
                <span>{new Date(article.updated_at).toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("editor.category")}</span>
                  <select
                    value={article.category_id ?? ""}
                    onChange={(e) => update({ category_id: e.target.value || null })}
                    className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">{t("editor.none")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {categoryLabel(c, locale)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="border-t border-border pt-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("editor.author")}</span>
                  <select
                    value={article.author_id}
                    onChange={(e) => update({ author_id: e.target.value })}
                    className="max-w-[190px] rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {/* Google-created staff profiles often have no name yet. */}
                        {authorName(p) ?? `${t("editor.unnamedAuthor")} ${p.id.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="border-t border-border pt-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("editor.featured")}</span>
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
            <TranslationsPanel
              articleId={article.id}
              sourceLanguage={article.language}
              contentUpdatedAt={article.content_updated_at}
            />
          </div>

          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("editor.dangerZone")}
            </div>
            <button
              onClick={remove}
              className="w-full rounded-xl border border-destructive/40 bg-card px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              {t("editor.delete")}
            </button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
