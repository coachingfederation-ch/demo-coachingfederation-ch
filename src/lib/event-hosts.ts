/**
 * Shared, client-safe shape for event hosts.
 *
 * A host is always a *published* directory profile, so the public page can
 * link straight to `/coach/<profileId>` without a second eligibility check.
 */
export type EventHost = {
  profileId: string;
  fullName: string;
  tagline: string | null;
  imageUrl: string | null;
};

/** Chapter events are hosted by at most two people. */
export const MAX_EVENT_HOSTS = 2;