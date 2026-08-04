/**
 * Admin-only role administration.
 *
 * The single thing manageable here is the additive `editor` grant on a claimed
 * member: it adds Insights CMS access and changes nothing about membership,
 * the directory profile or Member Area access. `admin` is provisioned by
 * migration and deliberately absent from this screen; `user` is dormant and
 * not surfaced.
 */
import { createFileRoute } from "@tanstack/react-router";
import { requireStaffAccess, ADMIN_ONLY } from "@/lib/staff-guard";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { useCms } from "@/i18n/cms";
import { useMyRoles } from "@/lib/roles";
import {
  grantMemberRole,
  listQaProvisioningOptions,
  listRoleAdminData,
  provisionQaTestAccount,
  revokeMemberRole,
} from "@/lib/roles.functions";
import type { ManagedRole } from "@/lib/role-model";

export const Route = createFileRoute("/_staff/roles")({
  beforeLoad: ({ context }) => requireStaffAccess(context.queryClient, ADMIN_ONLY),
  head: () => ({
    meta: [
      { title: "Roles — The Switzerland Chapter of ICF CMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RolesPage,
});

type MemberRow = Awaited<ReturnType<typeof listRoleAdminData>>["members"][number];
type InternalRow = Awaited<ReturnType<typeof listRoleAdminData>>["internal"][number];
type AuditRow = Awaited<ReturnType<typeof listRoleAdminData>>["audit"][number];

function RolesPage() {
  const { t } = useCms();
  const { roles, loading: rolesLoading } = useMyRoles();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [internal, setInternal] = useState<InternalRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const data = await listRoleAdminData();
      setMembers(data.members);
      setInternal(data.internal);
      setAudit(data.audit);
      setError(null);
    } catch {
      setError(t("roles.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (row: MemberRow, role: ManagedRole) => {
    const held = role === "editor" ? row.isEditor : row.isOrganizer;
    setPending(`${row.memberId}:${role}`);
    try {
      if (held) await revokeMemberRole({ data: { memberId: row.memberId, role } });
      else await grantMemberRole({ data: { memberId: row.memberId, role } });
      await load();
    } catch {
      setError(t("roles.saveError"));
    } finally {
      setPending(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q),
    );
  }, [members, query]);

  if (!rolesLoading && !roles.isAdmin) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl px-10 py-10 text-sm text-muted-foreground">
          {t("roles.adminOnly")}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-10 py-10">
        <h1 className="text-2xl font-bold tracking-tight">{t("roles.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("roles.intro")}</p>

        {error ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="relative mt-6 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roles.searchPlaceholder")}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("roles.colName")}</th>
                <th className="px-4 py-3 font-semibold">{t("roles.colEmail")}</th>
                <th className="px-4 py-3 font-semibold">{t("roles.colLink")}</th>
                <th className="px-4 py-3 font-semibold">{t("roles.colAccess")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                    {t("roles.loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                    {t("roles.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.memberId} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email ?? "—"}</td>
                    {/* Claim linkage, the thing QA actually needs to verify:
                        which imported record, and which auth identity. */}
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      <div>ICF {m.cstRecno}</div>
                      <div title={m.authUserId}>{m.authUserId.slice(0, 8)}…</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                        {t("roles.memberBadge")}
                      </span>
                      {m.isEditor ? (
                        <span className="ml-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t("roles.editorBadge")}
                        </span>
                      ) : null}
                      {m.isOrganizer ? (
                        <span className="ml-1.5 inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {t("roles.organizerBadge")}
                        </span>
                      ) : null}
                      {/* Hybrid accounts (member + admin) are listed here, not
                          under "Internal accounts" — the badge makes that legible. */}
                      {m.isAdmin ? (
                        <span className="ml-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t("roles.adminBadge")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.isAdmin ? (
                        <span className="text-xs text-muted-foreground">
                          {t("roles.adminNote")}
                        </span>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => void toggle(m, "editor")}
                            disabled={pending === `${m.memberId}:editor`}
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
                          >
                            {m.isEditor ? t("roles.revokeEditor") : t("roles.grantEditor")}
                          </button>
                          <button
                            onClick={() => void toggle(m, "organizer")}
                            disabled={pending === `${m.memberId}:organizer`}
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
                          >
                            {m.isOrganizer ? t("roles.revokeOrganizer") : t("roles.grantOrganizer")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Internal accounts: admins (and legacy staff roles) with no imported
            ICF member record. Read-only — admin is provisioned by migration and
            the database refuses to grant editor to a non-member. */}
        <h2 className="mt-10 text-lg font-semibold tracking-tight">{t("roles.internalTitle")}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("roles.internalIntro")}</p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("roles.colName")}</th>
                <th className="px-4 py-3 font-semibold">{t("roles.colEmail")}</th>
                <th className="px-4 py-3 font-semibold">{t("roles.colRoles")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-muted-foreground">
                    {t("roles.loading")}
                  </td>
                </tr>
              ) : internal.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-muted-foreground">
                    {t("roles.internalEmpty")}
                  </td>
                </tr>
              ) : (
                internal.map((a) => (
                  <tr key={a.authUserId} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{a.name ?? a.email ?? a.authUserId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {a.roles.map((role) => (
                        <span
                          key={role}
                          className="mr-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {role}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <QaTestAccountPanel onProvisioned={() => void load()} />

        <h2 className="mt-10 text-lg font-semibold tracking-tight">{t("roles.auditTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("roles.auditIntro")}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {audit.length === 0 ? (
            <li className="text-muted-foreground">{t("roles.auditEmpty")}</li>
          ) : (
            audit.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-border bg-card px-4 py-2 text-muted-foreground"
              >
                <span className="font-medium text-foreground">
                  {entry.subjectName ?? entry.userId}
                </span>{" "}
                — {entry.role} {entry.action}
                {entry.actorName ? ` (${t("roles.auditBy")} ${entry.actorName})` : ""} ·{" "}
                {new Date(entry.createdAt).toLocaleString()}
              </li>
            ))
          )}
        </ul>
      </div>
    </Shell>
  );
}

/**
 * Admin-only QA support control, visible only while the integration is in TEST
 * mode. It creates a pure-member account bound to one unclaimed imported
 * record — the same binding contract as the claim flow, with a login address
 * the operator controls. The password is shown once, in-session, and never
 * stored or emailed.
 */
function QaTestAccountPanel({ onProvisioned }: { onProvisioned: () => void }) {
  const { t } = useCms();
  const [open, setOpen] = useState(false);
  const [testMode, setTestMode] = useState<boolean | null>(null);
  const [candidates, setCandidates] = useState<
    { memberId: string; name: string; cstRecno: string }[]
  >([]);
  const [query, setQuery] = useState("");
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    email: string;
    password: string;
    memberName: string;
  } | null>(null);

  useEffect(() => {
    if (!open || testMode !== null) return;
    void (async () => {
      try {
        const data = await listQaProvisioningOptions();
        setTestMode(data.testMode);
        setCandidates(data.candidates);
      } catch {
        setTestMode(false);
      }
    })();
  }, [open, testMode]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await provisionQaTestAccount({ data: { memberId, email, password } });
      setResult({ email: res.email, password, memberName: res.memberName });
      setMemberId("");
      setQuery("");
      setEmail("");
      setPassword("");
      setCandidates((prev) => prev.filter((c) => c.memberId !== memberId));
      onProvisioned();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("roles.saveError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-lg font-semibold tracking-tight hover:underline"
      >
        {t("roles.qaTitle")}
      </button>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("roles.qaIntro")}</p>

      {open ? (
        testMode === null ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("roles.loading")}</p>
        ) : !testMode ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("roles.qaLiveDisabled")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">{t("roles.qaSelectMember")}</option>
              {candidates.map((c) => (
                <option key={c.memberId} value={c.memberId}>
                  {c.name} · ICF {c.cstRecno}
                </option>
              ))}
            </select>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("roles.qaEmailPlaceholder")}
              className="block w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("roles.qaPasswordPlaceholder")}
              className="block w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <button
              onClick={() => void submit()}
              disabled={busy || !memberId || !email || password.length < 10}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              {t("roles.qaCreate")}
            </button>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {result ? (
              <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
                <p className="font-semibold">{t("roles.qaCreated")}</p>
                <p className="mt-1 text-muted-foreground">{result.memberName}</p>
                <p className="mt-1 font-mono text-xs">{result.email}</p>
                <p className="font-mono text-xs">{result.password}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("roles.qaCredentialsNote")}</p>
              </div>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}
