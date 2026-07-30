/**
 * Operational structure — admin reads that touch `members`.
 *
 * The browser role holds no grants on `public.members` at all (contact details
 * were deliberately taken off the Data API), so the admin screen cannot embed
 * member names into its `op_assignments` query. These reads run server-side
 * with the admin client after the caller has been verified as an admin.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type OpsMemberOption = {
  id: string;
  full_name: string | null;
  auth_user_id: string | null;
};

export type OpsAssignment = {
  id: string;
  member_id: string;
  role_id: string;
  sort_order: number;
  member: { full_name: string | null; email: string | null; auth_user_id: string | null } | null;
};

/** Name search for the assignment picker, capped for a chapter of hundreds. */
export async function searchOpsMembers(term: string): Promise<OpsMemberOption[]> {
  const cleaned = term.replace(/[%_,()]/g, "").trim();
  if (cleaned.length < 2) return [];
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("id, full_name, auth_user_id")
    .ilike("full_name", `%${cleaned}%`)
    .order("full_name", { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as OpsMemberOption[];
}

/** Assignments of one project, resolved to member names for display. */
export async function listOpsAssignments(projectId: string): Promise<OpsAssignment[]> {
  const { data, error } = await supabaseAdmin
    .from("op_assignments")
    .select("id, member_id, role_id, sort_order, member:members(full_name, email, auth_user_id)")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as OpsAssignment[];
}

/** How many assignments a member still holds — drives the revoke prompt. */
export async function countOpsAssignments(memberId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("op_assignments")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId);
  if (error) throw error;
  return count ?? 0;
}
