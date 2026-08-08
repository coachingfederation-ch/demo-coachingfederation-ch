/**
 * Mounts Plausible Analytics once and reports a pageview on every route change.
 * Exports: PlausibleAnalytics. Rendered by routes/__root.tsx so it covers all pages.
 */
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { initPlausible, trackPageView } from "@/lib/plausible";

export function PlausibleAnalytics() {
  const path = useRouterState({
    select: (s) => s.location.pathname + s.location.searchStr,
  });

  useEffect(() => {
    initPlausible();
  }, []);

  useEffect(() => {
    trackPageView(path);
  }, [path]);

  return null;
}
