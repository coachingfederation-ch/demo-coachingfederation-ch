/**
 * Single member row for the roles admin table (src/routes/_staff/roles.tsx).
 * Extracted verbatim; renders the badges and the editor/organizer/remove
 * controls for one imported member.
 */
import { CalendarDays, ShieldCheck } from "lucide-react";
import type { listRoleAdminData } from "@/lib/roles.functions";
import type { ManagedRole } from "@/lib/role-model";

type MemberRow = Awaited<ReturnType<typeof listRoleAdminData>>["members"][number];

export function RoleTableRow({
  member: m,
  pending,
  onToggle,
  onRemoveAccess,
  t,
}: {
  member: MemberRow;
  pending: string | null;
  onToggle: (row: MemberRow, role: ManagedRole) => void | Promise<void>;
  onRemoveAccess: (authUserId: string, name: string) => void | Promise<void>;
  t: (k: string) => string;
}) {
  return (
    <tr className="border-t border-border">
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
          <span className="text-xs text-muted-foreground">{t("roles.adminNote")}</span>
        ) : (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => void onToggle(m, "editor")}
              disabled={pending === `${m.memberId}:editor`}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
            >
              {m.isEditor ? t("roles.revokeEditor") : t("roles.grantEditor")}
            </button>
            <button
              onClick={() => void onToggle(m, "organizer")}
              disabled={pending === `${m.memberId}:organizer`}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
            >
              {m.isOrganizer ? t("roles.revokeOrganizer") : t("roles.grantOrganizer")}
            </button>
            {m.isEditor || m.isOrganizer ? (
              <button
                onClick={() => void onRemoveAccess(m.authUserId, m.name)}
                disabled={pending === `account:${m.authUserId}`}
                className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                {t("roles.removeAccess")}
              </button>
            ) : null}
          </div>
        )}
      </td>
    </tr>
  );
}
