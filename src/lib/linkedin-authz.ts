/**
 * Guard for LinkedIn publishing: only accounts that may put an article live
 * may put it in front of the chapter's LinkedIn audience.
 * Exports: assertLinkedInPublisher. Used by linkedin.functions.ts.
 */
import type { AuthedContext } from "./authz";

export async function assertLinkedInPublisher(context: AuthedContext): Promise<string> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Forbidden");
  const roles = ((data ?? []) as { role: string }[]).map((r) => r.role);
  if (!roles.includes("admin") && !roles.includes("publisher")) throw new Error("Forbidden");
  return context.userId;
}
