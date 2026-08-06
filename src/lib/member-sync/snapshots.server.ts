/**
 * Member sync — snapshot writing.
 *
 * Upserts the feed in chunks and records one `member_import_snapshots` row
 * per changed member, tagged with its change kind. A daily run with no real
 * change writes nothing, keeping the audit trail meaningful.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { NormalizedMember } from "../icf-soap.server";

export async function upsertFeedAndSnapshot(args: {
  feed: NormalizedMember[];
  runId: string;
  now: string;
  changedByRecno: Map<string, string[]>;
  createdRecnos: Set<string>;
}): Promise<void> {
  const { feed, runId, now, changedByRecno, createdRecnos } = args;
  const snapshots: Record<string, unknown>[] = [];

  // Upserted in chunks: the chapter feed is ~500 rows, and one round trip per
  // member would not finish inside a serverless request budget.
  const CHUNK = 200;
  for (let i = 0; i < feed.length; i += CHUNK) {
    const chunk = feed.slice(i, i + CHUNK).map((member) => ({
      ...member,
      activity_state: "active" as const,
      inactive_since: null,
      scheduled_deletion_at: null,
      last_synced_at: now,
      last_sync_run_id: runId,
    }));
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from("members")
      .upsert(chunk, { onConflict: "cst_recno" })
      .select("id, cst_recno");
    if (upsertError) throw upsertError;

    for (const row of upserted ?? []) {
      const member = feed.find((m) => m.cst_recno === String(row.cst_recno));
      if (!member) continue;
      const changed = changedByRecno.get(member.cst_recno) ?? [];
      // Only record a snapshot when something actually moved. Otherwise a
      // daily run would add ~500 identical rows to the audit trail forever.
      if (!changed.length) continue;
      snapshots.push({
        sync_run_id: runId,
        member_id: row.id,
        cst_recno: member.cst_recno,
        normalized_payload: member,
        changed_fields: changed,
        change_kind: createdRecnos.has(member.cst_recno) ? "created" : "updated",
      });
    }
  }

  for (let i = 0; i < snapshots.length; i += 200) {
    const { error } = await supabaseAdmin
      .from("member_import_snapshots")
      .insert(snapshots.slice(i, i + 200) as never);
    if (error) throw error;
  }
}
