/**
 * Plausible Analytics loader and event helpers (cookieless, no personal data).
 * Exports: initPlausible, trackPageView, trackGoal, useTrackView.
 * Used by components/plausible-analytics.tsx and goal call sites across the app.
 */
import { useEffect } from "react";

declare global {
  interface Window {
    plausible?: {
      (event: string, options?: { props?: Record<string, unknown>; u?: string }): void;
      q?: unknown[];
    };
  }
}

// The site domain is the one registered in the Plausible dashboard. Both values
// are publishable and stay overridable so preview and production can diverge.
const domain =
  (import.meta.env["VITE_PLAUSIBLE_DOMAIN"] as string | undefined) ?? "new.coachingfederation.ch";
const scriptSrc =
  (import.meta.env["VITE_PLAUSIBLE_SRC"] as string | undefined) ??
  "https://plausible.io/js/script.manual.outbound-links.js";

let initialised = false;

/** Injects the Plausible script once in the browser. No-op during SSR. */
export function initPlausible() {
  if (typeof window === "undefined" || initialised || !domain) return;
  initialised = true;

  // Queue stub so events fired before the script finishes loading are kept.
  window.plausible =
    window.plausible ??
    function queued(...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q ?? []).push(args);
    };

  const script = document.createElement("script");
  script.defer = true;
  script.src = scriptSrc;
  script.setAttribute("data-domain", domain);
  document.head.appendChild(script);
}

/** Sends a manual pageview for the current SPA location. */
export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  initPlausible();
  window.plausible?.("pageview", { u: window.location.origin + path });
}

/**
 * Sends a custom goal. Properties must stay non-identifying — never emails,
 * member IDs or free-text search input.
 */
export function trackGoal(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Child effects run before the root mount effect, so init lazily here
  // instead of dropping the first event of a page.
  initPlausible();
  window.plausible?.(name, props ? { props } : undefined);
}

/**
 * Fires a single goal when the component mounts (and whenever the identifying
 * key changes), so detail pages report one event per item.
 */
export function useTrackView(name: string, key: string, props?: Record<string, unknown>) {
  useEffect(() => {
    trackGoal(name, props);
    // Properties are derived from `key`; re-firing on object identity would
    // double-count every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
}
