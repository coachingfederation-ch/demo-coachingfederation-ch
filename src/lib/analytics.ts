/**
 * Google Analytics (GA4) loader and page-view tracking for the SPA.
 * Exports: initAnalytics, trackPageView. Used by components/analytics.tsx.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const measurementId = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] as
  | string
  | undefined;

let initialised = false;

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

/** Injects gtag.js once. No-op on the server or without a measurement ID. */
export function initAnalytics() {
  if (typeof window === "undefined" || initialised || !measurementId) return;
  initialised = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  // Client-side routing sends its own page_view events below.
  gtag("config", measurementId, { send_page_view: false });
}

/** Sends a page_view for the current SPA location. */
export function trackPageView(path: string) {
  if (typeof window === "undefined" || !measurementId) return;
  gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}