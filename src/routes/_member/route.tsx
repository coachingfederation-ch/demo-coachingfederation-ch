/**
 * Member Area gate.
 *
 * Entry requires the `member` role, which is only ever granted alongside an
 * explicit `members.auth_user_id` linkage. Holding `editor` as well changes
 * nothing here — that grant only adds the Insights CMS.
 */
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { myRolesQueryOptions } from "@/lib/roles";

export const Route = createFileRoute("/_member")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { next: undefined } });

    const roles = await context.queryClient.ensureQueryData(myRolesQueryOptions(data.user.id));
    if (!roles.isMember) {
      throw redirect({ to: roles.isStaff ? "/articles" : "/no-access" });
    }
    return { user: data.user, roles };
  },
  component: () => <Outlet />,
});
