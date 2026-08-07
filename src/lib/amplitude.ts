/**
 * Amplitude Browser SDK loader and event helpers.
 * Exports: initAmplitude, trackAmplitudePageView, trackEvent, identifyUser.
 * Used by components/analytics.tsx and any component that reports a product event.
 */
import * as amplitude from "@amplitude/analytics-browser";

const apiKey = import.meta.env["VITE_AMPLITUDE_API_KEY"] as string | undefined;

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
  if (!initialised) return;
  amplitude.track("[Amplitude] Page Viewed", {
    "[Amplitude] Page Path": path,
    "[Amplitude] Page URL": window.location.href,
    "[Amplitude] Page Title": document.title,
  });
}

/** Sends a product event. Safe to call before init — it simply no-ops. */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!initialised) return;
  amplitude.track(name, properties);
}

/** Associates subsequent events with a signed-in user. Pass null on sign-out. */
export function identifyUser(userId: string | null) {
  if (!initialised) return;
  amplitude.setUserId(userId ?? undefined);
}