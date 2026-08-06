/**
 * Per-run audit read model for the integration screen.
 *
 * The counters on `member_sync_runs` say how much moved; this says *what*
 * moved. Two sources are combined:
 *
 *  - `member_import_snapshots` — one row per member the run created or
 *    changed, with the list of imported fields that differed.
 *  - `member_sync_events` — the run's log: deactivations, aborts, failures and
 *    directory bookkeeping.
 *
 * Both tables are service-role only, so this is read with the admin client
 * behind an admin guard in the calling server function — never from the
 * browser.
 *
 * Runs from before the `change_kind` column existed report every snapshot as
 * `updated`; the UI labels those "changed" rather than inventing a split.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Hard ceiling per section — a full first import is ~500 rows. */
const ROW_CAP = 1000;

export type SyncRunMemberRow = {
  memberId: string | null;
  cstRecno: string;
  name: string;
  email: string | null;
  changedFields: string[];
  scheduledDeletionAt?: string | null;
};

export type SyncRunEventRow = {
  id: string;
  eventType: string;
  severity: string;
  message: string | null;
  cstRecno: string | null;
  createdAt: string;
};

export type SyncRunDetail = {
  runId: string;
  created: SyncRunMemberRow[];
  updated: SyncRunMemberRow[];
  deactivated: SyncRunMemberRow[];
  events: SyncRunEventRow[];
  truncated: boolean;
};

type MemberLookup = Map<string, { name: string; email: string | null; cstRecno: string }>;

async function lookupMembers(ids: string[]): Promise<MemberLookup> {
  const map: MemberLookup = new Map();
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += 200) {
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("id, cst_recno, full_name, first_name, last_name, email")
      .in("id", unique.slice(i, i + 200));
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      const name =
        row.full_name?.trim() ||
        [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
        "—";
      map.set(row.id, { name, email: row.email ?? null, cstRecno: String(row.cst_recno) });
    }
  }
  return map;
}

export async function loadSyncRunDetail(runId: string): Promise<SyncRunDetail> {
  const [{ data: snapshots, error: snapError }, { data: events, error: eventError }] =
    await Promise.all([
      supabaseAdmin
        .from("member_import_snapshots")
        .select("member_id, cst_recno, changed_fields, change_kind")
        .eq("sync_run_id", runId)
        .limit(ROW_CAP + 1),
      supabaseAdmin
        .from("member_sync_events")
        .select("id, event_type, severity, message, member_id, cst_recno, details, created_at")
        .eq("sync_run_id", runId)
        .order("created_at", { ascending: true })
        .limit(ROW_CAP + 1),
    ]);
  if (snapError) throw new Error(snapError.message);
  if (eventError) throw new Error(eventError.message);

  const snapshotRows = snapshots ?? [];
  const eventRows = events ?? [];
  const deactivationRows = eventRows.filter((e) => e.event_type === "member_deactivated");

  const lookup = await lookupMembers(
    [...snapshotRows, ...deactivationRows]
      .map((r) => r.member_id)
      .filter((id): id is string => Boolean(id)),
  );

  const toMemberRow = (row: {
    member_id: string | null;
    cst_recno: string | null;
    changed_fields?: string[] | null;
  }): SyncRunMemberRow => {
    const info = row.member_id ? lookup.get(row.member_id) : undefined;
    return {
      memberId: row.member_id ?? null,
      cstRecno: info?.cstRecno ?? String(row.cst_recno ?? "—"),
      name: info?.name ?? "—",
      email: info?.email ?? null,
      changedFields: row.changed_fields ?? [],
    };
  };

  const byName = (a: SyncRunMemberRow, b: SyncRunMemberRow) => a.name.localeCompare(b.name);

  return {
    runId,
    created: snapshotRows
      .filter((r) => r.change_kind === "created")
      .map(toMemberRow)
      .sort(byName),
    updated: snapshotRows
      .filter((r) => r.change_kind !== "created")
      .map(toMemberRow)
      .sort(byName),
    deactivated: deactivationRows
      .map((row) => ({
        ...toMemberRow({ member_id: row.member_id, cst_recno: row.cst_recno }),
        scheduledDeletionAt:
          (row.details as { scheduled_deletion_at?: string } | null)?.scheduled_deletion_at ?? null,
      }))
      .sort(byName),
    events: eventRows
      .filter((r) => r.event_type !== "member_deactivated")
      .map((row) => ({
        id: row.id,
        eventType: row.event_type,
        severity: row.severity,
        message: row.message,
        cstRecno: row.cst_recno ? String(row.cst_recno) : null,
        createdAt: row.created_at,
      })),
    truncated: snapshotRows.length > ROW_CAP || eventRows.length > ROW_CAP,
  };
}