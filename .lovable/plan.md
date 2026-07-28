## Phase 1 — Events with free RSVP

No Stripe, no tiers, no webhook route, no `payments_live_enabled`. Public event URLs are slug-based. One language per event; no translation table this phase.

### 1. Database (two migrations)

**Migration A — enum only.** `ALTER TYPE public.app_role ADD VALUE 'organizer'`. Postgres refuses to use a new enum value in the same transaction that adds it, so this must land on its own before any policy can reference it.

**Migration B — schema, guards, view.**

New enums: `event_status` (draft/published/cancelled), `event_location_mode` (in_person/online/hybrid), `event_registration_mode` (none/rsvp), `event_registration_status` (confirmed/cancelled).

`public.events`
- `slug` (unique, the public key), `title`, `summary`, `description`, `language` (reuses `article_lang`)
- `image_url`, `image_credit_name`, `image_credit_url` — mirrors `articles`
- `starts_at`, `ends_at`, `timezone` (default `Europe/Zurich`), `location_mode`, `venue_name`, `city`, `online_url`
- `status`, `published_at`, `is_featured`
- `registration_mode`, `capacity` (null = unlimited), `registration_opens_at`, `registration_closes_at`, `guest_registration_allowed`
- `organizer_id` — nullable. Null means chapter-owned: editors/admins manage it, no individual organizer does. That is what lets the seeded events exist without inventing an owner.
- `created_at`, `updated_at`, `content_updated_at`

`public.event_registrations`
- `event_id` (cascade), `user_id` (null = guest), `email`, `full_name`, `status`, `notes`, timestamps
- Partial unique indexes on `(event_id, lower(email))` and `(event_id, user_id)`, both `WHERE status <> 'cancelled'` — so a cancelled RSVP can be redone.

`public.events_public` — `security_invoker = on`, published rows only. Projects safe columns plus computed `registration_count`, `seats_remaining`, `is_full`, `registration_open`. It never exposes `organizer_id` or anything about registrants. Because anon has no read on `event_registrations`, the count comes from a security-definer `private.event_confirmed_count(event_id)`, the same device `coach_directory_public` uses for `private.directory_contact_email`.

**Triggers — where the rules actually live**
- `tg_events_touch_updated_at` — `updated_at` always; `content_updated_at` only when title/summary/description change (pattern of `tg_articles_content_updated_at`).
- `tg_events_publish_guard` — refuses `published` without a title, slug and `starts_at`; stamps `published_at` on first publish.
- `tg_event_registration_guard` — the whole RSVP policy, in one BEFORE INSERT/UPDATE trigger. It takes `SELECT … FOR UPDATE` on the event row first, so two concurrent RSVPs serialise and the last seat cannot be sold twice. It then raises unless: event is `published`, `registration_mode = 'rsvp'`, now is inside the registration window, the event is not cancelled, a guest row (`user_id IS NULL`) is allowed by `guest_registration_allowed`, and confirmed count is below `capacity`. Email is lower-cased here so the unique index is meaningful.

### 2. Security / authz

`events`: `SELECT` on published rows for anon + authenticated; organizers get full CRUD on rows where `organizer_id = auth.uid() AND private.has_role(auth.uid(),'organizer')`; editors/admins get everything via `private.is_editor(auth.uid())`. Grants: `SELECT` to anon/authenticated, write to authenticated, `ALL` to service_role.

`event_registrations`: anon may **INSERT only**, and only rows with `user_id IS NULL`. Authenticated may insert their own row, and read/cancel rows where `user_id = auth.uid()`. Managers read and update all rows for their events through a new security-definer `private.event_is_managed_by(event_id, uid)` (organizer of that event, or editor/admin). **No anon SELECT at all**, so attendee lists cannot be enumerated.

The `organizer` grant follows `editor` exactly: the `user_roles` insert policy admits it only when the target account already holds `member`, keeping the claim linkage requirement. `role_grants` audits it for free. `organizer` joins `STAFF_ROLES` in `src/lib/role-model.ts`, with `assertOrganizer` added to `src/lib/authz.ts`, and appears alongside editor on `/roles`.

### 3. Server functions

`src/lib/events.functions.ts` — public, `publicSupabaseClient()` against `events_public` only:
- `listPublicEvents` (upcoming / past split, paging)
- `getPublicEventBySlug`
- `registerForEvent` — unauthenticated by design, Zod-validated. It derives `user_id` from the bearer token when one is present and never from request input; with no token it inserts a guest row through the anon client. Every rejection comes from the trigger, not from a TypeScript check.
- `getMyRegistration` for the "already registered" state.

`src/lib/events-admin.functions.ts` — `.middleware([requireSupabaseAuth])` plus `assertOrganizer`/`assertEditor`: `listManagedEvents`, `createEvent`, `updateEvent`, `publishEvent`, `cancelEvent`, `listEventRegistrations`. All go through `context.supabase`, so RLS is the real boundary and the guards are only fast failure.

### 4. Public site

- `src/pages/Events.tsx` reworked to read live data (featured / upcoming / past), keeping the current hand-drawn `Mark` visuals and card styling, using `image_url` when a row has one.
- New `src/pages/EventDetail.tsx` — hero with date, city and mode, description, and an RSVP card with four states: **open** (name+email for guests, one-click for signed-in), **closed** (window shut or event cancelled), **full**, **already registered** (with cancel).
- New routes `src/routes/events.$slug.tsx` and `src/routes/$locale/events.$slug.tsx`, loading via the public server function, with per-route `head()` and `Event` JSON-LD.
- Published events added to `sitemap.xml`.

### 5. Staff CMS

`src/routes/_staff/events.tsx` (layout), `events.index.tsx` (list with status and registration counts), `events.new.tsx`, `events.$id.tsx` (edit, publish, cancel, and a registrations table). Nav entry added to `src/components/cms/Shell.tsx`, visible to organizers, editors and admins.

### 6. Content / i18n

`events.json` in EN/DE/FR/IT is reduced to interface copy only — labels, RSVP states, form fields, confirmations, error messages. The events currently hard-coded in those files become seeded published rows in migration B (chapter-owned, `organizer_id` null), so `/events` is populated immediately.

### Verification after build

Real requests, not assumptions: anon read of `events_public` returns published rows with no organizer or attendee data; anon read of `event_registrations` is denied; RSVP succeeds once and the duplicate is refused; a guest RSVP to an event with `guest_registration_allowed = false` is refused by the trigger; a capacity-1 event refuses the second RSVP. Then a browser pass over `/events`, `/de/events`, an event detail page, and the staff Events screen.
