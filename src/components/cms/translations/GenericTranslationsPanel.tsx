/**
 * Generic AI/manual translation panel shared by article and event editors:
 * owns loading rows, dirty-draft tracking, the AI-translate call and saving.
 * Per-entity differences (fields, labels, i18n keys, table access) are
 * supplied by callers through a small `adapter` object.
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Eye, Languages } from "lucide-react";
import { MarkdownPreview } from "@/components/cms/MarkdownEditor";
import { LOCALE_ORDER, type Locale } from "@/i18n/config";
import { TranslationLocaleList } from "./TranslationLocaleList";
import type { TranslationFieldConfig, TranslationLocaleItem } from "./types";

export interface TranslationRowBase {
  locale: string;
  manually_edited: boolean;
  source_updated_at: string;
}

export interface TranslationPanelLabels {
  title: string;
  hint: string;
  confirmOverwrite: string;
  failed: string;
  notTranslated: string;
  needsRefresh: string;
  manual: string;
  upToDate: string;
  translate: string;
  refresh: string;
  working: string;
  open: string;
  close: string;
  saveTranslation: string;
  savedTranslation: string;
  previewWrite?: string;
  previewShow?: string;
}

export interface TranslationPanelAdapter<
  Row extends TranslationRowBase,
  Values extends Record<string, string | null>,
> {
  sourceLanguage: string;
  contentUpdatedAt: string | null;
  /** Only the article panel wraps its header in an extra flex/justify-between div. */
  wrapHeaderInFlexBetween?: boolean;
  fields: TranslationFieldConfig<Extract<keyof Values, string>>[];
  /** Field that gets a write/preview markdown toggle (article body only). */
  previewField?: Extract<keyof Values, string>;
  load: () => Promise<Row[]>;
  translate: (locale: string) => Promise<void>;
  save: (locale: string, values: Values) => Promise<{ error: string | null }>;
  valuesFromRow: (row: Row) => Values;
  labels: TranslationPanelLabels;
  /** Overrides the default missing/fresh/stale badge with entity-specific states (e.g. profile's 5-state model). */
  badge?: (row: Row | undefined, contentUpdatedAt: string | null) => { label: string; cls: string };
  /** Optional per-locale hint rendered under the badge row (e.g. an "outdated" explanation). */
  hint?: (locale: string, row: Row | undefined) => ReactNode;
  /** Extra per-locale disable condition for the translate button, in addition to a busy panel. */
  translateDisabled?: (row: Row | undefined) => boolean;
  translateTitle?: (row: Row | undefined) => string | undefined;
  /** Extra buttons rendered after the open/close toggle (e.g. publish/remove). */
  extraActions?: (locale: string, row: Row | undefined, busy: string | null) => ReactNode;
  /** Overrides the default field control for one field (e.g. showing the source text, hiding empty fields). */
  renderField?: (
    field: TranslationFieldConfig<Extract<keyof Values, string>>,
    value: string,
    onChange: (value: string) => void,
    row: Row | undefined,
  ) => ReactNode;
  /** Extra content rendered between the hint and the locale list (e.g. a primary-locale selector). */
  topContent?: ReactNode;
  /** Lets a translate/save call hand back fresh rows directly, skipping an extra load() round-trip. */
  translateReturnsRows?: (locale: string) => Promise<Row[] | void>;
  saveReturnsRows?: (locale: string, values: Values) => Promise<{ error: string | null; rows?: Row[] }>;
}

export function GenericTranslationsPanel<
  Row extends TranslationRowBase,
  Values extends Record<string, string | null>,
>({ adapter, deps }: { adapter: TranslationPanelAdapter<Row, Values>; deps: unknown[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLocale, setOpenLocale] = useState<string | null>(null);
  const [draft, setDraft] = useState<Values | null>(null);
  const [draftLocale, setDraftLocale] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<string | null>(null);

  const targets = LOCALE_ORDER.filter((l) => l !== adapter.sourceLanguage);

  const load = async () => {
    setRows(await adapter.load());
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const stateFor = (locale: Locale): "missing" | "fresh" | "stale" => {
    const row = rows.find((r) => r.locale === locale);
    if (!row) return "missing";
    if (
      adapter.contentUpdatedAt &&
      new Date(row.source_updated_at) < new Date(adapter.contentUpdatedAt)
    )
      return "stale";
    return "fresh";
  };

  const translate = async (locale: Locale) => {
    const row = rows.find((r) => r.locale === locale);
    if (row?.manually_edited && !window.confirm(adapter.labels.confirmOverwrite)) return;
    setError(null);
    setBusy(locale);
    try {
      if (adapter.translateReturnsRows) {
        const nextRows = await adapter.translateReturnsRows(locale);
        if (nextRows) setRows(nextRows);
        else await load();
      } else {
        await adapter.translate(locale);
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : adapter.labels.failed);
    } finally {
      setBusy(null);
    }
  };

  const openEditor = (locale: string) => {
    const row = rows.find((r) => r.locale === locale);
    if (!row) return;
    setOpenLocale(locale);
    setDraft(adapter.valuesFromRow(row));
    setDraftLocale(locale);
    setSavedNote(false);
  };

  const saveDraft = async () => {
    if (!draft || !draftLocale) return;
    setBusy(draftLocale);
    const { error: err, rows: nextRows } = adapter.saveReturnsRows
      ? await adapter.saveReturnsRows(draftLocale, draft)
      : { ...(await adapter.save(draftLocale, draft)), rows: undefined };
    setBusy(null);
    if (err) {
      setError(err);
      return;
    }
    setSavedNote(true);
    if (nextRows) setRows(nextRows);
    else await load();
  };

  const badge = (locale: Locale) => {
    const row = rows.find((r) => r.locale === locale);
    if (adapter.badge) return adapter.badge(row, adapter.contentUpdatedAt);
    const s = stateFor(locale);
    if (s === "missing")
      return { label: adapter.labels.notTranslated, cls: "bg-secondary text-muted-foreground" };
    if (s === "stale")
      return {
        label: adapter.labels.needsRefresh,
        cls: "bg-warn-soft text-[color:var(--warn)]",
      };
    return {
      label: row?.manually_edited ? adapter.labels.manual : adapter.labels.upToDate,
      cls: "bg-teal-soft text-teal-foreground",
    };
  };

  const items: TranslationLocaleItem[] = targets.map((locale) => {
    const row = rows.find((r) => r.locale === locale);
    const b = badge(locale);
    const exists = !!row;
    const isOpen = openLocale === locale;
    const editorOpen = isOpen && draft && draftLocale === locale;
    return {
      locale,
      badgeLabel: b.label,
      badgeClassName: b.cls,
      hint: adapter.hint ? adapter.hint(locale, row) : undefined,
      translateLabel: busy === locale
        ? adapter.labels.working
        : exists
          ? adapter.labels.refresh
          : adapter.labels.translate,
      translating: busy === locale,
      translateDisabled: busy !== null || (adapter.translateDisabled?.(row) ?? false),
      translateTitle: adapter.translateTitle?.(row),
      onTranslate: () => void translate(locale),
      showOpenToggle: exists,
      isOpen,
      onToggleOpen: () => (isOpen ? setOpenLocale(null) : openEditor(locale)),
      openLabel: adapter.labels.open,
      closeLabel: adapter.labels.close,
      extraActions: adapter.extraActions ? adapter.extraActions(locale, row, busy) : undefined,
      editor: editorOpen ? (
        <div className="mt-3 space-y-2">
          {adapter.fields.map((field) =>
            adapter.renderField ? (
              <div key={field.key}>
                {adapter.renderField(
                  field,
                  (draft as Values)[field.key] ?? "",
                  (value) => setDraft({ ...(draft as Values), [field.key]: value } as Values),
                  row,
                )}
              </div>
            ) : (
              <FieldBlock
                key={field.key}
                field={field}
                value={(draft as Values)[field.key] ?? ""}
                onChange={(value) => setDraft({ ...(draft as Values), [field.key]: value } as Values)}
                isPreview={adapter.previewField === field.key && previewLocale === locale}
                onTogglePreview={
                  adapter.previewField === field.key
                    ? () => setPreviewLocale(previewLocale === locale ? null : locale)
                    : undefined
                }
                previewWrite={adapter.labels.previewWrite}
                previewShow={adapter.labels.previewShow}
              />
            ),
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => void saveDraft()}
              disabled={busy !== null}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              {adapter.labels.saveTranslation}
            </button>
            {savedNote ? (
              <span className="text-xs text-muted-foreground">
                {adapter.labels.savedTranslation}
              </span>
            ) : null}
          </div>
        </div>
      ) : null,
    };
  });

  const header = (
    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      <Languages className="h-3.5 w-3.5" />
      {adapter.labels.title}
    </div>
  );

  return (
    <div>
      {adapter.wrapHeaderInFlexBetween ? (
        <div className="mb-3 flex items-center justify-between">{header}</div>
      ) : (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          {adapter.labels.title}
        </div>
      )}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-xs text-muted-foreground">{adapter.labels.hint}</p>
        {adapter.topContent}
        <TranslationLocaleList items={items} />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}

function FieldBlock({
  field,
  value,
  onChange,
  isPreview,
  onTogglePreview,
  previewWrite,
  previewShow,
}: {
  field: TranslationFieldConfig;
  value: string;
  onChange: (value: string) => void;
  isPreview: boolean;
  onTogglePreview?: () => void;
  previewWrite?: string;
  previewShow?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {field.label}
      </label>
      {field.type === "input" ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        />
      ) : onTogglePreview ? (
        <div className="space-y-2">
          <textarea
            rows={field.rows ?? 10}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="button"
            onClick={onTogglePreview}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-medium hover:bg-secondary"
          >
            <Eye className="h-3 w-3" />
            {isPreview ? previewWrite : previewShow}
          </button>
          {isPreview ? (
            <MarkdownPreview content={value} className="rounded-xl border border-border bg-card p-4" />
          ) : null}
        </div>
      ) : (
        <textarea
          rows={field.rows ?? 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        />
      )}
    </div>
  );
}
