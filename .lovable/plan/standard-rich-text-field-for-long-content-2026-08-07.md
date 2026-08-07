# Standard rich-text field for long content

Today only the coach "About" field has light formatting (bold, italic, bullets). Every other long text box in the CMS and Member Area is a plain textarea, and the full Markdown editor at /articles/new stays exclusive to articles. This adds one shared, lightweight editor used everywhere long text is written.

## What the shared editor offers

A small toolbar: bold, italic, bulleted list, numbered list, and three heading levels (rendered as h2/h3/h4 on public pages so page titles stay unique). No images, links, tables or code blocks — those stay in the article editor.

Content is stored as the same tiny Markdown subset already used today, so existing text keeps working and nothing has to be migrated.

## Fields to convert

Member Area / coach profile editor
- About / description (already rich — moves to the shared component)
- Approach ("How I work")
- Qualifications
- Fees note
- Team bio

Events CMS
- Event description

Operational structure / communities CMS
- Community description
- Meeting cadence note

Translation panels (member profile, events, articles)
- Long fields mirror their source field: description, approach, qualifications, fees, team bio, event description. Short fields (tagline, titles, notes, attribution) stay plain inputs.

Left as plain text on purpose
- Article title and excerpt, and everything inside the article editor (it keeps its richer Markdown editor)
- Testimonial quote and attribution
- Short notes: response time, session length, availability
- Public visitor inputs: event registration notes, organisation survey message

## Public rendering

Renderers gain the two new block types so headings and numbered lists display correctly:
- Coach profile prose blocks
- Event detail description (currently splits on blank lines only)
- Community detail description (already renders Markdown — verified against the new subset)

## Technical notes

- Extend `src/lib/rich-text.ts`: parse and serialise ordered-list items and `##`/`###`/`####` headings alongside existing paragraph/bullet/bold/italic support, in both directions.
- Promote `src/components/cms/RichTextField.tsx` into a shared `RichTextEditor` with the extended toolbar, caret-safe updates, `aria-label`ed buttons and a `minHeight` prop; keep the existing export name working.
- Use it in place of the `TextArea` helper in `src/components/cms/member-profile/shared.tsx` for long fields only.
- Add a `type: "rich"` option to the field config in `GenericTranslationsPanel.tsx` and `ProfileTranslationsPanel.tsx`.
- Update `Prose` in `src/components/coaches/profile/shared.tsx` and the description block in `src/pages/EventDetail.tsx`.
- New toolbar labels in `cms.json` for EN, DE, FR, IT.
- Record the convention in project memory: long text uses the shared rich-text editor with this fixed toolbar; the article editor stays separate.

## PR note

Summary — Introduces one shared light rich-text editor (bold, italic, bullets, numbering, three headings) and applies it to every long text field outside the article editor, with matching public rendering.

Changes
- UI: shared editor component, converted CMS/Member Area fields, updated prose renderers, new i18n strings.
- Lib: extended Markdown subset parser/serialiser.
- Backend/schema: none — text columns unchanged.

Testing & verification — Type check plus manual pass: edit and save a coach profile, an event and a community; confirm formatting round-trips after reload and renders correctly on public coach, event and community pages; check translation panels save the same subset.

Risks & rollback — Low. No data migration; unformatted text stays valid. Main risk is caret/serialisation quirks in the contenteditable editor. Rollback is a code revert.

Follow-ups — Undo/redo and paste cleanup from Word/Google Docs are not included.