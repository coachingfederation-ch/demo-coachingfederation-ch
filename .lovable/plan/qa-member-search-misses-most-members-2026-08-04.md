# QA member search misses most members

## What's wrong

Member 9811574 (Susan Mackay) is a valid QA target: active, no linked account. She is missing from the picker because the list sent to the browser is capped at the first 200 claimable members sorted by last name. There are 499 claimable members, and 288 sort before "Mackay" — she falls outside the cap. The search box only filters what was already downloaded, so it can never find her.

## Fix

Make the search run against the database instead of a truncated in-memory list.

- Keep the initial list (first 200) as the default view when the box is empty.
- When at least 2 characters are typed, query the server for matches across all claimable members, debounced ~250ms.
- Match on first name, last name, full name, and ICF number.
- Return at most 50 matches; show a subtle "refine your search" note when the cap is hit.
- Keep the current behaviour otherwise: selected-member pill, clear, and the post-provision reset.

## Technical notes

- `src/lib/qa-test-account.server.ts`: add a `search` parameter to `listClaimableMembers`, applying an `or(...)` ilike filter on `first_name`, `last_name`, `full_name`, `cst_recno` alongside the existing `auth_user_id is null` + `activity_state = 'active'` guards. Sanitise the term (strip commas/parens) before building the PostgREST `or` expression, matching the existing directory-search hardening.
- `src/lib/roles.functions.ts`: add a `searchQaCandidates` admin server function taking `{ query: string }`, gated by `assertAdmin` and the same TEST-mode check as `listQaProvisioningOptions`.
- `src/routes/_staff/roles.tsx`: replace client-side `.filter(...)` with debounced server results; keep local filtering only while the query is under 2 characters.
- No schema, RLS, or grant changes.

## PR note

**Summary** — The QA test-account member picker silently hid most members because only the first 200 claimable records were sent to the browser. Search now runs server-side over all claimable members.

**Changes**
- UI: debounced server-backed search in the QA test account panel; cap notice when results are truncated.
- Backend: `listClaimableMembers` accepts a search term; new admin-only `searchQaCandidates` server function.

**Backend / Schema changes** — None.

**Testing & Verification** — Search "9811574" and "Mackay" as an admin in TEST mode and confirm Susan Mackay appears and can be selected/provisioned; confirm empty query still lists the default set; confirm the panel remains hidden in LIVE mode; confirm a non-admin cannot call the new function.

**Risks & Rollback** — Low; additive server function plus a UI change in one staff panel. Revert the three files to roll back.

**Follow-ups** — The default 200-row list could later be dropped entirely in favour of search-only, once staff are used to typing.
