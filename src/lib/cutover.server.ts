/**
 * One-time TEST -> LIVE cutover.
 *
 * Configuration (Coach Finder vocabularies, settings singleton, CMS data,
 * schema, RLS, buckets, cron) is preserved untouched. The entire member domain
 * and any TEST auth linkage is archived once, then purged, before the first
 * LIVE import runs. There is no carryover of member-authored content: nothing
 * member-authored exists during TEST.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadIntegrationConfigAdmin } from "./member-email.server";
import { runMemberSync } from "./member-sync.server";
import { soapCredentials } from "./icf-soap.server";
import { isTestShapedEmail } from "./integration";

export type CutoverStep = { step: string; ok: boolean; detail: string };
export type CutoverResult = { ok: boolean; steps: CutoverStep[] };

const MEMBER_DOMAIN_TABLES = [
  "member_profile_regions",
  "member_profile_specialisations",
  "member_profile_languages",
  "member_profile_formats",
  "member_profile_links",
  "member_directory_profiles",
  "member_import_snapshots",
  "member_lifecycle_queue",
  "member_email_log",
  "member_sync_events",
  "members",
  "member_sync_runs",
] as const;

async function dumpTable(table: string) {
  const { data, error } = await supabaseAdmin.from(table as never).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function runCutover(actorUserId: string): Promise<CutoverResult> {
  const steps: CutoverStep[] = [];
  const record = (step: string, ok: boolean, detail: string) => {
    steps.push({ step, ok, detail });
    return ok;
  };

  // 1. Pre-flight
  const config = await loadIntegrationConfigAdmin();
  if (config.mode !== "test" || config.cutover_completed_at) {
    record("preflight", false, "Cutover already completed or integration is not in TEST mode.");
    return { ok: false, steps };
  }
  try {
    soapCredentials("live");
  } catch (error) {
    record("preflight", false, error instanceof Error ? error.message : String(error));
    return { ok: false, steps };
  }
  record("preflight", true, "TEST mode confirmed, LIVE credentials present.");

  // 2. Archive the whole member domain
  const payload: Record<string, unknown> = {};
  const counts: Record<string, number> = {};
  for (const table of MEMBER_DOMAIN_TABLES) {
    const rows = await dumpTable(table);
    payload[table] = rows;
    counts[table] = rows.length;
  }
  const { data: archive, error: archiveError } = await supabaseAdmin
    .from("member_archive_snapshots")
    .insert({
      label: `pre-live-cutover-${new Date().toISOString()}`,
      reason: "test_to_live_cutover",
      taken_by: actorUserId,
      table_counts: counts as never,
      payload: payload as never,
    })
    .select("id")
    .single();
  if (archiveError) {
    record("archive", false, archiveError.message);
    return { ok: false, steps };
  }
  record("archive", true, `Archived ${Object.values(counts).reduce((a, b) => a + b, 0)} rows (snapshot ${archive.id}).`);

  // 3. Freeze
  await supabaseAdmin
    .from("integration_config")
    .update({ cutover_in_progress: true, account_claim_enabled: false })
    .eq("id", true);
  record("freeze", true, "Member reads/writes frozen; account claim held closed.");

  // 4. Purge member domain + TEST auth users
  for (const table of MEMBER_DOMAIN_TABLES) {
    const { error } = await supabaseAdmin
      .from(table as never)
      .delete()
      .not("created_at", "is", null);
    if (error) {
      record("purge", false, `${table}: ${error.message}`);
      return { ok: false, steps };
    }
  }
  let deletedAuthUsers = 0;
  const { data: staffRoles } = await supabaseAdmin.from("user_roles").select("user_id");
  const staffIds = new Set((staffRoles ?? []).map((r) => r.user_id));
  const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const user of authList?.users ?? []) {
    if (staffIds.has(user.id)) continue;
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    deletedAuthUsers += 1;
  }
  record("purge", true, `Member tables emptied; ${deletedAuthUsers} non-staff auth user(s) deleted.`);

  // 5. Switch mode (emails + claim stay off)
  const { error: switchError } = await supabaseAdmin
    .from("integration_config")
    .update({ mode: "live", soap_endpoint_key: "live", emails_suppressed: true, account_claim_enabled: false })
    .eq("id", true);
  if (switchError) {
    record("switch_mode", false, switchError.message);
    return { ok: false, steps };
  }
  record("switch_mode", true, "Mode switched to LIVE. Emails still suppressed, claim still closed.");

  // 6. First LIVE import
  const sync = await runMemberSync({ triggerSource: "cutover", actorUserId });
  if (sync.status !== "succeeded") {
    record("first_live_import", false, sync.message ?? `Sync ${sync.status}.`);
    return { ok: false, steps };
  }
  record("first_live_import", true, `Imported ${sync.feedCount} members (${sync.created} new).`);

  // 7. Validate
  const { data: members } = await supabaseAdmin.from("members").select("email, auth_user_id");
  const rows = members ?? [];
  const testShaped = rows.filter((m) => isTestShapedEmail(m.email)).length;
  const linked = rows.filter((m) => m.auth_user_id).length;
  const { count: vocabCount } = await supabaseAdmin
    .from("cf_regions")
    .select("id", { count: "exact", head: true });
  const validationOk = testShaped === 0 && linked === 0 && rows.length > 0 && (vocabCount ?? 0) > 0;
  record(
    "validate",
    validationOk,
    `${rows.length} member(s); ${testShaped} TEST-shaped email(s); ${linked} pre-linked account(s); ${vocabCount ?? 0} region vocabulary row(s) preserved.`,
  );
  if (!validationOk) return { ok: false, steps };

  // 8. Go live — directory only. Emails and claim remain a separate decision.
  await supabaseAdmin
    .from("integration_config")
    .update({
      cutover_in_progress: false,
      cutover_completed_at: new Date().toISOString(),
      cutover_completed_by: actorUserId,
    })
    .eq("id", true);
  await supabaseAdmin.from("member_sync_events").insert({
    event_type: "cutover_completed",
    severity: "warning",
    message: "TEST to LIVE cutover completed. Emails and account claim remain disabled.",
    actor_user_id: actorUserId,
    details: { steps } as never,
  });
  record("go_live", true, "Directory live. Emails and account claim remain disabled until explicitly opened.");

  return { ok: true, steps };
}