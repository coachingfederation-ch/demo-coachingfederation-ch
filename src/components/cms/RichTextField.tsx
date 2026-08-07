/**
 * Light WYSIWYG field (bold, italic, bullet list) that stores a small Markdown
 * subset. Exports: RichTextField. Used by the Member Area profile editor.
 */
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List } from "lucide-react";
import { useCms } from "@/i18n/cms";
import { htmlToRichText, richTextToHtml } from "@/lib/rich-text";

const COMMANDS = [
  { key: "bold", icon: Bold, command: "bold" },
  { key: "italic", icon: Italic, command: "italic" },
  { key: "bullet", icon: List, command: "insertUnorderedList" },
] as const;

export function RichTextField({
  id,
  value,
  onChange,
  minHeight = "14rem",
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  minHeight?: string;
}) {
  const { t } = useCms();
  const ref = useRef<HTMLDivElement | null>(null);
  const emitted = useRef<string>("");
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Only rewrite the DOM when the incoming value did not come from this editor,
  // so typing never loses the caret.
  useEffect(() => {
    const el = ref.current;
    if (!el || value === emitted.current) return;
    el.innerHTML = richTextToHtml(value);
    emitted.current = value;
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    const next = htmlToRichText(el);
    emitted.current = next;
    onChange(next);
  };

  const refreshActive = () => {
    if (typeof document === "undefined") return;
    setActive({
      bold: document.queryCommandState?.("bold") ?? false,
      italic: document.queryCommandState?.("italic") ?? false,
      bullet: document.queryCommandState?.("insertUnorderedList") ?? false,
    });
  };

  const run = (command: string) => {
    ref.current?.focus();
    document.execCommand(command, false);
    refreshActive();
    emit();
  };

  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-1 border-b border-border bg-secondary/50 px-1.5 py-1">
        {COMMANDS.map(({ key, icon: Icon, command }) => (
          <button
            key={key}
            type="button"
            title={t(`toolbar.${key}`)}
            aria-label={t(`toolbar.${key}`)}
            aria-pressed={!!active[key]}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(command)}
            className={
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition " +
              (active[key]
                ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:bg-card hover:text-foreground")
            }
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        id={id}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emit}
        onBlur={emit}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        style={{ minHeight }}
        className="prose-editor max-h-[32rem] w-full overflow-auto px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-inset focus:ring-ring/20 [&_li]:my-0.5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
}