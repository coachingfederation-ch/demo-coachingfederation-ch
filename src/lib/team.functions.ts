/**
 * Public team page read path.
 *
 * Reads `public.team_directory_public` only — the view is the safety boundary:
 * it exposes no phone, membership dates or cst_recno, returns the contact
 * email only when the member opted in, and hands back a coach-profile id only
 * when that profile is actually published and eligible.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { initialsOf, localizedName, type TeamDirectory, type TeamMember } from "./team";
import { resolveProfileLocale } from "./member-translations";

const localeSchema = z.enum(["en", "de", "fr", "it"]);

type RawAssignment = {
  project_slug: string;
  project_name: string;
  project_name_de: string | null;
  project_name_fr: string | null;
  project_name_it: string | null;
  project_sort_order: number;
  role_name: string;
  role_name_de: string | null;
  role_name_fr: string | null;
  role_name_it: string | null;
  sort_order: number;
};

export const listTeamDirectory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ locale: localeSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<TeamDirectory> => {
    const { publicSupabaseClient } = await import("./supabase-public.server");
    const { signProfileImages } = await import("./storage.server");
    const supabasePublic = publicSupabaseClient();
    const locale = (data.locale ?? "en") as Locale;

    const [{ data: projectRows }, { data: memberRows, error }] = await Promise.all([
      supabasePublic
        .from("team_projects_public")
        .select("slug, name, name_de, name_fr, name_it, sort_order")
        .order("sort_order", { ascending: true }),
      supabasePublic
        .from("team_directory_public")
        .select("*")
        .order("primary_sort_order", { ascending: true })
        .order("full_name", { ascending: true }),
    ]);
    if (error) throw error;

    const rows = (memberRows ?? []) as Record<string, unknown>[];
    const signed = await signProfileImages(
      rows
        .map((r) => r.profile_image_path as string | null)
        .filter((p): p is string => typeof p === "string" && !!p),
    );

    const members: TeamMember[] = rows.map((row) => {
      const localized = resolveProfileLocale(
        row as never,
        locale,
      ) as unknown as Record<string, unknown>;
      const name = (row.full_name as string | null) ?? "";
      const path = row.profile_image_path as string | null;
      const assignments = ((row.assignments as RawAssignment[] | null) ?? []).map((a) => ({
        projectSlug: a.project_slug,
        project: localizedName(
          {
            name: a.project_name,
            name_de: a.project_name_de,
            name_fr: a.project_name_fr,
            name_it: a.project_name_it,
          },
          locale,
        ),
        role: localizedName(
          {
            name: a.role_name,
            name_de: a.role_name_de,
            name_fr: a.role_name_fr,
            name_it: a.role_name_it,
          },
          locale,
        ),
      }));

      return {
        memberId: row.member_id as string,
        profileId: row.profile_id as string,
        name,
        initials: initialsOf(name),
        imageUrl: path ? (signed.get(path) ?? null) : null,
        bio: (localized.team_bio as string | null) ?? null,
        linkedinUrl: (row.linkedin_url as string | null) ?? null,
        email: (row.contact_email as string | null) ?? null,
        coachProfileId: (row.public_coach_profile_id as string | null) ?? null,
        assignments,
      };
    });

    // Only projects that actually have someone in them become filter pills.
    const used = new Set(members.flatMap((m) => m.assignments.map((a) => a.projectSlug)));
    const projects = (projectRows ?? [])
      .filter((p) => used.has(p.slug as string))
      .map((p) => ({
        slug: p.slug as string,
        label: localizedName(p as never, locale),
      }));

    return { projects, members };
  });
