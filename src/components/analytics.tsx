/**
 * Mounts Google Analytics once and reports a page view on every route change.
 * Exports: Analytics. Rendered by routes/__root.tsx so it covers all pages.
 */
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { initAnalytics, trackPageView } from "@/lib/analytics";

export function Analytics() {
  const path = useRouterState({ select: (s) => s.location.pathname + s.location.searchStr });

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(path);
  }, [path]);

  return null;
}