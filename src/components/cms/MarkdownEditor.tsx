import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Pencil, Columns2, Eye } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { MarkdownToolbar } from "@/components/cms/MarkdownToolbar";
import { useCms } from "@/i18n/cms";

export type EditorMode = "write" | "split" | "preview";
const MODES: { key: EditorMode; icon: typeof Pencil }[] = [
  { key: "write", icon: Pencil },
  { key: "split", icon: Columns2 },
  { key: "preview", icon: Eye },
];

const STORAGE_KEY = "cms.editorMode";

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Live preview pane that renders through the same component as public articles. */
export function MarkdownPreview({ content, className }: { content: string; className?: string }) {
  const { t } = useCms();
  const body = useDebounced(content, 150);
  const rendered = useMemo(
    () => (body.trim() ? <Markdown>{body}</Markdown> : null),
    [body],
  );
  return (
    <div className={className}>
      {rendered ?? (
        <p className="text-sm italic text-muted-foreground">{t("editor.previewEmpty")}</p>
      )}
    </div>
  );
}

/** Write / Split / Preview Markdown editor with the formatting toolbar. */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 20,
  textareaRef,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const { t } = useCms();
  const fallbackRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? fallbackRef;
  const [mode, setMode] = useState<EditorMode>("write");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "write" || stored === "split" || stored === "preview") {
      setMode(stored);
      return;
    }
    if (typeof window !== "undefined" && window.innerWidth >= 1024) setMode("split");
  }, []);

  const pick = (next: EditorMode) => {
    setMode(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  };

  const paneHeight = "min-h-[28rem] max-h-[70vh]";

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1">
          <MarkdownToolbar textareaRef={ref} value={value} onChange={onChange} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 border-x border-border bg-secondary/50 px-2 pb-1.5">
        {MODES.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => pick(key)}
            title={t(`toolbar.${key}`)}
            aria-label={t(`toolbar.${key}`)}
            aria-pressed={mode === key}
            className={
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition " +
              (mode === key
                ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:bg-card/60")
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {t(`toolbar.${key}`)}
          </button>
        ))}
      </div>
      <div
        className={
          "grid rounded-b-2xl border border-border bg-card " +
          (mode === "split" ? "md:grid-cols-2" : "grid-cols-1")
        }
      >
        {mode !== "preview" ? (
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={
              "w-full resize-y bg-transparent p-5 font-mono text-[14px] leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-inset focus:ring-ring/20 " +
              (mode === "split" ? `${paneHeight} overflow-auto md:border-r md:border-border` : "")
            }
          />
        ) : null}
        {mode !== "write" ? (
          <MarkdownPreview
            content={value}
            className={
              "p-5 " + (mode === "split" ? `${paneHeight} overflow-auto` : "mx-auto w-full max-w-2xl")
            }
          />
        ) : null}
      </div>
    </div>
  );
}