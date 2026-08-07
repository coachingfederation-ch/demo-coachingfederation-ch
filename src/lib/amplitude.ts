/**
 * Amplitude Browser SDK loader and event helpers.
 * Exports: initAmplitude, trackAmplitudePageView, trackEvent, identifyUser.
 * Used by components/analytics.tsx and any component that reports a product event.
 */
import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-browser";

// The browser ingestion key is a publishable value (it ships in the client
// bundle by design); an env override keeps staging/prod separable later.
const apiKey =
  (import.meta.env["VITE_AMPLITUDE_API_KEY"] as string | undefined) ??
  "058150d8c38b3a0d967264916a0e226d";

let initialised = false;

/** Boots the SDK once in the browser. No-op on the server or without an API key. */
export function initAmplitude() {
  if (typeof window === "undefined" || initialised || !apiKey) return;
  initialised = true;

  amplitude.init(apiKey, {
    // Page views are sent manually on SPA route changes (see trackAmplitudePageView).
    autocapture: {
      attribution: true,
      pageViews: false,
      sessions: true,
      formInteractions: true,
      fileDownloads: true,
      elementInteractions: true,
    },
    // Swiss data protection: keep raw IPs out of the payload.
    trackingOptions: { ipAddress: false },
    defaultTracking: false,
  });
}

/** Sends a page view for the current SPA location. */
export function trackAmplitudePageView(path: string) {
  initAmplitude();
  if (!initialised) return;
  amplitude.track("[Amplitude] Page Viewed", {
    "[Amplitude] Page Path": path,
    "[Amplitude] Page URL": window.location.href,
    "[Amplitude] Page Title": document.title,
  });
}

/** Sends a product event. Safe to call before init — it simply no-ops. */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  // Child effects run before the root <Analytics /> effect, so init lazily
  // here instead of dropping the first event of a page.
  initAmplitude();
  if (!initialised) return;
  amplitude.track(name, properties);
}

/** Associates subsequent events with a signed-in user. Pass null on sign-out. */
export function identifyUser(userId: string | null) {
  if (!initialised) return;
  amplitude.setUserId(userId ?? undefined);
}

/**
 * Fires a single view event when the component mounts (and whenever the
 * identifying key changes), so detail pages report one event per item.
 */
export function useTrackView(name: string, key: string, properties?: Record<string, unknown>) {
  useEffect(() => {
    trackEvent(name, properties);
    // Properties are derived from `key`; re-firing on object identity would
    // double-count every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
}