import type { ReactNode } from "react";
import { Children, isValidElement, cloneElement } from "react";

export const CALLOUT_SHADES = ["info", "highlight", "warning"] as const;
export type CalloutShade = (typeof CALLOUT_SHADES)[number];

/** `[!info] 💡` — shade marker plus an optional leading emoji. */
const MARKER = /^\[!([a-z]+)\]\s*/i;
const LEADING_EMOJI = /^(\p{Extended_Pictographic}(\uFE0F|\p{Emoji_Modifier})?(\u200D\p{Extended_Pictographic}(\uFE0F)?)*)\s*/u;

const ALIASES: Record<string, CalloutShade> = {
  info: "info",
  note: "info",
  tip: "info",
  highlight: "highlight",
  important: "highlight",
  warning: "warning",
  caution: "warning",
  danger: "warning",
};

const STYLES: Record<CalloutShade, { wrap: string; rail: string; chip: string }> = {
  info: {
    wrap: "bg-teal-soft/70 border-teal/25",
    rail: "bg-teal",
    chip: "bg-teal-soft text-teal-foreground",
  },
  highlight: {
    wrap: "bg-warn-soft/80 border-mark-yellow/50",
    rail: "bg-mark-yellow",
    chip: "bg-mark-yellow/40 text-foreground",
  },
  warning: {
    wrap: "bg-destructive/8 border-destructive/25",
    rail: "bg-destructive",
    chip: "bg-destructive/12 text-destructive",
  },
};

export const SHADE_SWATCH: Record<CalloutShade, string> = {
  info: "bg-teal",
  highlight: "bg-mark-yellow",
  warning: "bg-destructive",
};

function firstString(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return firstString(node[0]);
  if (isValidElement(node)) return firstString((node.props as { children?: ReactNode }).children);
  return "";
}

/** Detects a callout blockquote and returns its shade and emoji, or null. */
export function parseCallout(children: ReactNode): { shade: CalloutShade; emoji: string | null } | null {
  const text = firstString(children).trimStart();
  const m = MARKER.exec(text);
  if (!m) return null;
  const shade = ALIASES[m[1].toLowerCase()];
  if (!shade) return null;
  const rest = text.slice(m[0].length);
  const e = LEADING_EMOJI.exec(rest);
  return { shade, emoji: e ? e[1] : null };
}

/** Removes the marker (and emoji) from the first text node, keeping all nested markup. */
function stripMarker(node: ReactNode, done: { value: boolean }): ReactNode {
  if (done.value) return node;
  if (typeof node === "string") {
    let next = node.replace(MARKER, "");
    if (next !== node) {
      next = next.replace(LEADING_EMOJI, "");
      done.value = true;
    }
    return next.replace(/^\s+/, "");
  }
  if (Array.isArray(node)) {
    return Children.map(node, (child) => stripMarker(child, done));
  }
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return cloneElement(node as never, undefined, stripMarker(props.children, done));
  }
  return node;
}

export function Callout({
  shade,
  emoji,
  children,
}: {
  shade: CalloutShade;
  emoji: string | null;
  children: ReactNode;
}) {
  const s = STYLES[shade];
  const body = stripMarker(children, { value: false });
  return (
    <div
      className={`relative my-8 overflow-hidden rounded-2xl border ${s.wrap} py-5 pl-7 pr-6 text-[15px] leading-relaxed shadow-[var(--shadow-soft)]`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${s.rail}`} aria-hidden />
      <div className="flex gap-4">
        {emoji ? (
          <span
            aria-hidden
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${s.chip}`}
          >
            {emoji}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3 [&>*:first-child]:mt-0">{body}</div>
      </div>
    </div>
  );
}