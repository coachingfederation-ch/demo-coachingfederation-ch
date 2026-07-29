/**
 * Supabase access for MCP tools.
 *
 * Every query runs as the connected user: the verified bearer token is
 * forwarded to PostgREST so RLS decides what an assistant may read, exactly as
 * it would in the browser. No admin/service-role client is ever used here.
 */
import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

export function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

/**
 * PostgREST parses `.or()` as filter syntax, so commas, parentheses, dots and
 * quotes in free text would change the query's structure. Strip them and the
 * LIKE wildcards, leaving a plain literal substring to match on.
 */
export function sanitiseSearchText(value: string): string {
  return value
    .replace(/[,.()"'\\%_*]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
