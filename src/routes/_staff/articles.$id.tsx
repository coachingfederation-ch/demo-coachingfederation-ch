/**
 * CMS article editor route (/_staff/articles/$id).
 * Exports: Route. Renders the full markdown editor, image management,
 * and publishing controls for a specific article.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { requireStaffAccess, ARTICLE_ROLES } from "@/lib/staff-guard";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { supabase } from "@/integrations/supabase/client";
import { ArticleEditorPane } from "@/components/cms/ArticleEditorPane";
import { ArticleMetaSidebar, StatusPill } from "@/components/cms/ArticleMetaSidebar";
import {
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

/** What the caller may do with this article under the four-eye rule. */
type Permissions = {
  isAdmin: boolean;
  isPublisher: boolean;
  isCreator: boolean;
  canPublish: boolean;
};

function EditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { t, locale } = useCms();
  const [article, setArticle] = useState<Article | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getArticleEditorData({ data: { id } });
        setCategories(data.categories);
        setProfiles(data.profiles);
        setPermissions(data.permissions as Permissions);
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
      setActionError(null);
    } catch {
      setActionError(t("editor.publishFailed"));
    }
  };

  const submitForReview = async () => {
    if (!article) return;
    try {
      const patch = await changeArticleStatus({ data: { id: article.id, action: "submit" } });
      update(patch as Partial<Article>);
      setActionError(null);
    } catch {
      setActionError(t("editor.publishFailed"));
    }
  };

  const returnToDraft = async () => {
    if (!article) return;
    try {
      const patch = await changeArticleStatus({
        data: { id: article.id, action: "return_to_draft" },
      });
      update(patch as Partial<Article>);
      setActionError(null);
    } catch {
      setActionError(t("editor.publishFailed"));
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
  // Publishing rights come from the operational structure (Communication &
  // Marketing → Publisher) plus the four-eye rule, never from the CMS role.
  const canPublish = !!permissions?.canPublish;
  const canUnpublish =
    (article.status === "published" || article.status === "scheduled") &&
    (!!permissions?.isPublisher || !!permissions?.isAdmin);
  const canSubmit =
    article.status === "draft" ||
    article.status === "unpublished" ||
    article.status === "published" ||
    article.status === "scheduled";
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
          {actionError ? (
            <span className="max-w-xs text-xs text-destructive">{actionError}</span>
          ) : null}
          {article.status === "review" && !canPublish ? (
            <span className="max-w-xs text-xs text-muted-foreground">
              {permissions?.isCreator && permissions.isPublisher
                ? t("editor.reviewSelfBlocked")
                : t("editor.reviewNeedsPublisher")}
            </span>
          ) : null}

          {canUnpublish ? (
            <button
              onClick={unpublish}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("editor.unpublish")}
            </button>
          ) : null}

          {article.status === "review" && (permissions?.isPublisher || permissions?.isAdmin) ? (
            <button
              onClick={returnToDraft}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("editor.returnToDraft")}
            </button>
          ) : null}

          {canSubmit ? (
            <button
              onClick={submitForReview}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
            >
              {article.status === "published" || article.status === "scheduled"
                ? t("editor.submitChanges")
                : t("editor.submitForReview")}
            </button>
          ) : null}

          {article.status === "review" && canPublish ? (
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
                {article.first_published_at ? t("editor.republish") : t("editor.publish")}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-8 px-8 py-8">
        <ArticleEditorPane
          article={article}
          languageLocked={languageLocked}
          update={update}
          t={t}
          bodyRef={bodyRef}
          uploading={uploading}
          uploadError={uploadError}
          uploadImage={uploadImage}
          unsplashOpen={unsplashOpen}
          setUnsplashOpen={setUnsplashOpen}
        />

        <ArticleMetaSidebar
          article={article}
          categories={categories}
          profiles={profiles}
          locale={locale}
          t={t}
          update={update}
          toggleFeatured={toggleFeatured}
          featuredNote={featuredNote}
          remove={remove}
        />
      </div>
    </Shell>
  );
}
