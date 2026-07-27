import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { useCms } from "@/i18n/cms";
import { supabase } from "@/integrations/supabase/client";
import {
  bindMemberAccount,
  getMemberDetail,
  unbindMemberAccount,
  updateMemberDirectory,
} from "@/lib/members.functions";
import { VOCAB_COLUMNS, vocabLabel, type VocabRow } from "@/lib/vocabularies";
import {
  directoryEligibilityReason,
  hasDirectoryCredential,
  isActiveMember,
  isDirectoryEligible,
  isDirectoryVisible,
  type MemberVisibility,
} from "@/lib/directory-eligibility";

export const Route = createFileRoute("/_staff/members/$id")({
  head: () => ({
    meta: [
      { title: "Member — ICF Switzerland CMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MemberDetailPage,
});

type Detail = Awaited<ReturnType<typeof getMemberDetail>>;

/** Visibility values staff may set. System states are shown but not chosen. */
const STAFF_VISIBILITY: MemberVisibility[] = ["draft", "published", "hidden_admin"];

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}

function Flag({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {on ? (
        <Check className="h-4 w-4 text-primary" aria-hidden />
      ) : (
        <X className="h-4 w-4 text-destructive" aria-hidden />
      )}
      <span>{label}</span>
    </div>
  );
}

function MemberDetailPage() {
  const { t, locale } = useCms();
  const { id } = useParams({ from: "/_staff/members/$id" });
  const [detail, setDetail] = useState<Detail | null>(null);
  const [regions, setRegions] = useState<VocabRow[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<MemberVisibility>("draft");
  const [mentor, setMentor] = useState(false);
  const [supervision, setSupervision] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [bindEmail, setBindEmail] = useState("");
  const [bindBusy, setBindBusy] = useState(false);
  const [bindError, setBindError] = useState<string | null>(null);

  const applyDetail = (next: Detail) => {
    setDetail(next);
    setSelectedRegions(next.profile?.region_ids ?? []);
    setVisibility((next.profile?.visibility as MemberVisibility) ?? "draft");
    setMentor(next.profile?.mentor_accredited ?? false);
    setSupervision(next.profile?.supervision_accredited ?? false);
  };

  useEffect(() => {
    void (async () => {
      try {
        const [next, vocab] = await Promise.all([
          getMemberDetail({ data: { memberId: id } }),
          supabase
            .from("cf_regions")
            .select(VOCAB_COLUMNS)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        ]);
        applyDetail(next);
        setRegions((vocab.data ?? []) as VocabRow[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [id]);

  const facts = detail?.member ?? null;
  const reason = facts ? directoryEligibilityReason(facts) : "inactive";
  // Publication needs eligibility *and* a declared service area: a listing with
  // no canton cannot be found by the directory's region filter.
  const publishBlocked = useMemo(() => {
    if (!facts) return null;
    if (!isDirectoryEligible(facts)) return t("members.detail.blockedIneligible");
    if (!selectedRegions.length) return t("members.detail.blockedNoRegion");
    return null;
  }, [facts, selectedRegions, t]);

  const save = async () => {
    setStatus("saving");
    setError(null);
    try {
      const next = await updateMemberDirectory({
        data: {
          memberId: id,
          visibility,
          mentor_accredited: mentor,
          supervision_accredited: supervision,
          region_ids: selectedRegions,
        },
      });
      applyDetail(next as Detail);
      setStatus("saved");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const address = facts
    ? [facts.diagnostics?.zip, facts.city, facts.diagnostics?.state, facts.country]
        .filter(Boolean)
        .join(", ")
    : "";

  // Staff-support binding. Deliberately separate from the future member-initiated
  // claim flow: manual, admin-only and audited, for controlled testing.
  const runBinding = async (action: "bind" | "unbind") => {
    setBindBusy(true);
    setBindError(null);
    try {
      if (action === "bind") await bindMemberAccount({ data: { memberId: id, email: bindEmail } });
      else await unbindMemberAccount({ data: { memberId: id } });
      applyDetail(await getMemberDetail({ data: { memberId: id } }));
      setBindEmail("");
    } catch (err) {
      setBindError(err instanceof Error ? err.message : String(err));
    } finally {
      setBindBusy(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-10 py-10">
        <Link to="/members" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {t("members.detail.back")}
        </Link>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {!detail ? (
          <p className="mt-6 text-sm text-muted-foreground">{t("members.loading")}</p>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">{detail.member.full_name ?? "—"}</h1>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">{t("members.detail.importedTitle")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t("members.detail.importedNote")}</p>
              <dl className="mt-3 text-sm">
                <Row label={t("members.detail.recno")} value={detail.member.cst_recno} />
                <Row label={t("members.colEmail")} value={detail.member.email} />
                <Row label={t("members.detail.phone")} value={detail.member.phone} />
                <Row label={t("members.detail.address")} value={address} />
                <Row label={t("members.colCredential")} value={detail.member.credential_slug} />
                <Row label={t("members.detail.awarded")} value={detail.member.credential_awarded_on} />
                <Row label={t("members.detail.credExpires")} value={detail.member.credential_expires_on} />
                <Row label={t("members.detail.memberType")} value={detail.member.member_type} />
                <Row label={t("members.detail.joined")} value={detail.member.membership_join_date} />
                <Row label={t("members.detail.expires")} value={detail.member.membership_expiration_date} />
                <Row label={t("members.colState")} value={t(`members.state.${detail.member.activity_state}`)} />
                <Row
                  label={t("members.colSynced")}
                  value={detail.member.last_synced_at ? new Date(detail.member.last_synced_at).toLocaleString() : null}
                />
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">{t("members.detail.addressNote")}</p>
            </section>

            <section className="mt-5 rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">{t("members.detail.eligibilityTitle")}</h2>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <Flag label={t("members.detail.isActiveMember")} on={isActiveMember(detail.member)} />
                <Flag label={t("members.detail.hasCredential")} on={hasDirectoryCredential(detail.member)} />
                <Flag label={t("members.detail.isEligible")} on={isDirectoryEligible(detail.member)} />
                <Flag
                  label={t("members.detail.isVisible")}
                  on={isDirectoryVisible(detail.member, detail.profile?.visibility ?? null)}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t(`members.eligibility.${reason}`)}</p>
            </section>

            {!detail.profile ? (
              <p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                {t("members.detail.noProfile")}
              </p>
            ) : (
              <>
                <section className="mt-5 rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">{t("members.detail.serviceAreaTitle")}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{t("members.detail.serviceAreaNote")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {regions.map((region) => {
                      const on = selectedRegions.includes(region.id);
                      return (
                        <button
                          key={region.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setSelectedRegions((prev) =>
                              on ? prev.filter((value) => value !== region.id) : [...prev, region.id],
                            )
                          }
                          className={
                            on
                              ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                              : "rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary"
                          }
                        >
                          {vocabLabel(region, locale)}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedRegions.length ? (
                    <p className="mt-2 text-xs text-muted-foreground">{t("members.detail.noRegions")}</p>
                  ) : null}
                </section>

                <section className="mt-5 rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">{t("members.detail.flagsTitle")}</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={mentor} onChange={(e) => setMentor(e.target.checked)} />
                      {t("members.detail.mentorAccredited")}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={supervision}
                        onChange={(e) => setSupervision(e.target.checked)}
                      />
                      {t("members.detail.supervisionAccredited")}
                    </label>
                  </div>
                </section>

                <section className="mt-5 rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">{t("members.detail.visibilityTitle")}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STAFF_VISIBILITY.map((value) => {
                      const disabled = value === "published" && Boolean(publishBlocked);
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={disabled}
                          aria-pressed={visibility === value}
                          onClick={() => setVisibility(value)}
                          className={
                            visibility === value
                              ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                              : "rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary disabled:opacity-40"
                          }
                        >
                          {t(`members.visibility.${value}`)}
                        </button>
                      );
                    })}
                  </div>
                  {!STAFF_VISIBILITY.includes(visibility) ? (
                    <p className="mt-2 text-xs text-muted-foreground">{t(`members.visibility.${visibility}`)}</p>
                  ) : null}
                  {publishBlocked ? <p className="mt-2 text-xs text-destructive">{publishBlocked}</p> : null}
                </section>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void save()}
                    disabled={status === "saving"}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {status === "saving" ? t("members.detail.saving") : t("members.detail.save")}
                  </button>
                  {status === "saved" ? (
                    <span className="text-xs text-muted-foreground">{t("members.detail.saved")}</span>
                  ) : null}
                </div>
              </>
            )}

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
              {bindError ? <p className="mt-2 text-xs text-destructive">{bindError}</p> : null}
            </section>
          </>
        )}
      </div>
    </Shell>
  );
}
