# Fix the missing author surname on bylines

## What's actually wrong

The byline does not read the member record. It reads the `profiles` row attached to the
signed-in account, and that row is separate from the member record shown on `/my-profile`.

Verified in the database:

- Member record: first name `Hartmuth`, last name `Gieldanowski`, full name present.
- Linked `profiles` row: first name `Hartmuth`, last name **empty**.

So the byline composes a name from an incomplete profile row and can only output
"Hartmuth". Nothing is wrong with the byline component itself.

Why the profile is incomplete: a profile row is created automatically when an account is
created, from the sign-up metadata. Both places where we create an account for a member —
the claim flow and the QA test-account linker — create the account with only email and
password, no name metadata. The auto-created profile therefore gets empty names, even
though the member record next to it has both.

## The fix

1. **Backfill** — for every account linked to a member, fill empty profile first/last
   names from that member's first/last name. This immediately corrects this byline and
   any other affected author.
2. **Stop it recurring** — when the claim flow and the QA linker create an account, pass
   the member's first and last name as sign-up metadata, and write the names onto the
   profile row right after the account is bound to the member.
3. **Byline order** — the byline currently renders "Surname Firstname". Once the surname
   exists this article would read "Gieldanowski Hartmuth". Switch the public byline to
   natural "Firstname Surname" and keep the surname-first form only where the CMS sorts
   author lists.

## Technical notes

- Backfill as a one-off migration: update `public.profiles` from `public.members` joined
  on `members.auth_user_id`, only where the profile name is null or empty — never
  overwrite a name someone already set.
- `src/lib/member-claim.server.ts` and `src/lib/qa-test-account.server.ts`: add
  `user_metadata: { first_name, last_name }` to `auth.admin.createUser`, then upsert the
  names onto `public.profiles` after the member bind succeeds. The claim path's member
  select gains `first_name, last_name`.
- `authorName()` in `src/lib/articles.ts`: return `First Last`; add a separate
  `authorSortName()` for the CMS picker so list ordering is unchanged.
- No schema, RLS or route changes.

## PR note

- **Summary** — Article bylines drop the author surname because member-linked accounts get a
  profile row with no last name; backfill existing rows and populate names at account creation.
- **Changes** — Backend: name metadata + profile upsert in the claim and QA-linker flows; migration
  to backfill profile names from linked members. UI: byline renders natural name order.
- **Backend / schema changes** — One data-backfill migration on `public.profiles`. No schema change.
- **Testing & verification** — Confirm the affected profile row gains its surname; reload the article
  page and check the byline; claim a fresh test member and confirm both names land; confirm the CMS
  author picker still sorts by surname.
- **Risks & rollback** — Backfill touches only empty name fields, so no authored data is overwritten;
  code changes revert cleanly and the backfill is safe to leave in place.
- **Follow-ups / known debt** — Staff accounts created via Google still depend on provider metadata for
  names; consider letting staff edit their own display name in the CMS.