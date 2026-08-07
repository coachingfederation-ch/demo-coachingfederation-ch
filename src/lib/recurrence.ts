/**
 * Pure date maths for repeating events.
 *
 * Given the first occurrence and a rule, produce the *additional* dates.
 * Both the CMS preview and the server generator call this, so what staff see
 * is exactly what gets created. Kept dependency-free and side-effect free.
 *
 * Known simplification (matches the rest of the event editor): dates are
 * computed on UTC parts, so a series crossing a DST boundary keeps the same
 * UTC time of day rather than the same wall-clock time.
 */
export const RECURRENCE_FREQUENCIES = ["weekly", "monthly_date", "monthly_weekday"] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  /** Only meaningful for `weekly`: every N weeks. */
  interval: number;
  endMode: "count" | "until";
  /** Total occurrences including the source event. */
  count?: number | null;
  /** Inclusive ISO date (yyyy-mm-dd) the series may not pass. */
  until?: string | null;
};

/** Hard ceilings — a series can never run past a year or explode in size. */
export const MAX_SERIES_MONTHS = 12;
export const MAX_OCCURRENCES = 60;

export const DEFAULT_RULE: RecurrenceRule = {
  frequency: "weekly",
  interval: 1,
  endMode: "count",
  count: 6,
  until: null,
};

function addUtcMonths(base: Date, months: number) {
  return new Date(
    Date.UTC(
      base.getUTCFullYear(),
      base.getUTCMonth() + months,
      base.getUTCDate(),
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
    ),
  );
}

/** nth (1-based) weekday of a month, or null when that month has no such day. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number, time: Date) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
  const candidate = new Date(
    Date.UTC(year, month, day, time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds()),
  );
  return candidate.getUTCMonth() === month ? candidate : null;
}

/**
 * Dates *after* `startIso`, capped at 12 months and {@link MAX_OCCURRENCES}.
 * Months that cannot host the pattern (no 31st, no 5th Tuesday) are skipped.
 */
export function expandRecurrence(startIso: string, rule: RecurrenceRule): string[] {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return [];

  const interval = Math.min(Math.max(Math.trunc(rule.interval || 1), 1), 8);
  const horizon = addUtcMonths(start, MAX_SERIES_MONTHS);
  const untilTs =
    rule.endMode === "until" && rule.until
      ? new Date(`${rule.until}T23:59:59.999Z`).getTime()
      : Number.POSITIVE_INFINITY;
  // `count` includes the source event, so we add at most count - 1 dates.
  const wanted =
    rule.endMode === "count"
      ? Math.min(Math.max(Math.trunc(rule.count || 1) - 1, 0), MAX_OCCURRENCES)
      : MAX_OCCURRENCES;

  const out: string[] = [];
  const dayOfMonth = start.getUTCDate();
  const weekday = start.getUTCDay();
  const nth = Math.ceil(dayOfMonth / 7);

  // Step over calendar slots rather than over produced dates, so skipped
  // months (a missing 31st) do not shift the rest of the series.
  for (let step = 1; out.length < wanted && step <= MAX_OCCURRENCES * 2; step++) {
    let candidate: Date | null = null;
    if (rule.frequency === "weekly") {
      candidate = new Date(start.getTime() + step * interval * 7 * 86400000);
    } else if (rule.frequency === "monthly_date") {
      const probe = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth() + step,
          dayOfMonth,
          start.getUTCHours(),
          start.getUTCMinutes(),
          start.getUTCSeconds(),
        ),
      );
      candidate = probe.getUTCDate() === dayOfMonth ? probe : null;
    } else {
      const anchor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + step, 1));
      candidate = nthWeekdayOfMonth(
        anchor.getUTCFullYear(),
        anchor.getUTCMonth(),
        weekday,
        nth,
        start,
      );
    }
    if (!candidate) continue;
    if (candidate.getTime() > horizon.getTime()) break;
    if (candidate.getTime() > untilTs) break;
    out.push(candidate.toISOString());
  }
  return out;
}

/** Slug suffix for one occurrence: `my-event-2026-09-14`. */
export function occurrenceSlug(baseSlug: string, iso: string) {
  return `${baseSlug}-${iso.slice(0, 10)}`.slice(0, 120);
}
