/**
 * Member Area gate.
 *
 * Entry requires the `member` role, which is only ever granted alongside an
 * explicit `members.auth_user_id` linkage. A staff account without that
 * linkage has no member profile to show and is sent back to the CMS.
 */
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles } from "@/lib/roles";

export const Route = createFileRoute("/_member")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { next: undefined } });

    const roles = await fetchMyRoles(data.user.id);
    if (!roles.isMember) {
      throw redirect({ to: roles.isStaff ? "/articles" : "/no-access" });
    }
    return { user: data.user, roles };
  },
  component: () => <Outlet />,
});