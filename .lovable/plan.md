## Goal

Clear the two follow-up risks from the merge review: repo-wide Prettier drift, and the handful of non-formatting lint errors that remain.

Confirmed current state (just measured):
- `prettier --check src/**` reports style issues in **140 files** (none of them shadcn `src/components/ui` files — those are already clean).
- `eslint .` reports **2319 problems**; 2297 are auto-fixable `prettier/prettier`. Remaining after formatting: **5 errors + 17 warnings**.
  - `src/lib/articles.server.ts:17` — `no-explicit-any`
  - `src/lib/member-profile.server.ts:136, 207` — `no-explicit-any`
  - `src/lib/member-profile.server.ts:202` — `no-control-regex`
  - `src/lib/member-translations.server.ts:39` — `no-control-regex`
  - 17 `react-refresh/only-export-components` + `react-hooks/exhaustive-deps` warnings (non-blocking, left as-is)

## Step 1 — Formatting-only pass (isolated)

Run `bun run format` (`prettier --write .`) across the repo. This is a pure whitespace/quote/wrap diff — no behavioural change. `.prettierignore` already excludes `routeTree.gen.ts`, lockfiles, and build output, so generated files stay untouched.

Verification: re-run `prettier --check .` (expect zero warnings) and `eslint .` (expect the 5 errors + 17 warnings above, and nothing else), then confirm the app still builds and the homepage renders.

This step is kept as its own change set so the noisy diff never mixes with logic changes.

## Step 2 — Resolve the 5 remaining errors properly

Rather than leaving them as permanent noise, make each one intentional and self-documenting:

- **Three `any` in server mappers** (`articles.server.ts`, `member-profile.server.ts`): replace with the narrow row/record types already available from `src/integrations/supabase/types.ts`, or a local `Record<string, unknown>` plus explicit field reads if the Supabase generated type doesn't cover the joined shape. No runtime behaviour changes; the mapping logic stays identical.
- **Two `no-control-regex` sanitizers** (`member-profile.server.ts:202`, `member-translations.server.ts:39`): these strip control characters on purpose, so the rule is wrong here. Add a scoped `// eslint-disable-next-line no-control-regex` with a one-line comment stating why the control characters are intentional.

After this, `eslint .` should report **0 errors** and only the 17 pre-existing React fast-refresh / exhaustive-deps warnings.

## Step 3 — Note the leftover warnings

Add a short entry to `docs/tech-debt.md` recording that the remaining 17 warnings are accepted (fast-refresh hints on files that export both components and constants; two intentional `useMemo` dep omissions), so a future developer doesn't re-litigate them.

## Out of scope

No feature changes, no component restructuring to satisfy `react-refresh`, no dependency updates.
