/**
 * Content ownership before and after the LIVE cutover.
 *
 * The cutover deletes every auth account that holds no staff role. Articles are
 * hard-linked to `profiles` (which cascades from `auth.users`), so an article
 * owned by such an account used to disappear with it. The foreign key is now
 * `ON DELETE RESTRICT`, which turns silent data loss into a blocked delete —
 * and this module is the way out of that block: report the affected content and
 * hand it to a surviving staff profile.
 *
 * Reads use the admin client because they span `auth.users` and `user_roles`
 * for accounts other than the caller. Writes are done by the caller's own
 * RLS-scoped client so the `articles` / `events` policies stay the boundary.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { STAFF_ROLES } from "./role-model";

type Client = Pick<SupabaseClient<Database>, "from">;

export type OwnedItem = {
  id: string;
  title: string;
  status: string;
  ownerId: string | null;
  ownerLabel: string;
};

export type StaffProfileOption = { id: string; label: string };

export type ContentOwnershipReport = {
  staffProfiles: StaffProfileOption[];
  articles: OwnedItem[];
  events: OwnedItem[];
};

/** Profile ids that survive the cutover: they hold at least one staff role. */
async function staffProfileIds(): Promise<Set<string>> {
  const { data } = await supabaseAdmin.from("user_roles").select("user_id, role");
  const ids = new Set<string>();
  for (const row of data ?? []) {
    if ((STAFF_ROLES as readonly string[]).includes(row.role)) ids.add(row.user_id);
  }
  return ids;
}

/**
 * Human labels for profiles. Names are often blank on staff accounts created
 * through Google sign-in, so fall back to the account email, then to a short id.
 */
async function profileLabels(): Promise<Map<string, string>> {
  const [{ data: profiles }, authList] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, first_name, last_name"),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const emails = new Map<string, string>();
  for (const user of authList.data?.users ?? []) {
    if (user.email) emails.set(user.id, user.email);
  }
  const labels = new Map<string, string>();
  for (const p of profiles ?? []) {
    const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
    labels.set(p.id, name || emails.get(p.id) || `Account ${p.id.slice(0, 8)}`);
  }
  return labels;
}

/** Articles and events owned by an account the cutover would delete. */
export async function loadContentOwnership(): Promise<ContentOwnershipReport> {
  const [staffIds, labels] = await Promise.all([staffProfileIds(), profileLabels()]);

  const [{ data: articles }, { data: events }] = await Promise.all([
    supabaseAdmin.from("articles").select("id, title, status, author_id"),
    supabaseAdmin.from("events").select("id, title, status, organizer_id"),
  ]);

  const label = (id: string | null) =>
    id ? (labels.get(id) ?? `Account ${id.slice(0, 8)}`) : "—";

  return {
    staffProfiles: [...staffIds]
      .filter((id) => labels.has(id))
      .map((id) => ({ id, label: labels.get(id) as string }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    articles: (articles ?? [])
      .filter((a) => !a.author_id || !staffIds.has(a.author_id))
      .map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        ownerId: a.author_id,
        ownerLabel: label(a.author_id),
      })),
    events: (events ?? [])
      .filter((e) => e.organizer_id !== null && !staffIds.has(e.organizer_id))
      .map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        ownerId: e.organizer_id,
        ownerLabel: label(e.organizer_id),
      })),
  };
}

/** Count used by the cutover rehearsal to warn without blocking. */
export async function countAtRiskContent(): Promise<{ articles: number; events: number }> {
  const report = await loadContentOwnership();
  return { articles: report.articles.length, events: report.events.length };
}

export async function reassignContentOwnership(
  client: Client,
  targetProfileId: string,
  articleIds: string[],
  eventIds: string[],
) {
  if (articleIds.length > 0) {
    const { error } = await client
      .from("articles")
      .update({ author_id: targetProfileId })
      .in("id", articleIds);
    if (error) throw error;
  }
  if (eventIds.length > 0) {
    const { error } = await client
      .from("events")
      .update({ organizer_id: targetProfileId })
      .in("id", eventIds);
    if (error) throw error;
  }
  return { articles: articleIds.length, events: eventIds.length };
}