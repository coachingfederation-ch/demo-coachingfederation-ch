-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE public.event_location_mode AS ENUM ('in_person', 'online', 'hybrid');
CREATE TYPE public.event_registration_mode AS ENUM ('none', 'rsvp');
CREATE TYPE public.event_registration_status AS ENUM ('confirmed', 'cancelled');

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  description text,
  language public.article_lang NOT NULL DEFAULT 'en',
  image_url text,
  image_credit_name text,
  image_credit_url text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  timezone text NOT NULL DEFAULT 'Europe/Zurich',
  location_mode public.event_location_mode NOT NULL DEFAULT 'in_person',
  venue_name text,
  city text,
  online_url text,
  status public.event_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  is_featured boolean NOT NULL DEFAULT false,
  registration_mode public.event_registration_mode NOT NULL DEFAULT 'rsvp',
  capacity integer,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  guest_registration_allowed boolean NOT NULL DEFAULT true,
  -- NULL means chapter-owned: managed by editors/admins, no individual owner.
  organizer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  content_updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_capacity_positive CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT events_slug_shape CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX events_status_starts_at_idx ON public.events (status, starts_at DESC);
CREATE INDEX events_organizer_idx ON public.events (organizer_id);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published events"
  ON public.events FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "organizers read own events"
  ON public.events FOR SELECT TO authenticated
  USING (organizer_id = auth.uid() AND private.has_role(auth.uid(), 'organizer'));

CREATE POLICY "organizers insert own events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid() AND private.has_role(auth.uid(), 'organizer'));

CREATE POLICY "organizers update own events"
  ON public.events FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() AND private.has_role(auth.uid(), 'organizer'))
  WITH CHECK (organizer_id = auth.uid() AND private.has_role(auth.uid(), 'organizer'));

CREATE POLICY "organizers delete own events"
  ON public.events FOR DELETE TO authenticated
  USING (organizer_id = auth.uid() AND private.has_role(auth.uid(), 'organizer'));

CREATE POLICY "editors manage all events"
  ON public.events FOR ALL TO authenticated
  USING (private.is_editor(auth.uid()))
  WITH CHECK (private.is_editor(auth.uid()));

-- ---------------------------------------------------------------------------
-- event_registrations
-- ---------------------------------------------------------------------------
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  -- NULL means a guest registration (no account).
  user_id uuid,
  email text NOT NULL,
  full_name text NOT NULL,
  status public.event_registration_status NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_registrations_email_shape CHECK (position('@' in email) > 1)
);

-- Partial: a cancelled registration must not block signing up again.
CREATE UNIQUE INDEX event_registrations_unique_email
  ON public.event_registrations (event_id, lower(email))
  WHERE status <> 'cancelled';
CREATE UNIQUE INDEX event_registrations_unique_user
  ON public.event_registrations (event_id, user_id)
  WHERE user_id IS NOT NULL AND status <> 'cancelled';
CREATE INDEX event_registrations_event_idx ON public.event_registrations (event_id);

-- Anonymous visitors may submit a registration but can never read one.
GRANT INSERT ON public.event_registrations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Helpers (private schema: not reachable as PostgREST RPC)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.event_is_managed_by(_event_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT private.is_editor(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = _event_id
          AND e.organizer_id = _user_id
          AND private.has_role(_user_id, 'organizer')
      )
$$;

-- The public view must expose a seat count, but anon has no read on
-- registrations. Security definer keeps the count without the rows, exactly as
-- private.directory_contact_email does for the coach directory.
CREATE OR REPLACE FUNCTION private.event_confirmed_count(_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int
  FROM public.event_registrations r
  WHERE r.event_id = _event_id AND r.status = 'confirmed'
$$;

REVOKE ALL ON FUNCTION private.event_is_managed_by(uuid, uuid) FROM public;
REVOKE ALL ON FUNCTION private.event_confirmed_count(uuid) FROM public;
GRANT EXECUTE ON FUNCTION private.event_is_managed_by(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.event_confirmed_count(uuid) TO anon, authenticated, service_role;

-- Registration policies (depend on the helper above)
CREATE POLICY "guests submit registrations"
  ON public.event_registrations FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND status = 'confirmed');

CREATE POLICY "signed-in submit own registrations"
  ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'confirmed');

CREATE POLICY "read own registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cancel own registrations"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "managers read event registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (private.event_is_managed_by(event_id, auth.uid()));

CREATE POLICY "managers update event registrations"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (private.event_is_managed_by(event_id, auth.uid()))
  WITH CHECK (private.event_is_managed_by(event_id, auth.uid()));

-- ---------------------------------------------------------------------------
-- Triggers: the actual enforcement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_events_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF TG_OP = 'UPDATE' AND (
       NEW.title IS DISTINCT FROM OLD.title
    OR NEW.summary IS DISTINCT FROM OLD.summary
    OR NEW.description IS DISTINCT FROM OLD.description
  ) THEN
    NEW.content_updated_at = now();
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER tg_events_touch_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.tg_events_touch_updated_at();

CREATE OR REPLACE FUNCTION public.tg_events_publish_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF coalesce(btrim(NEW.title), '') = '' THEN
      RAISE EXCEPTION 'a published event needs a title';
    END IF;
    IF coalesce(btrim(NEW.slug), '') = '' THEN
      RAISE EXCEPTION 'a published event needs a slug';
    END IF;
    IF NEW.starts_at IS NULL THEN
      RAISE EXCEPTION 'a published event needs a start time';
    END IF;
    NEW.published_at = coalesce(NEW.published_at, now());
  END IF;
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NEW.starts_at THEN
    RAISE EXCEPTION 'an event cannot end before it starts';
  END IF;
  IF NEW.registration_closes_at IS NOT NULL
     AND NEW.registration_opens_at IS NOT NULL
     AND NEW.registration_closes_at < NEW.registration_opens_at THEN
    RAISE EXCEPTION 'registration cannot close before it opens';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER tg_events_publish_guard
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.tg_events_publish_guard();

-- Every RSVP rule lives here, so the member area, the public page and staff
-- tooling are all bound by the same answer. Security definer because an
-- anonymous inserter cannot read the seat count itself.
CREATE OR REPLACE FUNCTION public.tg_event_registration_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev public.events%ROWTYPE;
  taken integer;
BEGIN
  NEW.email = lower(btrim(NEW.email));
  NEW.updated_at = now();

  -- Cancelling never needs the gate.
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'confirmed' THEN
    RETURN NEW;
  END IF;

  -- FOR UPDATE serialises concurrent RSVPs on the same event, so the last
  -- seat cannot be handed out twice.
  SELECT * INTO ev FROM public.events WHERE id = NEW.event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'event not found';
  END IF;

  IF ev.status <> 'published' THEN
    RAISE EXCEPTION 'event is not open for registration';
  END IF;
  IF ev.registration_mode = 'none' THEN
    RAISE EXCEPTION 'this event does not take registrations';
  END IF;
  IF ev.registration_opens_at IS NOT NULL AND now() < ev.registration_opens_at THEN
    RAISE EXCEPTION 'registration has not opened yet';
  END IF;
  IF ev.registration_closes_at IS NOT NULL AND now() > ev.registration_closes_at THEN
    RAISE EXCEPTION 'registration has closed';
  END IF;
  IF ev.registration_closes_at IS NULL AND now() > coalesce(ev.ends_at, ev.starts_at) THEN
    RAISE EXCEPTION 'registration has closed';
  END IF;
  IF NEW.user_id IS NULL AND NOT ev.guest_registration_allowed THEN
    RAISE EXCEPTION 'this event requires an account to register';
  END IF;

  IF ev.capacity IS NOT NULL THEN
    SELECT count(*) INTO taken
    FROM public.event_registrations r
    WHERE r.event_id = NEW.event_id
      AND r.status = 'confirmed'
      AND (TG_OP = 'INSERT' OR r.id <> NEW.id);
    IF taken >= ev.capacity THEN
      RAISE EXCEPTION 'event is full';
    END IF;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER tg_event_registration_guard
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_registration_guard();

-- ---------------------------------------------------------------------------
-- events_public: the read boundary for every public page
-- ---------------------------------------------------------------------------
CREATE VIEW public.events_public
WITH (security_invoker = on) AS
  SELECT
    e.id,
    e.slug,
    e.title,
    e.summary,
    e.description,
    e.language,
    e.image_url,
    e.image_credit_name,
    e.image_credit_url,
    e.starts_at,
    e.ends_at,
    e.timezone,
    e.location_mode,
    e.venue_name,
    e.city,
    e.online_url,
    e.is_featured,
    e.registration_mode,
    e.capacity,
    e.guest_registration_allowed,
    e.registration_opens_at,
    e.registration_closes_at,
    private.event_confirmed_count(e.id) AS registration_count,
    CASE
      WHEN e.capacity IS NULL THEN NULL
      ELSE greatest(e.capacity - private.event_confirmed_count(e.id), 0)
    END AS seats_remaining,
    (e.capacity IS NOT NULL AND private.event_confirmed_count(e.id) >= e.capacity) AS is_full,
    (
      e.registration_mode = 'rsvp'
      AND (e.registration_opens_at IS NULL OR now() >= e.registration_opens_at)
      AND (
        CASE
          WHEN e.registration_closes_at IS NOT NULL THEN now() <= e.registration_closes_at
          ELSE now() <= coalesce(e.ends_at, e.starts_at)
        END
      )
      AND (e.capacity IS NULL OR private.event_confirmed_count(e.id) < e.capacity)
    ) AS registration_open,
    e.published_at,
    e.updated_at
  FROM public.events e
  WHERE e.status = 'published';

GRANT SELECT ON public.events_public TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- The organizer role: additive, and only on a claim-linked member account,
-- exactly like editor.
-- ---------------------------------------------------------------------------
CREATE POLICY "admins grant organizer"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    private.has_role(auth.uid(), 'admin')
    AND role = 'organizer'
    AND private.has_role(user_id, 'member')
  );

CREATE POLICY "admins revoke organizer"
  ON public.user_roles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') AND role = 'organizer');

-- ---------------------------------------------------------------------------
-- Seed: the events the page currently hard-codes, as real chapter-owned rows.
-- ---------------------------------------------------------------------------
INSERT INTO public.events
  (slug, title, summary, description, language, starts_at, ends_at, location_mode, venue_name, city, status, is_featured, capacity, guest_registration_allowed)
VALUES
  ('coaching-perspectives-conference-2026',
   'Coaching Perspectives Conference 2026',
   'A full-day gathering of coaches, leaders and researchers exploring the future of professional coaching in Switzerland.',
   'Our flagship annual conference brings the Swiss coaching community together for a full day of keynotes, practice labs and peer conversation. Expect research-backed sessions on where the profession is heading, hands-on skills work, and plenty of unhurried time to meet colleagues from every language region.',
   'en', '2026-09-17 09:00+02', '2026-09-17 17:30+02', 'in_person', 'Kongresshaus', 'Zürich', 'published', true, 180, true),
  ('ai-and-coaching-what-stays-human',
   'AI & Coaching: What Stays Human?',
   'A live webinar on where artificial intelligence helps a coaching practice, and where presence cannot be delegated.',
   'Coaching tools are changing quickly. This webinar looks honestly at what AI does well in a coaching practice — preparation, admin, pattern spotting — and at the parts of the work that depend on being a human in the room. Bring questions; the second half is open discussion.',
   'en', '2026-10-06 18:00+02', '2026-10-06 19:30+02', 'online', NULL, 'Online', 'published', false, NULL, true),
  ('soiree-coaching-culture-de-coaching',
   'Soirée Coaching: Bâtir une culture de coaching',
   'Une soirée en français consacrée à la construction d''une culture de coaching durable en entreprise.',
   'Rencontre en français pour les coachs de Romandie et les responsables RH intéressés par le coaching interne. Présentation courte, puis échange en petits groupes autour de cas concrets rencontrés dans les organisations suisses.',
   'fr', '2026-11-12 18:30+01', '2026-11-12 21:00+01', 'in_person', 'Maison de la Communication', 'Lausanne', 'published', false, 60, true),
  ('coaching-e-leadership-consapevole',
   'Coaching e leadership consapevole',
   'Un incontro in italiano su coaching, consapevolezza e leadership nella Svizzera italiana.',
   'Serata della community ticinese dedicata alla leadership consapevole. Un intervento introduttivo seguito da esercizi pratici a coppie e da un momento di networking informale.',
   'it', '2026-11-25 18:30+01', '2026-11-25 20:30+01', 'in_person', 'Villa Negroni', 'Lugano', 'published', false, 40, true),
  ('mentor-coaching-circle-dec-2026',
   'Mentor Coaching Circle',
   'A small-group mentor coaching session for coaches working towards ACC or PCC renewal.',
   'A facilitated mentor coaching circle for members preparing an ACC or PCC application. Places are deliberately limited so every participant gets live observation and feedback against the ICF core competencies.',
   'en', '2026-12-10 12:00+01', '2026-12-10 14:00+01', 'online', NULL, 'Online', 'published', false, 10, false),
  ('new-year-kickoff-coaching-2027',
   'New Year Kickoff: Coaching in 2027',
   'Start the year with the Swiss coaching community: a look ahead, and a long evening of conversation.',
   'Our traditional new-year gathering. A short look at what the chapter has planned for 2027, followed by an open evening of conversation with colleagues from across the country.',
   'en', '2027-01-20 18:00+01', '2027-01-20 21:00+01', 'hybrid', 'Impact Hub', 'Zürich', 'published', false, 120, true);