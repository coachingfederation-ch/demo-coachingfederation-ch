# Four-eye principle for publishing articles

Publishing an article becomes a two-person act: the person who created it can never be the person who puts it live, and only members of the **Communication & Marketing** project holding the **Publisher** role may publish at all.

## The flow

```text
new (draft) --submit--> in review --publish--> published
published --edit--> published (still live)
published --submit changes--> in review --publish--> published
unpublished --submit--> in review --publish--> published
```

- Anyone with authoring rights can create, edit and submit for review.
- Only a Publisher can publish, schedule or unpublish.
- A Publisher who created the article sees the publish action disabled with an explanation ("needs review by another publisher").
- Admins may override the self-publish block (emergency valve); the Publisher requirement itself still applies to everyone else.
- Scheduling counts as publishing: same Publisher + not-the-creator rule, and only from "in review".
- Existing articles have no recorded creator, so any Publisher may publish them.
- Editing a live article does not silently take it offline. The editor clicks "Submit changes for review", which moves it back to review (and off the public site) until a second Publisher approves.

## What the user sees

- A new "In review" status pill in the article list and editor header, alongside draft / scheduled / published / unpublished.
- Draft or unpublished article: a single primary action, "Submit for review".
- In review: "Publish" and "Schedule" for eligible Publishers; everyone else sees a note explaining who can publish. A "Return to draft" action lets a Publisher send it back.
- Published: "Submit changes for review" and (Publishers only) "Unpublish".
- All new labels translated in the four CMS languages.

## Technical notes

**Database (one migration)**
- Add `review` to the `article_status` enum.
- Add `articles.created_by uuid` (nullable, references `auth.users`), set on insert in the "new article" path. Left NULL for existing rows.
- Add `private.is_article_publisher(_user_id uuid)` — security definer, stable: true when an `op_assignments` row links `members.auth_user_id = _user_id` to project slug `communication-marketing` and role slug `publisher`. Both already exist in the operational structure, so no seed data is needed.
- Tighten the `articles` UPDATE path so status changes to `published` / `scheduled` require `private.is_article_publisher(auth.uid())` or the admin role, and forbid the transition when `created_by = auth.uid()` unless admin. The public read policy is unchanged — `review` rows are not published, so they stay invisible.

**Server functions (`src/lib/articles.server.ts`, `articles.functions.ts`)**
- Extend `ArticleTransition` with `submit` and `return_to_draft`; keep `publish` / `schedule` / `unpublish`.
- `transitionArticle` validates the state machine (which transitions are legal from which status) and re-checks publisher eligibility and the self-publish block server-side before writing. RLS remains the backstop.
- `getArticleEditorData` also returns `{ canPublish, isCreator, isPublisher }`, so the UI disables actions from real permissions rather than guessing from roles.

**Client**
- `ArticleStatus` union in `src/lib/articles.ts` gains `"review"`; `StatusPill` gains its colour.
- `src/routes/_staff/articles.$id.tsx` header actions are driven by `(status, permissions)` instead of `roles.isEditor`.
- Articles index gains the review status in its labels and sorting.
- New CMS strings in `src/i18n/locales/{en,de,fr,it}/cms.json`.

## PR note

**Summary** — Introduces a four-eye publishing gate for Insights articles: an explicit review state, a creator recorded per article, and publish rights limited to Communication & Marketing Publishers who did not create the article.

**Changes**
- UI: review status pill, state-driven header actions, submit and return-to-draft actions, ineligibility explanation, four-language strings.
- Server: extended transition state machine with publisher and self-publish checks.
- Backend/schema: `review` enum value, `articles.created_by`, `private.is_article_publisher`, tightened articles update policy.

**Backend / Schema Changes** — One migration as described above. No data backfill; existing articles keep `created_by = NULL`.

**Testing & Verification** — Check as: author-only editor (can submit, cannot publish), Publisher who created the article (blocked, sees reason), a second Publisher (can publish and schedule), admin (can override), and signed-out visitor (review articles are not publicly reachable). Verify a published article stays live while being edited.

**Risks & Rollback** — Blast radius is the Insights CMS only; public pages read `published` rows exactly as before. Rollback is a code revert; the added column and enum value are additive and safe to leave in place.

**Follow-ups / Known Debt** — No email notification when an article enters review, and no audit trail of who approved what beyond `published_at`. Both can be added later.