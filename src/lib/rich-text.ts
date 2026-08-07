/**
 * Tiny Markdown subset (bold, italic, bullet lists, paragraphs) shared by the
 * member profile WYSIWYG field and the public profile renderer.
 * Exports: parseRichText, richTextToHtml, htmlToRichText, plus the block types.
 */

export type RichInline = { text: string; bold?: boolean; italic?: boolean };
export type RichBlock = { type: "p"; inline: RichInline[] } | { type: "ul"; items: RichInline[][] };

const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_)/g;

/** Splits one line of Markdown into bold/italic-tagged text runs. */
function parseInline(line: string): RichInline[] {
  const out: RichInline[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push({ text: line.slice(last, index) });
    const raw = match[0];
    if (raw.startsWith("**") || raw.startsWith("__")) {
      out.push({ text: raw.slice(2, -2), bold: true });
    } else {
      out.push({ text: raw.slice(1, -1), italic: true });
    }
    last = index + raw.length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out.length ? out : [{ text: "" }];
}

/** Parses the supported Markdown subset into paragraph and list blocks. */
export function parseRichText(markdown: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "p", inline: parseInline(paragraph.join("\n")) });
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "ul", items: list.map(parseInline) });
    list = [];
  };

  for (const rawLine of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1] ?? "");
      continue;
    }
    flushList();
    if (!line.trim()) flushParagraph();
    else paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineToHtml(inline: RichInline[]) {
  return (
    inline
      .map((run) => {
        let html = escapeHtml(run.text).replace(/\n/g, "<br>");
        if (run.italic) html = `<em>${html}</em>`;
        if (run.bold) html = `<strong>${html}</strong>`;
        return html;
      })
      .join("") || "<br>"
  );
}

/** Renders the Markdown subset as sanitised HTML for the contenteditable field. */
export function richTextToHtml(markdown: string) {
  const blocks = parseRichText(markdown);
  if (!blocks.length) return "<p><br></p>";
  return blocks
    .map((block) =>
      block.type === "p"
        ? `<p>${inlineToHtml(block.inline)}</p>`
        : `<ul>${block.items.map((item) => `<li>${inlineToHtml(item)}</li>`).join("")}</ul>`,
    )
    .join("");
}

function serializeNode(node: Node, bold: boolean, italic: boolean): string {
  if (node.nodeType === 3) {
    const text = node.textContent ?? "";
    if (!text) return "";
    const escaped = text;
    if (!escaped.trim()) return escaped;
    const [, lead = "", core = "", tail = ""] = /^(\s*)([\s\S]*?)(\s*)$/.exec(escaped) ?? [];
    let out = core;
    if (italic) out = `_${out}_`;
    if (bold) out = `**${out}**`;
    return lead + out + tail;
  }
  if (node.nodeType !== 1) return "";
  const el = node as HTMLElement;
  const tag = el.tagName;
  if (tag === "BR") return "\n";
  const nextBold = bold || tag === "STRONG" || tag === "B" || Number(el.style.fontWeight) >= 600;
  const nextItalic = italic || tag === "EM" || tag === "I" || el.style.fontStyle === "italic";
  return Array.from(el.childNodes)
    .map((child) => serializeNode(child, nextBold, nextItalic))
    .join("");
}

/** Converts the contenteditable DOM back into the Markdown subset. */
export function htmlToRichText(root: HTMLElement): string {
  const lines: string[] = [];

  const walkBlocks = (parent: HTMLElement) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === 1) {
        const el = child as HTMLElement;
        if (el.tagName === "UL" || el.tagName === "OL") {
          for (const li of Array.from(el.querySelectorAll(":scope > li"))) {
            const text = serializeNode(li, false, false).trim();
            lines.push(`- ${text}`);
          }
          continue;
        }
        if (el.tagName === "DIV" || el.tagName === "P") {
          const text = serializeNode(el, false, false).replace(/\n+$/, "");
          lines.push(...text.split("\n"), "");
          continue;
        }
      }
      const inlineText = serializeNode(child, false, false);
      if (inlineText.trim()) lines.push(inlineText, "");
    }
  };

  walkBlocks(root);
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
