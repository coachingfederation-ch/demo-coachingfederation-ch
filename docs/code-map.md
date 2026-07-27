# Code map

A directory of where behaviour lives. Use this to find the owner of a feature
before adding a new file.

## Domain layer (`src/lib`)

### Coach directory

| Module | Responsibility |
|---|---|
| `directory.functions.ts` | Public search RPC: filtering, faceting, pagination against `coach_directory_public`, plus signed image URLs. |
| `directory-eligibility.ts` | The single definition of who may appear publicly. `publishBlockReason` is the shared predicate used by the member editor, staff tooling and the server write path. |
| `coaches.ts` | Client-safe directory types and display helpers. |
| `coach-finder-config.*` | The coaching/mentoring/supervision mode configuration that drives the public mode tabs. |

### Member data and the ICF pipeline

| Module | Responsibility |
|---|---|
| `member-sync.server.ts` | The import engine: pull the ICF feed, normalise, diff, create/update/deactivate, demote profiles that lost eligibility. The most operationally sensitive module in the project. |
| `icf-soap.server.ts` | SOAP/xWeb client for netFORUM. Credentials read inside handlers. |
| `integration-config.server.ts` | Loads the single `integration_config` row (TEST vs LIVE, email suppression, claim gate). |
| `member-profile.server.ts` / `.functions.ts` | Member self-service profile: validation, cleaning, the guarded publish path. |
| `member-claim.server.ts` | Account claim token state machine — hashing, expiry, attempt limiting, single use. |
| `member-email.server.ts` | Email dispatch. Currently logs every intended send and delivers nothing; see operations doc. |

### Insights CMS

| Module | Responsibility |
|---|---|
| `articles.ts` | Shared types (`ArticleRow`, `CategoryRow`, `ProfileRow`) and display helpers used by both the CMS and the public blog. |
| `articles.server.ts` | Article reads, writes, status transitions and deletion. |
| `articles.functions.ts` | The CMS RPC surface, with `assertStaff` guards. |
| `insights.functions.ts` | Public reads for the published blog. |
| `translations.functions.ts` | Per-locale translation rows and AI-assisted translation. |

### Shared infrastructure

| Module | Responsibility |
|---|---|
| `storage.ts` | Bucket names and signed-URL lifetimes. Client-safe constants; the one place these strings are written. |
| `storage.server.ts` | `signStoragePaths` / `signProfileImages` — batch signing via the admin client. |
| `supabase-public.server.ts` | Anonymous client factory, including the `sb_`-key `apikey` header workaround. |
| `roles.ts` | Role constants and the `useMyRoles` hook that drives UI gating. |

## Routes (`src/routes`)

| Path | Notes |
|---|---|
| `index`, `about`, `events`, `for-coaches`, `for-organisations`, `find-a-coach`, `insights*`, `coach.$profileId` | Public. Each has a `$locale/` mirror rendering the same `src/pages` component. |
| `_staff/route.tsx` | Staff gate. Children: `articles*` (CMS), `members*`, `vocabularies`, `coach-finder`, `integration`. |
| `_member/route.tsx` | Member gate. Child: `my-profile`. |
| `auth`, `auth.callback` | Sign-in and the role-based post-login redirect. |
| `claim.index`, `claim.$token` | Account claiming (gated off until cutover). |
| `api/public/member-sync.ts` | Cron trigger for the nightly ICF sync. |
| `sitemap[.]xml.ts` | Generated sitemap across all four locales. |

## Components (`src/components`)

| Group | Contents |
|---|---|
| `site-chrome.tsx` | Public header, footer, responsive nav, language switcher. |
| `coaches/` | Directory list, filter panel, mode tabs, coach cards. |
| `cms/` | Staff shell, Markdown editor, translations panel, Unsplash picker, and `MemberProfileEditor`. |
| `member/` | Member Area presentational pieces. |
| `organisations/` | The "For organisations" sections, survey and gated deck download. |
| `markdown.tsx`, `callout.tsx` | Article rendering, including the three-shade callout system built on a remark AST plugin. |
| `marks.tsx` | Hand-drawn decorative SVG marks. |
| `ui/` | shadcn/ui primitives. Prefer these over new bespoke controls. |

## Database objects worth knowing

- **`coach_directory_public`** — the view every public directory read goes
  through. Change the projection here, not in application code.
- **`user_roles`** + `has_role` / `is_editor` / `is_staff` — the whole
  authorization model.
- **`integration_config`** — one row, guarded by a trigger, controlling the
  TEST/LIVE posture.
- **`member_sync_runs`, `member_sync_events`, `member_import_snapshots`** — the
  audit trail for every sync. First place to look when member data looks wrong.
- **Buckets** `member-profile-images` and `article-images` — both private;
  access is always via signed URLs.