/**
 * Per-run drill-down for the integration screen.
 *
 * Shows which members a sync run created, updated (with the exact imported
 * fields that changed) or moved into the grace window, plus the run's event
 * log. The data is admin-only, so it is fetched through `getSyncRunDetail`
 * rather than the browser Supabase client.
 */
import { useEffect, useMemo, useState } from "react";
import { useCms } from "@/i18n/cms";
import { getSyncRunDetail } from "@/lib/members.functions";

type MemberRow = {
  memberId: string | null;
  cstRecno: string;
  name: string;
  email: string | null;
  changedFields: string[];
  scheduledDeletionAt?: string | null;
};

type EventRow = {
  id: string;
  eventType: string;
  severity: string;
  message: string | null;
  cstRecno: string | null;
  createdAt: string;
};

type Detail = {
  runId: string;
  created: MemberRow[];
  updated: MemberRow[];
  deactivated: MemberRow[];
  events: EventRow[];
  truncated: boolean;
};

const PAGE = 50;

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "—";
}

function MemberTable({
  rows,
  title,
  query,
  variant,
}: {
  rows: MemberRow[];
  title: string;
  query: string;
  variant: "created" | "updated" | "deactivated";
}) {
  const { t } = useCms();
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.cstRecno.toLowerCase().includes(q),
    );
  }, [rows, query]);

  useEffect(() => setLimit(PAGE), [query]);

  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title} ({filtered.length})
      </h4>
      {filtered.length === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">{t("integration.runNone")}</p>
      ) : (
        <>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3">{t("integration.runColMember")}</th>
                  <th className="py-1 pr-3">{t("integration.runColRecno")}</th>
                  {variant === "created" ? (
                    <th className="py-1">{t("integration.runColEmail")}</th>
                  ) : null}
                  {variant === "updated" ? (
                    <th className="py-1">{t("integration.runColFields")}</th>
                  ) : null}
                  {variant === "deactivated" ? (
                    <th className="py-1">{t("integration.runColDeletion")}</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, limit).map((row) => (
                  <tr
                    key={(row.memberId ?? row.cstRecno) + variant}
                    className="border-t border-border/60 align-top"
                  >
                    <td className="py-1 pr-3 font-semibold">{row.name}</td>
                    <td className="py-1 pr-3 tabular-nums text-muted-foreground">{row.cstRecno}</td>
                    {variant === "created" ? (
                      <td className="py-1 text-muted-foreground">{row.email ?? "—"}</td>
                    ) : null}
                    {variant === "updated" ? (
                      <td className="py-1 text-muted-foreground">
                        {row.changedFields.join(", ") || "—"}
                      </td>
                    ) : null}
                    {variant === "deactivated" ? (
                      <td className="py-1 text-muted-foreground">
                        {formatDate(row.scheduledDeletionAt)}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > limit ? (
            <button
              type="button"
              className="mt-2 rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary"
              onClick={() => setLimit((n) => n + PAGE)}
            >
              {t("integration.runMore")}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

export function SyncRunDetail({ runId }: { runId: string }) {
  const { t } = useCms();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    void (async () => {
      try {
        const result = (await getSyncRunDetail({ data: { runId } })) as Detail;
        if (!cancelled) setDetail(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (error) return <p className="py-3 text-xs text-destructive">{error}</p>;
  if (!detail)
    return (
      <p className="py-3 text-xs text-muted-foreground">{t("integration.runDetailLoading")}</p>
    );

  const nothing =
    detail.created.length === 0 && detail.updated.length === 0 && detail.deactivated.length === 0;

  return (
    <div className="rounded-xl bg-secondary/60 p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("integration.runSearch")}
        aria-label={t("integration.runSearch")}
        className="w-full max-w-sm rounded-lg border border-border bg-card px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/20"
      />
      {nothing ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {t("integration.runDetailEmpty")} {t("integration.runDetailLegacy")}
        </p>
      ) : (
        <>
          <MemberTable
            rows={detail.created}
            title={t("integration.runCreated")}
            query={query}
            variant="created"
          />
          <MemberTable
            rows={detail.updated}
            title={t("integration.runUpdated")}
            query={query}
            variant="updated"
          />
          <MemberTable
            rows={detail.deactivated}
            title={t("integration.runDeactivated")}
            query={query}
            variant="deactivated"
          />
        </>
      )}

      <div className="mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("integration.runEvents")} ({detail.events.length})
        </h4>
        {detail.events.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">{t("integration.runNoEvents")}</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3">{t("integration.runColTime")}</th>
                  <th className="py-1 pr-3">{t("integration.runColEvent")}</th>
                  <th className="py-1">{t("integration.runColMessage")}</th>
                </tr>
              </thead>
              <tbody>
                {detail.events.map((e) => (
                  <tr key={e.id} className="border-t border-border/60 align-top">
                    <td className="py-1 pr-3 text-muted-foreground">{formatDate(e.createdAt)}</td>
                    <td
                      className={
                        "py-1 pr-3 font-semibold " +
                        (e.severity === "error"
                          ? "text-destructive"
                          : e.severity === "warning"
                            ? "text-foreground"
                            : "text-muted-foreground")
                      }
                    >
                      {e.eventType}
                    </td>
                    <td className="py-1 text-muted-foreground">
                      {[e.cstRecno, e.message].filter(Boolean).join(" — ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail.truncated ? (
        <p className="mt-3 text-xs text-muted-foreground">{t("integration.runTruncated")}</p>
      ) : null}
    </div>
  );
}
