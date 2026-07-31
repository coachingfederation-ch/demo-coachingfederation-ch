/**
 * Europe Pulse — public read path plus the admin "scan now" trigger.
 *
 * The feed itself is read with the publishable-key client so RLS ("published
 * items only") is what decides visibility. Everything the CMS reads or edits
 * goes through the browser client under the admin RLS policies; only the run
 * itself needs a server function, because it holds the Firecrawl and AI keys.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./authz";
import type { Locale } from "@/i18n/config";
import { PULSE_COLUMNS, localizePulse, type PulseItem, type PulseRow } from "./europe-pulse";

const localeSchema = z.enum(["en", "de", "fr", "it"]);

export type PulseFeed = { weekOf: string | null; items: PulseItem[] };

export const listEuropePulse = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ locale: localeSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<PulseFeed> => {
    const { publicSupabaseClient } = await import("./supabase-public.server");
    const { data: rows, error } = await publicSupabaseClient()
      .from("europe_pulse")
      .select(PULSE_COLUMNS)
      .eq("status", "published")
      .order("week_of", { ascending: false })
      .order("sort_rank", { ascending: true })
      .limit(60);
    if (error) throw error;

    const all = (rows ?? []) as unknown as PulseRow[];
    // Only the most recent week is published as a feed; older rows are archive.
    const weekOf = all[0]?.week_of ?? null;
    const locale = (data.locale ?? "en") as Locale;
    return {
      weekOf,
      items: all.filter((r) => r.week_of === weekOf).map((r) => localizePulse(r, locale)),
    };
  });

/** Admin-triggered scan + curation run. */
export const runEuropePulseNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await assertAdmin(context);
    const { runEuropePulse } = await import("./europe-pulse.server");
    return runEuropePulse({ triggerSource: "manual", triggeredBy: userId });
  });

/**
 * Re-scan only the chapters that failed in a given run. Curation still runs
 * over the whole week, so a successful retry fills the gaps in the feed.
 */
export const retryFailedChapters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ runId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const userId = await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("europe_pulse_raw")
      .select("chapter_id")
      .eq("run_id", data.runId)
      .eq("status", "failed");
    const chapterIds = [
      ...new Set((rows ?? []).map((r) => r.chapter_id as string | null).filter(Boolean) as string[]),
    ];
    if (!chapterIds.length) return null;
    const { runEuropePulse } = await import("./europe-pulse.server");
    return runEuropePulse({ triggerSource: "manual", triggeredBy: userId, chapterIds });
  });