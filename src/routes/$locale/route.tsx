/**
 * Locale-prefixed layout route (/:locale).
 * Exports: Route. Validates the locale parameter and provides a nested outlet for localized pages.
 */

import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { isLocale } from "@/i18n/config";

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale) || params.locale === "en") throw notFound();
  },
  component: () => <Outlet />,
});
