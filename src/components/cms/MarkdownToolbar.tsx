import type { RefObject } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Info,
} from "lucide-react";
import { useCms } from "@/i18n/cms";

type Action =
  | { kind: "wrap"; before: string; after: string }
  | { kind: "prefix"; prefix: string }
  | { kind: "block"; template: (selection: string) => string };

const BUTTONS: { key: string; icon: typeof Bold; action: Action }[] = [
  { key: "h2", icon: Heading2, action: { kind: "prefix", prefix: "## " } },
  { key: "h3", icon: Heading3, action: { kind: "prefix", prefix: "### " } },
  { key: "bold", icon: Bold, action: { kind: "wrap", before: "**", after: "**" } },
  { key: "italic", icon: Italic, action: { kind: "wrap", before: "_", after: "_" } },
  { key: "bullet", icon: List, action: { kind: "prefix", prefix: "- " } },
  { key: "numbered", icon: ListOrdered, action: { kind: "prefix", prefix: "1. " } },
  { key: "quote", icon: Quote, action: { kind: "prefix", prefix: "> " } },
  {
    key: "link",
    icon: Link2,
    action: { kind: "block", template: (s) => `[${s || "link text"}](https://)` },
  },
  {
    key: "callout",
    icon: Info,
    action: { kind: "block", template: (s) => `> [!note]\n> ${s || "Something worth highlighting."}` },
  },
];

/** Formatting toolbar that edits the Markdown body textarea in place. */
export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useCms();

  const apply = (action: Action) => {
    const el = textareaRef.current;
    const start = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    const selected = value.slice(start, end);
    let insert = selected;
    let caretOffset = 0;

    if (action.kind === "wrap") {
      insert = `${action.before}${selected}${action.after}`;
      caretOffset = action.before.length;
    } else if (action.kind === "prefix") {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end);
      const prefixed = block
        .split("\n")
        .map((line) => (line.startsWith(action.prefix) ? line : action.prefix + line))
        .join("\n");
      const next = value.slice(0, lineStart) + prefixed + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el?.focus();
        const pos = lineStart + prefixed.length;
        el?.setSelectionRange(pos, pos);
      });
      return;
    } else {
      insert = action.template(selected);
    }

    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = selected ? start + insert.length : start + caretOffset;
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-1 rounded-t-2xl border border-b-0 border-border bg-secondary/50 px-2 py-1.5">
      {BUTTONS.map(({ key, icon: Icon, action }) => (
        <button
          key={key}
          type="button"
          title={t(`toolbar.${key}`)}
          aria-label={t(`toolbar.${key}`)}
          onClick={() => apply(action)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}