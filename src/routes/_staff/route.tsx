/**
 * Staff/volunteer CMS gate.
 *
 * Entry requires a staff role (admin, editor or contributor). A member-only
 * session is sent to its own area instead — the two areas never share chrome
 * or navigation. `ssr: false` because the Supabase session lives in
 * localStorage, which the server cannot read.
 */
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles } from "@/lib/roles";

export const Route = createFileRoute("/_staff")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const roles = await fetchMyRoles(data.user.id);
    if (!roles.isStaff) {
      throw redirect({ to: roles.isMember ? "/my-profile" : "/no-access" });
    }
    return { user: data.user, roles };
  },
  component: () => <Outlet />,
});