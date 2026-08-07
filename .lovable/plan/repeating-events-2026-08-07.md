# Repeating events

Staff can turn a single event into a repeating series. Each date becomes its own event page with its own registration list, generated once, capped at 12 months into the future.

## How it works for staff

In the event editor, a new "Repeat" panel appears under Date and time:

- Repeat: does not repeat / weekly / monthly by date / monthly by weekday
- Every N weeks (weekly only, 1-8)
- Ends: on a date, or after N occurrences — never beyond 12 months from the first date
- A live preview lists the dates that will be created ("14 Sep, 28 Sep, 12 Oct …")
- A "Create N dates" button generates the occurrences

Generated occurrences are copies of the current event: same content, image, location, registration settings, category/region/community, hosts and language. They are created as **drafts** so nothing goes public accidentally, with their own slug (`my-event-2026-09-14`) and shifted start/end times (duration preserved).

After creation each date is fully independent — editing, publishing, cancelling or deleting one does not touch the others. The events list shows a small "Series" badge with the series date so related entries are easy to spot, and generation from the same source event again only adds dates that don't exist yet.

Rules enforced server-side:
- Maximum 12 months ahead of the first occurrence
- Maximum 60 generated dates in one action
- Occurrences are always drafts; the source event keeps its own status

## Technical notes

Schema (one migration):
- `events.series_id uuid null` — groups occurrences; the source event gets a fresh id assigned on first generation. Indexed.
- `events.recurrence jsonb null` on the source event only, storing the rule used (frequency, interval, end rule) so the panel can restore the last settings.

Code:
- `src/lib/recurrence.ts` (pure, unit-testable): given a start timestamp, timezone and rule, returns the list of occurrence timestamps, clamped to 12 months and 60 items. Handles weekly/N-weekly, monthly-by-date (skips months without that day, e.g. the 31st) and monthly-by-weekday (nth weekday, skips months without a 5th).
- `src/lib/events-admin.functions.ts`: `generateEventOccurrences` server fn — `assertOrganizer`, re-derives dates server-side from the validated rule (never trusts a client-supplied list), copies the source row plus `event_hosts`, inserts as drafts through `context.supabase` so RLS still decides ownership, skips slugs that already exist, returns created count. Also persists `recurrence` on the source event.
- `src/components/cms/EventEditorSections.tsx`: new `EventRepeatSection`, rendered after the date fields, using the same `Section`/`Field` primitives. Preview dates formatted with the existing locale helpers.
- `src/routes/_staff/manage.events.$id.tsx`: wires the panel, calls the generate fn, shows the result message and refreshes.
- `src/routes/_staff/manage.events.index.tsx`: series badge on grouped rows.
- i18n: new `events.repeat.*` keys in `cms.json` for en/de/fr/it.

Public site, filters, RSVP, translations and the events feed are untouched — occurrences are ordinary events.

## PR note

**Summary** — Adds optional recurrence to events: staff generate up to 12 months of independent occurrence events from one source event.

**Changes**
- UI: repeat panel in the staff event editor with date preview; series badge in the events list.
- Backend: `generateEventOccurrences` server fn; pure recurrence date generator.
- i18n: `events.repeat.*` in four languages.

**Backend / schema changes** — one migration adding `events.series_id` (indexed) and `events.recurrence` (jsonb). No RLS change: occurrences inherit the existing events policies and are written with the caller's client.

**Testing & verification** — Generate weekly / every-2-weeks / monthly-by-date (incl. a 31st start) / monthly-by-weekday (incl. a 5th Tuesday) series; verify the 12-month clamp, duplicate-slug skip, host copying, draft status, and that editing one occurrence leaves siblings unchanged. Check as organizer (own events only) and editor.

**Risks & rollback** — Blast radius limited to the staff editor; generated events are drafts and deletable. Reverting code leaves the two nullable columns harmlessly in place.

**Follow-ups / known debt** — No "edit series / apply to all future dates" and no bulk publish or bulk delete of a series; both are deliberate for now.
