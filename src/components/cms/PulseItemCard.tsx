/**
 * Single curated item row for the Europe Pulse review list: flag, title,
 * source link, and publish/hide toggle. Extracted from manage.europe-pulse.tsx.
 */
import { Check, ExternalLink, EyeOff } from "lucide-react";
import { flagFor, type PulseRow } from "@/lib/europe-pulse";

export function PulseItemCard({
  item,
  onSetStatus,
}: {
  item: PulseRow;
  onSetStatus: (id: string, status: PulseRow["status"]) => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <span aria-hidden>{flagFor(item.country_code)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title_en}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.chapter} · {item.type} · week of {item.week_of}
        </p>
      </div>
      {/* The public feed only carries items with a date that has
          not passed, so flag rows that stay behind the scenes. */}
      {!item.event_date || item.event_date < new Date().toISOString().slice(0, 10) ? (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          {item.event_date ? "Past" : "No date"} · not shown publicly
        </span>
      ) : null}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Open source"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
      {item.status !== "published" ? (
        <button
          onClick={() => onSetStatus(item.id, "published")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Check className="h-3.5 w-3.5" /> Publish
        </button>
      ) : (
        <button
          onClick={() => onSetStatus(item.id, "hidden")}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold"
        >
          <EyeOff className="h-3.5 w-3.5" /> Hide
        </button>
      )}
      <span className="w-20 text-right text-[11px] uppercase tracking-wider text-muted-foreground">
        {item.status}
      </span>
    </li>
  );
}
