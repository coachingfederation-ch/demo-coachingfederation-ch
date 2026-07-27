/**
 * Server-side role guards for `createServerFn` handlers.
 *
 * The role-checking helpers (`has_role`, `is_editor`, `is_staff`) live in the
 * database's `private` schema so they are not reachable as RPC endpoints — a
 * signed-in user must not be able to probe whether some other account holds a
 * role. RLS policies still call them internally; application code checks roles
 * by reading `user_roles` directly instead.
 *
 * These read through `context.supabase`, the caller's own RLS-scoped client, so
 * the `user_roles` "read own roles" policy is what makes the answer
 * trustworthy: a caller can only ever see their own rows, and the role is never
 * taken from client-supplied input.
 *
 * This module is deliberately client-safe (no `.server.ts` suffix, no secrets)
 * because `*.functions.ts` module scope is bundled for the browser.
 */
export type AppRole = "admin" | "editor" | "contributor" | "member" | "user";

/** Roles that may reach the Insights CMS. */
const STAFF_ROLES: AppRole[] = ["admin", "editor", "contributor"];

type AuthedContext = { supabase: any; userId: string };

async function rolesOf(context: AuthedContext): Promise<AppRole[]> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Forbidden");
  return (data ?? []).map((r: { role: AppRole }) => r.role);
}

/** Throws unless the caller holds `role`. Returns the caller's user id. */
export async function assertRole(context: AuthedContext, role: AppRole): Promise<string> {
  const roles = await rolesOf(context);
  if (!roles.includes(role)) throw new Error("Forbidden");
  return context.userId;
}

/** Throws unless the caller is an admin. Returns the caller's user id. */
export async function assertAdmin(context: AuthedContext): Promise<string> {
  return assertRole(context, "admin");
}

/** Throws unless the caller is admin, editor or contributor. */
export async function assertStaff(context: AuthedContext): Promise<string> {
  const roles = await rolesOf(context);
  if (!roles.some((r) => STAFF_ROLES.includes(r))) throw new Error("Forbidden");
  return context.userId;
}

/** Throws unless the caller is admin or editor (full editorial rights). */
export async function assertEditor(context: AuthedContext): Promise<string> {
  const roles = await rolesOf(context);
  if (!roles.includes("admin") && !roles.includes("editor")) throw new Error("Forbidden");
  return context.userId;
}