# Keep authored content safe through go-live, and allow reassigning authors

Yes — reassignment is the right approach, and better than a blocking guard. But there is a more urgent finding first.

## What I verified

- All 4 existing articles are authored by one staff profile (Hartmuth), which holds a role, so **nothing is at risk today**.
- The link from an article to its author is set to **cascade on delete**. If an author's account were removed during go-live, the profile would be removed and **the articles themselves would be deleted**, not just orphaned. My earlier answer understated this.
- Events do not have this problem: the organiser field has no hard link, so it degrades safely.

## What to build

### 1. Make content survive account deletion (the real fix)
Change the article-to-author link so an author profile can never take articles down with it. Articles stay, and the author field becomes reassignable rather than destructive. This alone removes the class of risk you asked about.

### 2. Reassign an author, per article
The article editor already has an author dropdown. Keep it, but make sure it lists every staff profile that can hold authorship and shows a readable name — several profiles currently have blank names, which makes the dropdown unusable. Add a fallback label so entries are distinguishable.

### 3. Bulk reassignment before or after go-live
Add a small "Content ownership" panel on the go-live screen that:
- lists every article and event whose owner is an account go-live would remove,
- lets an admin pick a replacement staff author and reassign in one action,
- shows "nothing to reassign" when the list is clean.

This is a report plus an action, not a gate — the cutover is never blocked by it.

### 4. Non-blocking warning in the cutover rehearsal
The rehearsal already previews what will be deleted. Add one line stating how many articles/events are owned by accounts scheduled for removal, so it can never be a surprise.

## Technical notes

- Migration: recreate `articles_author_id_fkey` with `ON DELETE RESTRICT` (`author_id` is `NOT NULL`, so `SET NULL` isn't available without making the column nullable; restrict matches "reassign, don't orphan").
- New admin-gated server functions in the existing pattern: thin `*.functions.ts` wrapper plus logic in a `*.server.ts` file — one to list at-risk content, one to reassign a batch to a chosen profile. Writes run as the caller, so existing `articles` RLS stays the write boundary.
- `src/lib/cutover.server.ts`: add the count to the rehearsal `purge_preview` step only. No change to purge order or the member tables it touches.
- UI: new panel in `src/routes/_staff/integration.tsx`; strings added to all four `cms.json` locales.

## PR note

**Summary** — Prevents published articles from being deleted when an author account is removed at go-live, and gives admins a way to reassign article/event ownership to a surviving staff profile.

**Changes**
- Schema: `articles.author_id` foreign key changed from cascade to restrict.
- Backend: admin-only server functions to list at-risk content and reassign owners.
- UI: "Content ownership" panel on the go-live screen; improved author dropdown labels in the article editor.
- Cutover rehearsal reports at-risk content counts (informational only).

**Backend / schema changes** — one migration altering a single foreign key. No table drops, no RLS changes.

**Testing & verification** — Confirm an article survives deletion of its author profile; confirm reassignment updates the author and the public byline; confirm the rehearsal completes and reports zero at-risk items on current data; check the panel as admin and confirm non-admin staff cannot reach it.

**Risks & rollback** — Low. The foreign-key change is reversible in one line. If the reassignment code is reverted, the stricter key can safely stay.

**Follow-ups / known debt** — Profiles with empty names should be backfilled; the event organiser field has no referential link at all, left as-is for now.