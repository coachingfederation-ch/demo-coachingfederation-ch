/**
 * Run-controls bar for the Europe Pulse admin: page heading plus the
 * "Run scan now" trigger. Extracted from manage.europe-pulse.tsx.
 */
import { Loader2, RefreshCw } from "lucide-react";

export function PulseRunControls({
  activeChapterCount,
  busy,
  onScanNow,
}: {
  activeChapterCount: number;
  busy: boolean;
  onScanNow: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Europe Pulse</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Weekly scan of {activeChapterCount} European ICF chapter websites, curated into the public
          feed at /europe-pulse.
        </p>
      </div>
      <button
        onClick={onScanNow}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {busy ? "Scanning…" : "Run scan now"}
      </button>
    </div>
  );
}
