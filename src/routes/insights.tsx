/**
 * Layout route for public Insights (/insights).
 * Exports: Route. Renders an Outlet to support nested insights routes
 * such as the article list and details.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/insights")({
  component: () => <Outlet />,
});
