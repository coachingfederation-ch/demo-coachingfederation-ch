## Phase 2 (rev. 7) — Milestone D: member account claim (delivered, gated off)

Closes the last build item of the member backend. Rev. 4 holds the cutover runbook,
rev. 5 the role model and binding rule, rev. 6 the cutover rehearsal.

### Token model

- A claim link carries a 32-byte `randomBytes` token, base64url. Only its SHA-256
  hash is stored in `member_profile_links.token_hash`, so a database read can
  never be replayed as a working link. Lookup compares in constant time.
- TTL is 7 days. A partial unique index allows exactly one open link per member:
  minting a new one marks any earlier pending row `superseded` (verified — the
  superseded token then reports `unknown`).
- `attempts` / `last_attempt_at` throttle per token; requests are throttled per
  email per hour. The public request endpoint always returns the same neutral
  result, so it cannot be used to enumerate members.

### The three-part gate

Self-service claiming requires all of: `mode = 'live'`, a recorded
`cutover_completed_at`, and `account_claim_enabled = true`. A database trigger
refuses to set the flag otherwise, and `mode` cannot revert from live to test.
`/claim` shows a "member access isn't open yet" notice and `/auth` hides its
claim link until the flag flips — that flip is the last step of the cutover.

Token verification and completion deliberately carry **no** config gate. That is
what makes the flow testable before cutover through the staff-issued link, and it
is safe because a token only exists if staff minted it or the gated request
endpoint did.

### Binding rule (unchanged from rev. 5)

An email address only *nominates* a member record. The claim is refused when the
address matches more than one member or a member that already has an account.
The durable boundary is the explicit `members.auth_user_id` link plus the granted
`member` role — never email equality.

### Screens

`/claim` (request, neutral confirmation) and `/claim/$token` (state screen, then
password + confirm, then automatic sign-in to `/my-profile`). Both are `noindex`
and localised DE/FR/IT/EN through the CMS dictionary with an in-page language
switcher, rather than duplicated under `$locale` routes — they are account
screens, so per-locale URLs would add routing surface with no SEO benefit.

Staff support path: **Issue claim link** on `/members/$id`, admin-only, shows the
URL once and writes a `member_claim_link_issued_by_staff` audit event. It is the
only way a token exists before cutover, since the email transport is still inert.

### Verification run (TEST, member 9875144)

Unbound from the staff account, claimed end to end in a clean browser session,
then fully restored. Confirmed: account created and bound; only the `member` role
granted; `/my-profile` loads that member's real imported data; `/articles` and
`/members` are refused; token reuse reports "already used"; a second link
supersedes the first; issuing a link for an already-bound member is refused;
`member_claim_link_issued_by_staff` and `member_account_claimed` audit rows land;
the published directory profile and photo carry over untouched.

Afterwards the claimed auth user was deleted, open links closed, and 9875144
rebound to the staff account with its `member` role restored.

### Bug found and fixed by the run

`handle_new_user` passed four values into three columns, so the `on_auth_user_created`
trigger raised on every `auth.users` insert and GoTrue returned an opaque 500.
This broke **all** account creation site-wide, not just claiming; it had gone
unnoticed because every existing account predates it. The function now inserts the
correct arity with the same name derivation.

`completeClaim` had mapped any `createUser` failure to `account_exists`, which is
what hid the trigger fault behind advice a member could never act on. It now
returns `account_exists` only for a genuine collision (422 or an "already
registered" message) and throws on infrastructure faults.

### What remains

Only the LIVE cutover execution itself — a business-timed operation following the
rev. 4 runbook, rehearsable with the rev. 6 tooling. Its final step flips
`account_claim_enabled`, which opens `/claim` and reveals the entry point on
`/auth`.
