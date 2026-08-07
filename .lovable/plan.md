# Governance document archive

A public, read-only archive of chapter governance documents at `/governance`, with a
file-explorer feel (grouped by category, historical versions by year). Staff upload and
manage the PDFs in the CMS. No Google Drive dependency.

## What the visitor sees

`/governance` — a calm, ICF-styled archive page:

- Deep Blue hero strip with title and short lede.
- Category rail (AGM, Code of Ethics, DEIB, Charter status, Annual report, Other) that
  filters the list; category is reflected in the URL so a view can be shared.
- Document list grouped by year, newest first. Each row: title, year, short description,
  file type + size, published date, and a "View" / "Download" action opening the PDF in a
  new tab.
- A search box filtering by title/description.
- External-reference entries are supported too: a document can be a link to an ICF Global
  page instead of an uploaded file, so today's five outbound links keep working.

The existing About section keeps its five summary cards and gains a
"View all governance documents" CTA pointing at `/governance`.

## What staff see

`/operational-structure`-style CMS page at `/governance` under the staff area:
list of documents with upload (PDF), title, description, category, year, language,
external URL (optional), and publish/unpublish. Editors and admins only.

## Technical notes

**Database** — one new table `public.governance_documents`:
`title`, `description`, `category` (text, validated against a fixed list), `year` (int),
`language` (de/fr/it/en, default en), `file_path` (storage key, nullable),
`external_url` (nullable), `file_size_bytes`, `mime_type`, `is_published`, `sort_order`.
Grants: `SELECT` to `anon` and `authenticated` (published rows only, via RLS),
`ALL` to `service_role`; write policies gated on the existing editor/admin role helper.

**Storage** — new bucket `governance-documents`. Public read is acceptable here (the
documents are meant to be public), which avoids the long-TTL signed-URL debt noted in
`src/lib/storage.ts`. Bucket name and any TTLs added to that module.

**Code**
- `src/lib/governance.ts` (types, category list), `governance.server.ts` (queries),
  `governance.functions.ts` (server fns for the staff CRUD + upload path).
- `src/pages/Governance.tsx` + `src/components/governance/*` for the archive UI, reusing
  existing card/border/shadow tokens — no new visual system.
- `src/routes/governance.tsx` (public, with its own `head()` metadata) and
  `src/routes/_staff/governance.tsx` (CMS).
- `src/components/about/Governance.tsx` keeps the five cards, sourced from the same table
  (latest published document per category) with the current outbound links as fallback,
  and gains the archive CTA.
- Localised strings added to `src/i18n/locales/{en,de,fr,it}/about.json` (or a new
  `governance.json` namespace if the section grows past a handful of keys).

**Accessibility** — the list is a real list with headings per year, keyboard-navigable
rows, visible focus, and link text that names the document (not "View").

## PR note

**Summary** — Adds a public read-only governance document archive at `/governance`, backed
by a staff-managed CMS table and storage bucket, replacing the hardcoded outbound links on
the About page with a real, historical document library.

**Changes**
- UI: new `/governance` public archive page; About governance section gains a CTA and reads
  from the database; new staff CMS page for uploads.
- Backend/schema: `governance_documents` table with RLS and grants; `governance-documents`
  storage bucket.
- Config: bucket constant added to `src/lib/storage.ts`; i18n keys for four languages.

**Backend / Schema Changes** — one migration creating the table, its grants, RLS policies
(public read of published rows; editor/admin write) and the storage bucket + its policies.

**Testing & Verification** — check anonymous browse and download; editor upload, edit,
unpublish; contributor and member roles blocked from the CMS page; all four languages
render; mobile layout; keyboard navigation and focus order.

**Risks & Rollback** — additive only; no existing table or route is modified destructively.
Reverting the code leaves an unused table and bucket, which is safe.

**Follow-ups / Known Debt** — no version-diffing between years (documents are separate rows,
not versions of one record); no per-document access control (everything published is public);
bulk upload deferred.
