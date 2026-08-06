/**
 * CMS sidebar panel for managing automated and manual translations of articles.
 * Exports: TranslationsPanel. Consumed by the article editor route.
 */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Languages, Loader2, Eye } from "lucide-react";
import { MarkdownPreview } from "@/components/cms/MarkdownEditor";
import { supabase } from "@/integrations/supabase/client";
import { translateArticle } from "@/lib/translations.functions";
import { useCms } from "@/i18n/cms";
import { LOCALE_ORDER, type Locale } from "@/i18n/config";

interface TranslationRow {
  locale: string;
  title: string;
  excerpt: string;
  content: string;
  manually_edited: boolean;
  source_updated_at: string;
}

type State = "missing" | "fresh" | "stale";

export function TranslationsPanel({
  articleId,
  sourceLanguage,
  contentUpdatedAt,
}: {
  articleId: string;
  sourceLanguage: string;
  contentUpdatedAt: string | null;
}) {
  const { t } = useCms();
  const runTranslate = useServerFn(translateArticle);
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLocale, setOpenLocale] = useState<string | null>(null);
  const [draft, setDraft] = useState<TranslationRow | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<string | null>(null);

  const targets = LOCALE_ORDER.filter((l) => l !== sourceLanguage);

  const load = async () => {
    const { data } = await supabase
      .from("article_translations")
      .select("locale, title, excerpt, content, manually_edited, source_updated_at")
      .eq("article_id", articleId);
    setRows((data ?? []) as TranslationRow[]);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const stateFor = (locale: Locale): State => {
    const row = rows.find((r) => r.locale === locale);
    if (!row) return "missing";
    if (contentUpdatedAt && new Date(row.source_updated_at) < new Date(contentUpdatedAt))
      return "stale";
    return "fresh";
  };

  const translate = async (locale: Locale) => {
    const row = rows.find((r) => r.locale === locale);
    if (row?.manually_edited && !window.confirm(t("translations.confirmOverwrite"))) return;
    setError(null);
    setBusy(locale);
    try {
      await runTranslate({ data: { articleId, locale } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("translations.failed"));
    } finally {
      setBusy(null);
    }
  };

  const openEditor = (locale: string) => {
    const row = rows.find((r) => r.locale === locale);
    if (!row) return;
    setOpenLocale(locale);
    setDraft({ ...row });
    setSavedNote(false);
  };

  const saveDraft = async () => {
    if (!draft) return;
    setBusy(draft.locale);
    const { error: err } = await supabase
      .from("article_translations")
      .update({
        title: draft.title,
        excerpt: draft.excerpt,
        content: draft.content,
        manually_edited: true,
      })
      .eq("article_id", articleId)
      .eq("locale", draft.locale);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setSavedNote(true);
    await load();
  };

  const badge = (locale: Locale) => {
    const s = stateFor(locale);
    const row = rows.find((r) => r.locale === locale);
    if (s === "missing")
      return { label: t("translations.notTranslated"), cls: "bg-secondary text-muted-foreground" };
    if (s === "stale")
      return {
        label: t("translations.needsRefresh"),
        cls: "bg-warn-soft text-[color:var(--warn)]",
      };
    return {
      label: row?.manually_edited ? t("translations.manual") : t("translations.upToDate"),
      cls: "bg-teal-soft text-teal-foreground",
    };
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          {t("translations.title")}
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-xs text-muted-foreground">{t("translations.hint")}</p>
        {targets.map((locale) => {
          const b = badge(locale);
          const exists = stateFor(locale) !== "missing";
          return (
            <div key={locale} className="border-t border-border pt-3 first:border-0 first:pt-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{locale.toUpperCase()}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>
                  {b.label}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => void translate(locale)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {busy === locale ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {busy === locale
                    ? t("translations.working")
                    : exists
                      ? t("translations.refresh")
                      : t("translations.translate")}
                </button>
                {exists ? (
                  <button
                    onClick={() =>
                      openLocale === locale ? setOpenLocale(null) : openEditor(locale)
                    }
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    {openLocale === locale ? t("translations.close") : t("translations.open")}
                  </button>
                ) : null}
              </div>
              {openLocale === locale && draft ? (
                <div className="mt-3 space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("translations.titleField")}
                  </label>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("translations.excerptField")}
                  </label>
                  <textarea
                    rows={3}
                    value={draft.excerpt}
                    onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                    className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("translations.bodyField")}
                  </label>
                  <div className="space-y-2">
                    <textarea
                      rows={10}
                      value={draft.content}
                      onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewLocale(previewLocale === locale ? null : locale)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-medium hover:bg-secondary"
                    >
                      <Eye className="h-3 w-3" />
                      {previewLocale === locale ? t("toolbar.write") : t("toolbar.preview")}
                    </button>
                    {previewLocale === locale ? (
                      <MarkdownPreview
                        content={draft.content}
                        className="rounded-xl border border-border bg-card p-4"
                      />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void saveDraft()}
                      disabled={busy !== null}
                      className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {t("translations.saveTranslation")}
                    </button>
                    {savedNote ? (
                      <span className="text-xs text-muted-foreground">
                        {t("translations.savedTranslation")}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
