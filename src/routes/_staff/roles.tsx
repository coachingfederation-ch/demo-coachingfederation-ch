/**
 * Admin-only role administration.
 *
 * The single thing manageable here is the additive `editor` grant on a claimed
 * member: it adds Insights CMS access and changes nothing about membership,
 * the directory profile or Member Area access. `admin` is provisioned by
 * migration and deliberately absent from this screen; `contributor` and `user`
 * are dormant and not surfaced.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { useCms } from "@/i18n/cms";
import { useMyRoles } from "@/lib/roles";
import { grantEditor, listRoleAdminData, revokeEditor } from "@/lib/roles.functions";

export const Route = createFileRoute("/_staff/roles")({
  head: () => ({
    meta: [
      { title: "Roles — ICF Switzerland CMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RolesPage,
});

type MemberRow = Awaited<ReturnType<typeof listRoleAdminData>>["members"][number];
type AuditRow = Awaited<ReturnType<typeof listRoleAdminData>>["audit"][number];

function RolesPage() {
  const { t } = useCms();
  const { roles, loading: rolesLoading } = useMyRoles();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const data = await listRoleAdminData();
      setMembers(data.members);
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

  const toggle = async (row: MemberRow) => {
    setPending(row.memberId);
    try {
      if (row.isEditor) await revokeEditor({ data: { memberId: row.memberId } });
      else await grantEditor({ data: { memberId: row.memberId } });
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
                <th className="px-4 py-3 font-semibold">{t("roles.colAccess")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    {t("roles.loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    {t("roles.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.memberId} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email ?? "—"}</td>
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
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.isAdmin ? (
                        <span className="text-xs text-muted-foreground">{t("roles.adminRow")}</span>
                      ) : (
                        <button
                          onClick={() => void toggle(m)}
                          disabled={pending === m.memberId}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
                        >
                          {m.isEditor ? t("roles.revoke") : t("roles.grant")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
