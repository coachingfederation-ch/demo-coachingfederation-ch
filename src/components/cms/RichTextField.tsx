/**
 * Standard light WYSIWYG field (bold, italic, bullet list, numbered list and
 * three heading levels) that stores a small Markdown subset. Exports:
 * RichTextEditor (plus the legacy RichTextField alias). Used by every long text
 * field outside the article editor.
 */
import { useEffect, useRef, useState } from "react";
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered } from "lucide-react";
import { useCms } from "@/i18n/cms";
import { htmlToRichText, richTextToHtml } from "@/lib/rich-text";

type ToolbarItem =
  | { key: string; icon: typeof Bold; command: string; block?: never }
  | { key: string; icon: typeof Bold; command?: never; block: string };

const COMMANDS: readonly ToolbarItem[] = [
  { key: "bold", icon: Bold, command: "bold" },
  { key: "italic", icon: Italic, command: "italic" },
  { key: "bullet", icon: List, command: "insertUnorderedList" },
  { key: "numbered", icon: ListOrdered, command: "insertOrderedList" },
  { key: "heading1", icon: Heading1, block: "h2" },
  { key: "heading2", icon: Heading2, block: "h3" },
  { key: "heading3", icon: Heading3, block: "h4" },
] as const;

export function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  minHeight = "14rem",
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  onBlur?: (next: string) => void;
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
    if (!el) return "";
    const next = htmlToRichText(el);
    emitted.current = next;
    onChange(next);
    return next;
  };

  const refreshActive = () => {
    if (typeof document === "undefined") return;
    let block = "";
    try {
      block = (document.queryCommandValue?.("formatBlock") ?? "").toLowerCase();
    } catch {
      block = "";
    }
    setActive({
      bold: document.queryCommandState?.("bold") ?? false,
      italic: document.queryCommandState?.("italic") ?? false,
      bullet: document.queryCommandState?.("insertUnorderedList") ?? false,
      numbered: document.queryCommandState?.("insertOrderedList") ?? false,
      heading1: block === "h2",
      heading2: block === "h3",
      heading3: block === "h4",
    });
  };

  const run = (item: ToolbarItem) => {
    ref.current?.focus();
    if (item.block) {
      // Toggling: pressing an active heading returns the block to a paragraph.
      const next = active[item.key] ? "p" : item.block;
      document.execCommand("formatBlock", false, next);
    } else if (item.command) {
      document.execCommand(item.command, false);
    }
    refreshActive();
    emit();
  };

  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/50 px-1.5 py-1">
        {COMMANDS.map((item) => (
          <button
            key={item.key}
            type="button"
            title={t(`toolbar.${item.key}`)}
            aria-label={t(`toolbar.${item.key}`)}
            aria-pressed={!!active[item.key]}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(item)}
            className={
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition " +
              (active[item.key]
                ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:bg-card hover:text-foreground")
            }
          >
            <item.icon className="h-4 w-4" />
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
        onBlur={() => {
          const next = emit();
          onBlur?.(next);
        }}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        style={{ minHeight }}
        className="prose-editor max-h-[32rem] w-full overflow-auto px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-inset focus:ring-ring/20 [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h4]:mt-3 [&_h4]:font-display [&_h4]:text-sm [&_h4]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
}

/** Legacy alias kept so existing imports keep working. */
export const RichTextField = RichTextEditor;
