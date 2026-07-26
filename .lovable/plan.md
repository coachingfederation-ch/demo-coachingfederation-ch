## What's wrong today

Verified in the code:

- `src/components/callout.tsx` detects callouts by inspecting **rendered React children**. `firstString()` returns the first child only, and react-markdown emits a whitespace text node (`"\n"`) as the first child of a blockquote. So `parseCallout` returns `null` and the block falls through to the plain quote branch — which is exactly what you selected in the preview: a blockquote showing the raw `[!info] ✅` marker text.
- Even when detection succeeds, `stripMarker` mutates already-rendered elements, which is fragile (marker/emoji can survive, spacing can break).
- The editor (`src/routes/_authenticated/articles.$id.tsx`) has **no preview at all** — only a toolbar plus a plain `<textarea>`, so authors write Markdown blind.

## Plan

### 1. Move callout detection into the Markdown pipeline (fixes rendering)

Replace the children-inspection approach with a small `remark` plugin (`src/lib/remark-callout.ts`) that runs on the mdast:

- For every `blockquote`, read the first paragraph's leading text.
- If it starts with `[!shade]` (with existing aliases: info/note/tip, highlight/important, warning/caution/danger) plus an optional emoji, remove that marker text from the AST and attach `shade` + `emoji` as node data.
- Marker text is deleted before rendering, so raw Markdown can never leak into output — regardless of nesting or whitespace nodes.
- If the first line is only the marker, drop the now-empty paragraph so the callout starts flush with its content.

`src/components/markdown.tsx` then renders `<Callout shade emoji>` when the node carries callout data, and a normal blockquote otherwise. `Callout` keeps its current three-shade styling and emoji chip, but loses the brittle `stripMarker` logic.

### 2. Live preview in the editor

Add a view switcher above the body field with three modes: **Write / Split / Preview** (default Split on wide screens, Write on narrow ones; choice remembered per browser).

- Split mode: textarea on the left, live-rendered preview on the right, both scrollable, preview updating as you type (lightly debounced so typing stays smooth).
- The preview renders through the **same `<Markdown>` component** the public article page uses, inside a container matching the article page's typography width, so editor preview and published output are visually and structurally identical.
- The formatting toolbar and existing autosave/dirty-state behaviour stay untouched.

### 3. Translation bodies

Apply the same preview toggle to the translated-body textareas in `TranslationsPanel`, so translated callouts are verifiable before publishing (compact, per-locale, preview-on-demand rather than always split).

### 4. Consistency and safety checks

- Public article rendering (`src/pages/InsightDetail.tsx`) keeps using `<Markdown>` unchanged — it inherits the callout fix automatically.
- No schema changes, no changes to publishing, scheduling, locale routing, or article fetching.
- Verify with a Playwright pass: open an article containing all three callout shades (with and without emoji), confirm no raw `[!info]` text renders on the public page, and confirm the editor preview matches it pixel-for-structure.

### New UI strings

`toolbar.write`, `toolbar.split`, `toolbar.preview`, `editor.previewEmpty` added to all four `cms.json` locale files (EN/DE/FR/IT).

## Technical notes

- Plugin is a plain mdast visitor; no extra dependencies beyond `unist-util-visit` if not already present (react-markdown's tree already ships it transitively — will confirm at build time and add explicitly if needed).
- Callout data travels via `node.data.hProperties`-style props, read in the `blockquote` component override, avoiding React-children introspection entirely.
- Preview reuses one memoized `<Markdown>` instance keyed on debounced content to avoid re-parsing on every keystroke.
