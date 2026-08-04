/**
 * Content ownership panel (admin, go-live screen).
 *
 * Lists articles and events owned by an account the LIVE cutover would delete
 * and lets an admin hand them to a surviving staff profile. Reporting only —
 * the cutover itself is never gated on this list.
 */
import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Users } from "lucide-react";
import { useCms } from "@/i18n/cms";
import {
  getContentOwnership,
  reassignContent,
} from "@/lib/content-ownership.functions";

type Item = { id: string; title: string; status: string; ownerLabel: string };
type Report = {
  staffProfiles: { id: string; label: string }[];
  articles: Item[];
  events: Item[];
};

const CARD = "rounded-2xl border border-border bg-card p-5";

export function ContentOwnershipPanel() {
  const { t } = useCms();
  const [report, setReport] = useState<Report | null>(null);
  const [target, setTarget] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const r = (await getContentOwnership({})) as Report;
      setReport(r);
      setSelected(
        Object.fromEntries([
          ...r.articles.map((a) => [`a:${a.id}`, true] as const),
          ...r.events.map((e) => [`e:${e.id}`, true] as const),
        ]),
      );
      setTarget((prev) => prev || (r.staffProfiles[0]?.id ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = (key: string) => setSelected((s) => ({ ...s, [key]: !s[key] }));

  const submit = async () => {
    if (!report || !target) return;
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const articleIds = report.articles.filter((a) => selected[`a:${a.id}`]).map((a) => a.id);
      const eventIds = report.events.filter((e) => selected[`e:${e.id}`]).map((e) => e.id);
      const r = await reassignContent({
        data: { targetProfileId: target, articleIds, eventIds },
      });
      setNote(`${t("integration.ownDone")}: ${r.articles + r.events}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const rows = (items: Item[], prefix: string, heading: string) =>
    items.length === 0 ? null : (
      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {heading}
        </h3>
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[color:var(--primary)]"
                checked={selected[`${prefix}:${item.id}`] ?? false}
                onChange={() => toggle(`${prefix}:${item.id}`)}
                aria-label={item.title}
              />
              <span>
                <span className="font-semibold">{item.title}</span>{" "}
                <span className="text-xs text-muted-foreground">
                  ({item.status}) · {t("integration.ownOwner")}: {item.ownerLabel}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );

  const total = (report?.articles.length ?? 0) + (report?.events.length ?? 0);

  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Users className="h-4 w-4 text-teal" /> {t("integration.ownTitle")}
        </h2>
        <button
          type="button"
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          onClick={() => void load()}
        >
          <RefreshCw className="mr-1.5 inline h-3 w-3" />
          {t("integration.ownRefresh")}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{t("integration.ownBody")}</p>

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
      {note ? <p className="mt-3 text-xs text-muted-foreground">{note}</p> : null}

      {!report ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("integration.ownLoading")}</p>
      ) : total === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-teal" />
          {t("integration.ownEmpty")}
        </p>
      ) : (
        <>
          {rows(report.articles, "a", t("integration.ownArticles"))}
          {rows(report.events, "e", t("integration.ownEvents"))}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="reassign-target">
              {t("integration.ownReassignTo")}
            </label>
            <select
              id="reassign-target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            >
              {report.staffProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
              disabled={busy || !target}
              onClick={() => void submit()}
            >
              {t("integration.ownReassign")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}