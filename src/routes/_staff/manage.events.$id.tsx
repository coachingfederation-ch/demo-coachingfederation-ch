/**
 * Event editor.
 *
 * Known simplification: the date inputs work in the browser's local timezone
 * and are stored as UTC instants. Swiss staff editing Swiss events see the
 * right thing; a per-event timezone picker would be the complete fix.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { requireStaffAccess, EVENT_ROLES } from "@/lib/staff-guard";
import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { UnsplashPicker, type UnsplashPick } from "@/components/cms/UnsplashPicker";
import { EventTranslationsPanel } from "@/components/cms/EventTranslationsPanel";
import { EventHostsPanel } from "@/components/cms/EventHostsPanel";
import { useCms } from "@/i18n/cms";
import {
  getManagedEvent,
  listEventRegistrations,
  setEventStatus,
  setRegistrationStatus,
  updateEvent,
} from "@/lib/events-admin.functions";

export const Route = createFileRoute("/_staff/manage/events/$id")({
  beforeLoad: ({ context }) => requireStaffAccess(context.queryClient, EVENT_ROLES),
  head: () => ({
    meta: [
      { title: "Edit event — The Switzerland Chapter of ICF CMS" },
      {
        name: "description",
        content:
          "Edit an The Switzerland Chapter of ICF event, its registration settings and attendees.",
      },
      { property: "og:title", content: "Edit event — The Switzerland Chapter of ICF CMS" },
      {
        property: "og:description",
        content:
          "Edit an The Switzerland Chapter of ICF event, its registration settings and attendees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EventEditor,
});

type Managed = NonNullable<Awaited<ReturnType<typeof getManagedEvent>>>;
type Registration = Awaited<ReturnType<typeof listEventRegistrations>>[number];

/** ISO instant -> value for <input type="datetime-local">. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

/** One labelled block of the form — the editor is long, so it reads in chunks. */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-4 border-t border-border pt-4">{children}</div>
    </section>
  );
}

function EventEditor() {
  const { id } = Route.useParams();
  const { t } = useCms();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Managed | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = async () => {
    const row = await getManagedEvent({ data: { id } });
    setEvent(row as Managed | null);
    if (row) setRegistrations(await listEventRegistrations({ data: { eventId: id } }));
  };

  useEffect(() => {
    load().catch(() => setError(t("events.loadError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!event) {
    return (
      <Shell>
        <div className="mx-auto max-w-4xl px-10 py-10 text-sm text-muted-foreground">
          {error ?? t("events.loading")}
        </div>
      </Shell>
    );
  }

  const patch = (next: Partial<Managed>) => setEvent({ ...event, ...next });

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateEvent({
        data: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          summary: event.summary,
          description: event.description,
          language: event.language,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          timezone: event.timezone ?? "Europe/Zurich",
          location_mode: event.location_mode,
          venue_name: event.venue_name,
          city: event.city,
          online_url: event.online_url,
          image_url: event.image_url,
          image_credit_name: event.image_credit_name,
          image_credit_url: event.image_credit_url,
          capacity: event.capacity,
          registration_mode: event.registration_mode,
          registration_opens_at: event.registration_opens_at,
          registration_closes_at: event.registration_closes_at,
          guest_registration_allowed: event.guest_registration_allowed,
          is_featured: event.is_featured,
        },
      });
      setMessage(t("events.saved"));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("events.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (status: "draft" | "published" | "cancelled") => {
    try {
      await setEventStatus({ data: { id: event.id, status } });
      await load();
    } catch {
      setError(t("events.saveError"));
    }
  };

  const confirmed = registrations.filter((r) => r.status === "confirmed").length;

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-10 py-10">
        <button
          onClick={() => void navigate({ to: "/manage/events" })}
          className="btn-mono !text-muted-foreground hover:!text-foreground"
        >
          ← {t("events.backToList")}
        </button>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{event.title}</h1>

        {message ? <p className="mt-3 text-sm text-teal-foreground">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <Section title={t("events.section.details")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("events.fieldTitle")}>
            <input
              className={inputClass}
              value={event.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Field>
          <Field label={t("events.fieldSlug")}>
            <input
              className={inputClass}
              value={event.slug}
              onChange={(e) => patch({ slug: e.target.value })}
            />
          </Field>
          <Field label={t("events.fieldLanguage")}>
            <select
              className={inputClass}
              value={event.language}
              onChange={(e) => patch({ language: e.target.value as Managed["language"] })}
            >
              {["de", "fr", "it", "en"].map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("events.fieldFeatured")}>
            <input
              type="checkbox"
              checked={event.is_featured}
              onChange={(e) => patch({ is_featured: e.target.checked })}
            />
          </Field>
          </div>
        </Section>

        <Section title={t("events.section.content")}>
          <div className="grid gap-4">
            <Field label={t("events.fieldSummary")}>
              <input
                className={inputClass}
                value={event.summary ?? ""}
                onChange={(e) => patch({ summary: e.target.value })}
              />
            </Field>
            <Field label={t("events.fieldDescription")}>
              <textarea
                rows={8}
                className={inputClass}
                value={event.description ?? ""}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Field>
            <EventTranslationsPanel
              eventId={event.id}
              sourceLanguage={event.language}
              contentUpdatedAt={event.content_updated_at ?? null}
            />
          </div>
        </Section>

        <Section title={t("events.section.hosts")} hint={t("events.hosts.sectionHint")}>
          <EventHostsPanel eventId={event.id} />
        </Section>

        <Section title={t("events.section.when")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("events.fieldStarts")}>
            <input
              type="datetime-local"
              className={inputClass}
              value={toLocalInput(event.starts_at)}
              onChange={(e) =>
                patch({ starts_at: fromLocalInput(e.target.value) ?? event.starts_at })
              }
            />
          </Field>
          <Field label={t("events.fieldEnds")}>
            <input
              type="datetime-local"
              className={inputClass}
              value={toLocalInput(event.ends_at)}
              onChange={(e) => patch({ ends_at: fromLocalInput(e.target.value) })}
            />
          </Field>
          </div>
        </Section>

        <Section title={t("events.section.location")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("events.fieldLocationMode")}>
            <select
              className={inputClass}
              value={event.location_mode}
              onChange={(e) => patch({ location_mode: e.target.value as Managed["location_mode"] })}
            >
              <option value="in_person">{t("events.mode.inPerson")}</option>
              <option value="online">{t("events.mode.online")}</option>
              <option value="hybrid">{t("events.mode.hybrid")}</option>
            </select>
          </Field>
          <Field label={t("events.fieldCity")}>
            <input
              className={inputClass}
              value={event.city ?? ""}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </Field>
          <Field label={t("events.fieldVenue")}>
            <input
              className={inputClass}
              value={event.venue_name ?? ""}
              onChange={(e) => patch({ venue_name: e.target.value })}
            />
          </Field>
          <Field label={t("events.fieldOnlineUrl")}>
            <input
              className={inputClass}
              value={event.online_url ?? ""}
              onChange={(e) => patch({ online_url: e.target.value })}
            />
          </Field>
          </div>
        </Section>

        <Section title={t("events.section.image")}>
          <div>
            <Field label={t("events.fieldImageUrl")}>
              <input
                className={inputClass}
                placeholder="https://…"
                value={event.image_url ?? ""}
                onChange={(e) =>
                  // A hand-pasted URL drops any Unsplash credit that no longer applies.
                  patch({
                    image_url: e.target.value,
                    image_credit_name: null,
                    image_credit_url: null,
                  })
                }
              />
            </Field>
            <p className="mt-1 text-xs text-muted-foreground">{t("events.imageHint")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {t("events.chooseUnsplash")}
              </button>
              {event.image_url ? (
                <button
                  type="button"
                  onClick={() =>
                    patch({ image_url: null, image_credit_name: null, image_credit_url: null })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("events.removeImage")}
                </button>
              ) : null}
            </div>
            {event.image_url ? (
              <div className="mt-3">
                <img
                  src={event.image_url}
                  alt=""
                  className="h-32 w-full max-w-xs rounded-xl border border-border object-cover"
                />
                {event.image_credit_name ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("events.imageCredit")} {event.image_credit_name}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">{t("events.imageFallback")}</p>
            )}
          </div>
        </Section>

        <Section title={t("events.section.registration")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("events.fieldCapacity")}>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={event.capacity ?? ""}
              onChange={(e) => patch({ capacity: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>
          <Field label={t("events.fieldRegistrationMode")}>
            <select
              className={inputClass}
              value={event.registration_mode}
              onChange={(e) =>
                patch({ registration_mode: e.target.value as Managed["registration_mode"] })
              }
            >
              <option value="rsvp">{t("events.regMode.rsvp")}</option>
              <option value="none">{t("events.regMode.none")}</option>
            </select>
          </Field>
          <Field label={t("events.fieldGuests")}>
            <input
              type="checkbox"
              checked={event.guest_registration_allowed}
              onChange={(e) => patch({ guest_registration_allowed: e.target.checked })}
            />
          </Field>
          <Field label={t("events.fieldRegOpens")}>
            <input
              type="datetime-local"
              className={inputClass}
              value={toLocalInput(event.registration_opens_at)}
              onChange={(e) => patch({ registration_opens_at: fromLocalInput(e.target.value) })}
            />
          </Field>
          <Field label={t("events.fieldRegCloses")}>
            <input
              type="datetime-local"
              className={inputClass}
              value={toLocalInput(event.registration_closes_at)}
              onChange={(e) => patch({ registration_closes_at: fromLocalInput(e.target.value) })}
            />
          </Field>
          </div>
        </Section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? t("events.saving") : t("events.save")}
          </button>
          {event.status === "published" ? (
            <button
              onClick={() => void changeStatus("draft")}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {t("events.unpublish")}
            </button>
          ) : (
            <button
              onClick={() => void changeStatus("published")}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {t("events.publish")}
            </button>
          )}
          <button
            onClick={() => void changeStatus("cancelled")}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            {t("events.cancelEvent")}
          </button>
          <span className="text-xs text-muted-foreground">
            {t(`events.status.${event.status}`)}
          </span>
        </div>

        <UnsplashPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onPick={(pick: UnsplashPick) =>
            patch({
              image_url: pick.url,
              image_credit_name: pick.creditName,
              image_credit_url: pick.creditUrl,
            })
          }
        />

        <h2 className="mt-12 text-lg font-semibold tracking-tight">{t("events.attendees")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {confirmed}
          {event.capacity ? ` / ${event.capacity}` : ""} {t("events.confirmedSuffix")}
        </p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("events.colName")}</th>
                <th className="px-4 py-3 font-semibold">{t("events.colEmail")}</th>
                <th className="px-4 py-3 font-semibold">{t("events.colStatus")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    {t("events.noAttendees")}
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                    <td className="px-4 py-3">{t(`events.regStatus.${r.status}`)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={async () => {
                          await setRegistrationStatus({
                            data: {
                              registrationId: r.id,
                              status: r.status === "cancelled" ? "confirmed" : "cancelled",
                            },
                          });
                          await load();
                        }}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                      >
                        {r.status === "cancelled" ? t("events.reinstate") : t("events.cancelRsvp")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
