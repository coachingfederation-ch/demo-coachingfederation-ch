## What's left on the roadmap

After today's directory work, two items remain:

1. **Milestone D — member account claim flow** (this plan). The request half exists (`attemptMemberClaim` writes a `member_profile_links` row and calls the inert email gate); the token-consumption and set-password half does not.
2. **The LIVE cutover execution itself** (runbook in `plan-rev4.md` §6, rehearsal delivered in `plan-rev6.md`). That is a business-timed operation, not a build step — it runs when the chapter decides to go live.

Nothing else from the member-backend scope is open: sync, projection layer, eligibility rules, staff CMS, Member Area, member-owned service areas, and the live coach directory with detail pages are all delivered.

---

## Milestone D — claim flow (custom token, transport still inert)

### Behaviour

A member who is in the imported feed but has no account can request access with their email, receive a one-time link, set a password, and land in the Member Area with their member record bound and the `member` role granted.

The whole flow stays **hard-disabled** exactly as today: every server function short-circuits unless the integration is in LIVE mode with `account_claim_enabled` true and a recorded cutover, and no public UI links to it until that flag flips.

### Data model

Extend `public.member_profile_links` (it currently has no token column):

- `token_hash text` — SHA-256 of a 32-byte random token; the raw token only ever exists in the link.
- `consumed_at timestamptz`, `attempts int`, `last_attempt_at timestamptz` for throttling and audit.
- Unique index on `token_hash`; partial index on pending, unexpired rows per member.
- No new grants: the table stays staff-read-only through the Data API. All reads and writes happen in server functions with the admin client.

### Server half

- `requestMemberClaim(email)` — reuses the existing `attemptMemberClaim` gate and matching rule (email only *nominates*; ambiguous or already-linked rows are refused), then mints the token, stores the hash, and hands the URL to `sendMemberEmail`. Always returns the same neutral "if this address is registered…" result so it can't be used to enumerate members.
- `verifyMemberClaimToken(token)` — read-only: valid / expired / consumed / unknown, plus the masked email for display.
- `completeMemberClaim(token, password)` — inside one guarded path: re-verify, create the auth user with `supabaseAdmin.auth.admin.createUser` (email confirmed), set `members.auth_user_id`, grant the `member` role, mark the link consumed, and log a `member_sync_events` entry. Refuses if the member gained a binding in the meantime, so a leaked older link can never re-bind a claimed member.
- Rate limiting: max attempts per token and per email per hour, recorded on the row.

The binding rule from `plan-rev5.md` §5 is preserved — the durable boundary is the explicit `auth_user_id` link plus the granted role, never email equality.

### UI

- `/claim` — email request form, neutral confirmation screen. Rendered only when claim is enabled; otherwise a "member access isn't open yet" notice.
- `/claim/$token` — token state screen, then password set (strength rules, confirm field), then automatic sign-in and redirect to `/my-profile`. Expired/consumed/unknown states each get their own calm message with a path back to `/claim`.
- Both pages use the existing public site chrome, are `noindex`, and are localised DE/FR/IT/EN.
- `/auth` gets a "First time here? Set up your member access" link, shown only when claim is enabled.

### Verification without live email

Email transport stays inert (`no_transport` logging), so testing uses a staff path: on `/members/$id`, an admin-only, audited **"Issue claim link"** action mints a token and displays the URL once for copy-paste. It sits beside the existing bind/unbind support tooling and writes a `member_sync_events` record. This is the only way a token exists before the LIVE cutover.

Verification run in TEST: issue a link for an unbound member, complete the flow in a fresh browser session, confirm the member row is bound, the `member` role is granted, `/my-profile` loads that member's profile, staff routes are refused, and the token is rejected on reuse.

### Docs

Append a Milestone D section to `plan-rev6.md` (or a short `plan-rev7.md`) covering the token model, the gate, the admin-issued link, and the one remaining cutover step that must flip `account_claim_enabled`.

---

### Technical notes

- Token: `crypto.randomBytes(32)` base64url, hashed with `crypto.createHash('sha256')` — both available in the Worker runtime. Constant-time compare on lookup by hash.
- New server functions live in `src/lib/members.functions.ts` with handlers delegating to `src/lib/member-claim.server.ts`; the admin client is imported inside handlers.
- Routes: `src/routes/claim.index.tsx` and `src/routes/claim.$token.tsx`, plus `$locale` equivalents, following the pattern used by the coach detail routes.
- Password sign-in after `createUser` uses the browser client so the session hydrates normally before redirecting.
