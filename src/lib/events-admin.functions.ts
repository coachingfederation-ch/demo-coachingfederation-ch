/**
 * Staff event management.
 *
 * Every write runs through `context.supabase` — the caller's own RLS-scoped
 * client — so "organizers touch only their own events, editors touch all" is
 * decided by the database policies, not by this file. `assertOrganizer` is
 * only a fast, legible fail for accounts with no event rights at all.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertOrganizer } from "./authz";

const LIST_COLUMNS =
  "id, slug, title, summary, language, status, starts_at, ends_at, timezone, location_mode, venue_name, city, capacity, is_featured, organizer_id, updated_at";

const EDIT_COLUMNS = `${LIST_COLUMNS}, description, image_url, image_credit_name, image_credit_url, online_url, registration_mode, registration_opens_at, registration_closes_at, guest_registration_allowed, published_at`;

const eventInput = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  summary: z.string().trim().max(400).nullable().optional(),
  description: z.string().trim().max(20000).nullable().optional(),
  language: z.enum(["en", "de", "fr", "it"]),
  starts_at: z.string().min(1),
  ends_at: z.string().min(1).nullable().optional(),
  timezone: z.string().min(1).max(60).default("Europe/Zurich"),
  location_mode: z.enum(["in_person", "online", "hybrid"]),
  venue_name: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  online_url: z.string().trim().url().max(500).nullable().optional().or(z.literal("")),
  image_url: z.string().trim().url().max(1000).nullable().optional().or(z.literal("")),
  capacity: z.number().int().positive().max(100000).nullable().optional(),
  registration_mode: z.enum(["none", "rsvp"]),
  registration_opens_at: z.string().min(1).nullable().optional(),
  registration_closes_at: z.string().min(1).nullable().optional(),
  guest_registration_allowed: z.boolean(),
  is_featured: z.boolean(),
});

/** Empty strings from the form mean "unset", not "the empty string". */
function normalize(input: z.infer<typeof eventInput>) {
  const blankToNull = <T,>(v: T | "" | null | undefined) => (v === "" || v === undefined ? null : v);
  return {
    ...input,
    summary: blankToNull(input.summary),
    description: blankToNull(input.description),
    ends_at: blankToNull(input.ends_at),
    venue_name: blankToNull(input.venue_name),
    city: blankToNull(input.city),
    online_url: blankToNull(input.online_url),
    image_url: blankToNull(input.image_url),
    capacity: input.capacity ?? null,
    registration_opens_at: blankToNull(input.registration_opens_at),
    registration_closes_at: blankToNull(input.registration_closes_at),
  };
}

/** Events the caller may manage (RLS narrows organizers to their own). */
export const listManagedEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertOrganizer(context);
    const { data, error } = await context.supabase
      .from("events")
      .select(LIST_COLUMNS)
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getManagedEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertOrganizer(context);
    const { data: row, error } = await context.supabase
      .from("events")
      .select(EDIT_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ?? null;
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => eventInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertOrganizer(context);
    const { data: row, error } = await context.supabase
      .from("events")
      // Ownership comes from the session, never from the request body.
      .insert({ ...normalize(data), organizer_id: context.userId, status: "draft" })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("That web address (slug) is already taken.");
      throw new Error(error.message);
    }
    return { id: row.id as string };
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    eventInput.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertOrganizer(context);
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("events")
      .update(normalize(rest as z.infer<typeof eventInput>))
      .eq("id", id);
    if (error) {
      if (error.code === "23505") throw new Error("That web address (slug) is already taken.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

/** Publish / unpublish / cancel. `published_at` is stamped once, on first publish. */
export const setEventStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "published", "cancelled", "archived"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertOrganizer(context);
    const patch: { status: typeof data.status; published_at?: string } = { status: data.status };
    if (data.status === "published") {
      const { data: existing } = await context.supabase
        .from("events")
        .select("published_at")
        .eq("id", data.id)
        .maybeSingle();
      if (!existing?.published_at) patch.published_at = new Date().toISOString();
    }
    const { error } = await context.supabase.from("events").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** The attendee list for one event. RLS restricts this to the event's managers. */
export const listEventRegistrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ eventId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertOrganizer(context);
    const { data: rows, error } = await context.supabase
      .from("event_registrations")
      .select("id, full_name, email, status, notes, created_at, user_id")
      .eq("event_id", data.eventId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        registrationId: z.string().uuid(),
        status: z.enum(["confirmed", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertOrganizer(context);
    const { error } = await context.supabase
      .from("event_registrations")
      .update({ status: data.status })
      .eq("id", data.registrationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });