/**
 * Public event detail + RSVP.
 *
 * The form is deliberately thin: capacity, the registration window and the
 * guest policy are all enforced by database triggers, so the UI's job is to
 * show the current state and translate the returned reason code.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { SiteFooter, SiteHeaderBar, CARD_SHADOW } from "@/components/site-chrome";
import { LocaleLink, useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import {
  eventPlace,
  formatEventDate,
  formatEventTimeRange,
  isPastEvent,
  type PublicEvent,
} from "@/lib/events";
import {
  cancelMyRegistration,
  getMyRegistration,
  submitGuestRegistration,
  submitMemberRegistration,
} from "@/lib/events.functions";

type RsvpState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "done" }
  | { kind: "error"; reason: "full" | "closed" | "duplicate" | "error" };

export function EventFallback({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <SiteHeaderBar compact />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-8 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="mt-4 text-base text-muted-foreground">{t(bodyKey)}</p>
        <LocaleLink to="/events" className="mt-8 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
          {t("events.detail.backToEvents")}
        </LocaleLink>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function EventDetailPage({ event }: { event: PublicEvent }) {
  const { t, locale } = useI18n();
  const tz = event.timezone ?? "Europe/Zurich";
  const past = isPastEvent(event);

  const session = useQuery({
    queryKey: ["auth-user-id"],
    // The bearer attacher reads the *session*, so gate the protected call on the
    // same source: a user with no access token would 500 the server function.
    queryFn: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
    staleTime: 5 * 60_000,
  });
  const signedIn = Boolean(session.data);

  const mine = useQuery({
    queryKey: ["my-event-registration", event.id],
    queryFn: () => getMyRegistration({ data: { eventId: event.id! } }),
    enabled: signedIn && session.isFetched,
    retry: false,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<RsvpState>({ kind: "idle" });

  const rsvpEnabled =
    event.registration_mode === "rsvp" && Boolean(event.registration_open) && !past && !event.is_full;
  const guestsBlocked = !signedIn && event.guest_registration_allowed === false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "saving" });
    const payload = { eventId: event.id!, fullName, email, notes: notes || null };
    const result = signedIn
      ? await submitMemberRegistration({ data: payload })
      : await submitGuestRegistration({ data: payload });
    if (result.ok) {
      setState({ kind: "done" });
      // refetch() ignores `enabled`, so only call it for signed-in visitors —
      // otherwise the protected server fn runs without a bearer token and 401s.
      if (signedIn) void mine.refetch();
    } else {
      setState({ kind: "error", reason: result.reason });
    }
  };

  const cancel = async () => {
    const id = mine.data?.id;
    if (!id) return;
    await cancelMyRegistration({ data: { registrationId: id } });
    setState({ kind: "idle" });
    void mine.refetch();
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <SiteHeaderBar compact />
        </div>
      </header>
      <main id="main">
        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-5xl px-8 pb-16 pt-4">
            <LocaleLink to="/events" className="btn-mono !text-hero-foreground/70 hover:!text-hero-foreground">
              ← {t("events.detail.backToEvents")}
            </LocaleLink>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {event.title}
            </h1>
            {event.summary ? (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-hero-foreground/85">{event.summary}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {formatEventDate(event.starts_at!, locale, tz)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden />
                {formatEventTimeRange(event.starts_at!, event.ends_at, locale, tz)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {eventPlace(event, t("events.tag.online"))}
              </span>
              {event.capacity ? (
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden />
                  {t("events.detail.seatsLeft").replace("{n}", String(event.seats_remaining ?? 0))}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-10 px-8 py-16 lg:grid-cols-[1fr_20rem]">
          <article className="prose-icf max-w-none">
            {event.description ? (
              event.description.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="mb-5 text-base leading-relaxed text-foreground/90">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-base text-muted-foreground">{event.summary}</p>
            )}
            {event.location_mode !== "in_person" && event.online_url && mine.data ? (
              <p className="mt-6 text-sm">
                <a href={event.online_url} className="font-semibold text-primary hover:underline">
                  {t("events.detail.joinLink")}
                </a>
              </p>
            ) : null}
          </article>

          <aside className={"h-fit rounded-2xl border border-border/70 bg-card p-6 lg:sticky lg:top-8 " + CARD_SHADOW}>
            <p className="eyebrow">{t("events.detail.rsvpEyebrow")}</p>

            {event.registration_mode !== "rsvp" ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("events.detail.noRegistration")}</p>
            ) : past ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("events.detail.pastEvent")}</p>
            ) : mine.data ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-teal-foreground">{t("events.detail.youAreIn")}</p>
                <button
                  onClick={() => void cancel()}
                  className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary"
                >
                  {t("events.detail.cancel")}
                </button>
              </div>
            ) : state.kind === "done" ? (
              <p className="mt-4 text-sm font-semibold text-teal-foreground">{t("events.detail.confirmed")}</p>
            ) : event.is_full ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("events.detail.full")}</p>
            ) : !event.registration_open ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("events.detail.closed")}</p>
            ) : guestsBlocked ? (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{t("events.detail.membersOnly")}</p>
                <LocaleLink to="/auth" className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                  {t("events.detail.signIn")}
                </LocaleLink>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <label className="block text-xs font-semibold" htmlFor="rsvp-name">
                  {t("events.detail.fieldName")}
                </label>
                <input
                  id="rsvp-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <label className="block text-xs font-semibold" htmlFor="rsvp-email">
                  {t("events.detail.fieldEmail")}
                </label>
                <input
                  id="rsvp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <label className="block text-xs font-semibold" htmlFor="rsvp-notes">
                  {t("events.detail.fieldNotes")}
                </label>
                <textarea
                  id="rsvp-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={state.kind === "saving" || !rsvpEnabled}
                  className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {state.kind === "saving" ? t("events.detail.saving") : t("events.detail.rsvp")}
                </button>
                {state.kind === "error" ? (
                  <p className="text-sm text-destructive">{t(`events.detail.error.${state.reason}`)}</p>
                ) : null}
                <p className="text-[11px] leading-relaxed text-muted-foreground">{t("events.detail.privacy")}</p>
              </form>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}