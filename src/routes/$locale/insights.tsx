/**
 * Locale-prefixed insights layout route (/:locale/insights).
 * Exports: Route. Provides a shared outlet for insight-related nested routes.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale/insights")({
  component: () => <Outlet />,
});
