import { supabaseAdmin } from "@/integrations/supabase/client.server";

const COLUMNS = [
  "cst_recno",
  "full_name",
  "email",
  "phone",
  "city",
  "country",
  "credential_slug",
  "credential_awarded_on",
  "credential_expires_on",
  "member_type",
  "membership_join_date",
  "membership_expiration_date",
  "activity_state",
  "scheduled_deletion_at",
  "last_synced_at",
] as const;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  // Neutralise spreadsheet formula injection: Excel/Sheets execute any cell
  // starting with =, +, -, @ or a leading tab/CR. Synced ICF fields are
  // untrusted input, so prefix those with an apostrophe to force text.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function buildMembersCsv(): Promise<{ filename: string; csv: string; rows: number }> {
  const { data: config } = await supabaseAdmin
    .from("coach_finder_config")
    .select("csv_export_row_cap")
    .maybeSingle();
  const cap = config?.csv_export_row_cap ?? 5000;

  const { data, error } = await supabaseAdmin
    .from("members")
    .select(COLUMNS.join(", "))
    .order("last_name", { ascending: true })
    .limit(cap);
  if (error) throw error;

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((c) => cell(row[c])).join(",")),
  ].join("\n");

  return {
    filename: `icf-members-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    rows: rows.length,
  };
}
