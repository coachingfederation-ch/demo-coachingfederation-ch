/**
 * Host picker for the event editor.
 *
 * Candidates come from the public coach directory, so a host is always a coach
 * the public event page can link to. Saving is immediate — hosts live in their
 * own table and are not part of the event form's save payload.
 */
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCms } from "@/i18n/cms";
import { MAX_EVENT_HOSTS, type EventHost } from "@/lib/event-hosts";
import {
  listEventHosts,
  searchEventHostCandidates,
  setEventHosts,
} from "@/lib/events-admin.functions";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function EventHostsPanel({ eventId }: { eventId: string }) {
  const { t } = useCms();
  const [hosts, setHosts] = useState<EventHost[]>([]);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<EventHost[]>([]);
  const [picked, setPicked] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listEventHosts({ data: { eventId } })
      .then((rows) => setHosts(rows as EventHost[]))
      .catch(() => setError(t("events.hosts.loadError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Debounced name search — the directory holds hundreds of coaches.
  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setCandidates([]);
      return;
    }
    const timer = setTimeout(() => {
      void searchEventHostCandidates({ data: { term } })
        .then((rows) => setCandidates(rows as EventHost[]))
        .catch(() => setCandidates([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const commit = async (next: EventHost[]) => {
    setBusy(true);
    setError(null);
    try {
      const saved = await setEventHosts({
        data: { eventId, profileIds: next.map((h) => h.profileId) },
      });
      setHosts(saved as EventHost[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("events.hosts.saveError"));
    } finally {
      setBusy(false);
    }
  };

  const add = () => {
    const found = candidates.find((c) => c.profileId === picked);
    if (!found || hosts.some((h) => h.profileId === found.profileId)) return;
    setPicked("");
    setSearch("");
    setCandidates([]);
    void commit([...hosts, found]);
  };

  const full = hosts.length >= MAX_EVENT_HOSTS;

  return (
    <div>
      <ul className="divide-y divide-border">
        {hosts.map((host) => (
          <li key={host.profileId} className="flex items-center gap-3 py-2">
            {host.imageUrl ? (
              <img src={host.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="h-9 w-9 rounded-full bg-secondary" aria-hidden />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{host.fullName}</span>
              {host.tagline ? (
                <span className="block truncate text-xs text-muted-foreground">{host.tagline}</span>
              ) : null}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => void commit(hosts.filter((h) => h.profileId !== host.profileId))}
              aria-label={t("events.hosts.remove")}
              className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {hosts.length === 0 ? (
          <li className="py-2 text-sm text-muted-foreground">{t("events.hosts.none")}</li>
        ) : null}
      </ul>

      {full ? null : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("events.hosts.search")}
            aria-label={t("events.hosts.search")}
            className={inputClass + " w-56"}
          />
          <select
            aria-label={t("events.hosts.select")}
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className={inputClass + " w-56"}
          >
            <option value="">{t("events.hosts.select")}</option>
            {candidates.map((c) => (
              <option key={c.profileId} value={c.profileId}>
                {c.fullName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            disabled={!picked || busy}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            {t("events.hosts.add")}
          </button>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{t("events.hosts.hint")}</p>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
