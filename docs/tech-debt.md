# Known technical debt

Honest inventory as of the consolidation pass. Nothing here is breaking; all of
it is worth knowing before you build on top of it.

## Duplicated public route files

Every public page exists twice: `src/routes/about.tsx` and
`src/routes/$locale/about.tsx`. Both are thin and render the same component
from `src/pages`, so the duplication is shallow — but adding a public page
means remembering to add both, and forgetting produces a page that 404s in
three of four languages.

*Ideal:* a single route factory, or an optional locale segment. Deferred
because the current shape is explicit and TanStack's generated route tree makes
the mistake visible quickly.

## Large components

`MemberProfileEditor.tsx` (~800 lines) and `articles.$id.tsx` (~600) are the
two remaining oversized files. Both are genuinely form-heavy rather than
tangled, and their data access now sits behind server functions, which was the
part that actually mattered. Splitting them into per-section subcomponents is
the obvious next step and is low risk.

## Test coverage

There is no automated test suite. Verification has been manual plus browser
automation. The highest-value first tests, in order:

1. `member-sync.server.ts` diffing and the feed drop guard — the code with the
   worst failure mode and the most branches.
2. `publishBlockReason` — a pure function guarding a security-relevant rule.
3. The claim token state machine — expiry, reuse, attempt limits.

## The view must be updated by hand

Adding a field to a coach profile requires changing both the table and
`coach_directory_public`. There is nothing that catches the omission; the field
just renders blank publicly. Keep the two changes in the same migration.

## Email transport is a stub

`member-email.server.ts` logs and drops. The call sites and the log table are
in place, so wiring a provider is contained to that module — but until it is
done, any feature that assumes a member can be reached by email is incomplete.

## i18n dictionary drift

Four dictionaries are maintained by hand. Nothing enforces that a key added to
`en` exists in `de`, `fr` and `it`. Missing keys fall back rather than crash, so
drift is silent. A key-parity check in CI would close this cheaply.

## Route-level Supabase access

The Insights CMS was the last place calling Supabase directly from a route
component; it now goes through `articles.functions.ts`. File uploads
deliberately remain on the browser client, since pushing file bytes through the
RPC boundary would be worse — storage RLS is the boundary there, and the
policies are in place.

## Historical planning documents

`.lovable/plan*.md` records how decisions were reached across several
revisions. They are useful archaeology and actively misleading as
specifications, because they describe intermediate states. `docs/` is the
current description; prefer it, and do not update the plan files.