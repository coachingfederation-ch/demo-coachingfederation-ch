import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { useCms } from "@/i18n/cms";
import { createEvent, listManagedEvents } from "@/lib/events-admin.functions";

export const Route = createFileRoute("/_staff/manage/events/")({
  head: () => ({
    meta: [
      { title: "Events — ICF Switzerland CMS" },
      {
        name: "description",
        content: "Create, publish and manage ICF Switzerland events and RSVPs.",
      },
      { property: "og:title", content: "Events — ICF Switzerland CMS" },
      {
        property: "og:description",
        content: "Create, publish and manage ICF Switzerland events and RSVPs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ManageEventsPage,
});

type Row = Awaited<ReturnType<typeof listManagedEvents>>[number];

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-warn-soft text-[color:var(--warn)]",
  published: "bg-teal-soft text-teal-foreground",
  cancelled: "bg-secondary text-muted-foreground",
  archived: "bg-secondary text-muted-foreground",
};

function ManageEventsPage() {
  const { t } = useCms();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listManagedEvents()
      .then(setRows)
      .catch(() => setError(t("events.loadError")));
  }, [t]);

  /** A new event starts as a dated draft so the required fields are never empty. */
  const startDraft = async () => {
    setCreating(true);
    try {
      const start = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      start.setHours(18, 30, 0, 0);
      const { id } = await createEvent({
        data: {
          title: t("events.untitled"),
          slug: `event-${Date.now().toString(36)}`,
          summary: null,
          description: null,
          language: "en",
          starts_at: start.toISOString(),
          ends_at: null,
          timezone: "Europe/Zurich",
          location_mode: "in_person",
          venue_name: null,
          city: null,
          online_url: null,
          image_url: null,
          capacity: null,
          registration_mode: "rsvp",
          registration_opens_at: null,
          registration_closes_at: null,
          guest_registration_allowed: true,
          is_featured: false,
        },
      });
      void navigate({ to: "/manage/events/$id", params: { id } });
    } catch {
      setError(t("events.saveError"));
      setCreating(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-10 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("events.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("events.intro")}</p>
          </div>
          <button
            onClick={() => void startDraft()}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {t("events.new")}
          </button>
        </header>

        {error ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("events.colTitle")}</th>
                <th className="px-4 py-3 font-semibold">{t("events.colWhen")}</th>
                <th className="px-4 py-3 font-semibold">{t("events.colWhere")}</th>
                <th className="px-4 py-3 font-semibold">{t("events.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    {t("events.loading")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    {t("events.empty")}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() =>
                      void navigate({ to: "/manage/events/$id", params: { id: row.id } })
                    }
                    className="cursor-pointer border-t border-border hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3 font-medium">{row.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(row.starts_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: row.timezone ?? "Europe/Zurich",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[row.venue_name, row.city].filter(Boolean).join(", ") ||
                        t("events.onlineLabel")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[row.status] ?? ""}`}
                      >
                        {t(`events.status.${row.status}`)}
                      </span>
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
