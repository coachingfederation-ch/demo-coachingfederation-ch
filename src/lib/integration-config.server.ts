/**
 * The single row in `integration_config` — the switch that decides whether the
 * whole member pipeline is talking to the ICF TEST or LIVE feed, whether
 * member-facing email is suppressed, and whether account claiming is open.
 *
 * Read by the sync engine, the claim flow, the cutover runbook and the admin
 * screens. Writes go through the admin server functions, and a database
 * trigger (`tg_integration_config_guard`) enforces the invariants that matter:
 * TEST mode can never send member email or open claiming, and mode is a
 * one-way door.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { IntegrationConfig } from "./integration";

export async function loadIntegrationConfigAdmin(): Promise<IntegrationConfig> {
  const { data, error } = await supabaseAdmin
    .from("integration_config")
    .select("*")
    .eq("id", true)
    .single();
  if (error) throw error;
  return data as unknown as IntegrationConfig;
}
