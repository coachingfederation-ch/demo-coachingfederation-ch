/**
 * Account-binding + claim-invitation panel for
 * src/routes/_staff/members.$id.tsx. Covers manual bind/unbind, issuing a
 * one-off claim link, and the member-facing invitation email controls.
 */
import type { getMemberClaimInvitationStatus, getMemberDetail } from "@/lib/members.functions";

type Detail = Awaited<ReturnType<typeof getMemberDetail>>;
type Invitation = Awaited<ReturnType<typeof getMemberClaimInvitationStatus>> | null;

export function MemberClaimStatusPanel({
  detail,
  bindEmail,
  setBindEmail,
  bindBusy,
  bindError,
  runBinding,
  invitation,
  inviteBusy,
  inviteResult,
  sendInvitation,
  claimLink,
  issueClaimLink,
  locale,
  t,
}: {
  detail: Detail;
  bindEmail: string;
  setBindEmail: (v: string) => void;
  bindBusy: boolean;
  bindError: string | null;
  runBinding: (action: "bind" | "unbind") => void | Promise<void>;
  invitation: Invitation;
  inviteBusy: boolean;
  inviteResult: string | null;
  sendInvitation: () => void | Promise<void>;
  claimLink: string | null;
  issueClaimLink: () => void | Promise<void>;
  locale: string;
  t: (k: string) => string;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-dashed border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{t("members.detail.bindTitle")}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("members.detail.bindNote")}</p>
      <p className="mt-3 text-sm">
        {t("members.detail.bindCurrent")}:{" "}
        <strong>
          {detail.member.auth_user_id ? detail.member.auth_user_id : t("members.detail.bindNone")}
        </strong>
      </p>
      {detail.member.auth_user_id ? (
        <button
          type="button"
          disabled={bindBusy}
          onClick={() => void runBinding("unbind")}
          className="mt-3 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
        >
          {t("members.detail.unbind")}
        </button>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={bindEmail}
            onChange={(e) => setBindEmail(e.target.value)}
            placeholder={t("members.detail.bindPlaceholder")}
            aria-label={t("members.detail.bindPlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={bindBusy || !bindEmail}
            onClick={() => void runBinding("bind")}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {t("members.detail.bind")}
          </button>
        </div>
      )}
      {!detail.member.auth_user_id && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold">{t("members.invite.title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("members.invite.hint")}</p>
          {invitation?.lastSentAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("members.invite.lastSent")} {new Date(invitation.lastSentAt).toLocaleString(locale)}{" "}
              · {invitation.lastStatus} ({invitation.sendCount})
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">{t("members.invite.neverSent")}</p>
          )}
          <button
            type="button"
            disabled={inviteBusy || invitation?.eligible === false}
            onClick={() => void sendInvitation()}
            className="mt-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {invitation?.sendCount ? t("members.invite.resend") : t("members.invite.send")}
          </button>
          {inviteResult ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("members.invite.result")} {inviteResult}
            </p>
          ) : null}
          {invitation && !invitation.eligible ? (
            <p className="mt-2 text-xs text-destructive">{invitation.blockedReason}</p>
          ) : null}
        </div>
      )}
      {!detail.member.auth_user_id && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">{t("members.issueLinkHint")}</p>
          <button
            type="button"
            disabled={bindBusy}
            onClick={() => void issueClaimLink()}
            className="mt-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
          >
            {t("members.issueLink")}
          </button>
          {claimLink && (
            <div className="mt-3">
              <p className="text-xs font-semibold">{t("members.linkIssued")}</p>
              <code className="mt-1 block break-all rounded-lg bg-secondary px-3 py-2 text-[11px]">
                {claimLink}
              </code>
            </div>
          )}
        </div>
      )}
      {bindError ? <p className="mt-2 text-xs text-destructive">{bindError}</p> : null}
    </section>
  );
}
