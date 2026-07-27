## Can 9875144 be reset for testing?

Yes. It is currently bound to your own staff account (which holds `admin`, `editor` and `member`), its directory profile is `published`, and its email is the TEST-shaped `zz…zz` address. Unbinding is already supported through the audited **Unbind** action on `/members/$id`, so no schema change or manual data surgery is needed.

Two findings change the shape of the test:

- **The claim gate does not block this.** Only `attemptMemberClaim` (the public `/claim` request form) requires LIVE mode plus `account_claim_enabled`. Token verification and completion have no such check, so an admin-issued link can be completed end to end while the integration stays in TEST — which is exactly the pre-cutover path the flow was designed around.
- **The zz-address only blocks the self-service half.** `issueClaimLinkForMember` does not reject TEST-shaped emails, so the staff-issued link works for 9875144; only the public email request form would refuse that address. That half is verifiable separately with a unit-level check rather than a live run.

### Recommended: use a fresh member, leave 9875144 alone

There are 500 unbound active members in the TEST feed and only one bound record — yours. Testing on an untouched member avoids disturbing the one account you use daily and gives a cleaner signal, because the resulting account starts with no roles at all.

1. Pick an unbound active member with an email and a directory-eligible credential.
2. Issue a claim link from `/members/$id`, complete it in a clean browser session.
3. Verify: account created, `auth_user_id` set, `member` role granted and nothing else, `/my-profile` loads that member, `/articles` and `/members` are refused, token reuse reports "already used", and a second issued link supersedes the first.
4. Confirm the audit trail: `member_claim_link_issued_by_staff` and `member_account_claimed` rows in `member_sync_events`.
5. Clean up: unbind the member and delete the created auth user so the feed returns to one bound record.

### If you specifically want 9875144

Because it is your published, directory-visible member with a real profile, it is the better subject if you want to see the claimed account land on a fully populated `/my-profile`. The reset is:

1. Unbind 9875144 from your staff account on `/members/$id`.
2. Remove the now-orphaned `member` role row from your staff account, so role-based landing stays honest.
3. Issue a claim link, complete it in a clean session — this creates a **separate, member-only** auth account for the zz-address, which is the most faithful reproduction of a real member's first login.
4. Verify as above, and confirm the published directory profile and its photo carry over unchanged to the new account.
5. Restore afterwards: unbind, delete the claimed auth user, rebind 9875144 to your staff account, and re-grant the `member` role.

Step 2 and the restore in step 5 both need data changes, which run through the migration/insert tooling rather than the UI.

### Technical notes

- `completeClaim` creates the auth user with `email_confirm: true`, so the fake `.chzz` domain never needs to receive mail.
- The one-open-link-per-member unique index means issuing a second link automatically supersedes the first — worth asserting rather than assuming.
- Nothing in this test writes to the ICF feed; a subsequent sync re-reads the member row and leaves `auth_user_id` untouched.

  
**Approval Notes**

Yes, use 9875144 for verification as described. 