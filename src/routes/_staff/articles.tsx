import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireStaffAccess, ARTICLE_ROLES } from "@/lib/staff-guard";

export const Route = createFileRoute("/_staff/articles")({
  beforeLoad: ({ context }) => requireStaffAccess(context.queryClient, ARTICLE_ROLES),
  component: () => <Outlet />,
});
