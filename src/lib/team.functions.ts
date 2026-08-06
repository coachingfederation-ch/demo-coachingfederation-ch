/**
 * Public team page read path.
 *
 * All the work happens in `team.server.ts`, which reads only the
 * `team_directory_public` / `team_projects_public` views — those are the
 * safety boundary (no phone, no membership dates, email only on opt-in).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import type { TeamDirectory } from "./team";

const localeSchema = z.enum(["en", "de", "fr", "it"]);

export const listTeamDirectory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ locale: localeSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<TeamDirectory> => {
    const { loadPublicProjects, loadTeamMembers, usedProjects } = await import("./team.server");
    const locale = (data.locale ?? "en") as Locale;
    const [projectRows, members] = await Promise.all([
      loadPublicProjects(),
      loadTeamMembers(locale),
    ]);
    return { projects: usedProjects(projectRows, members, locale), members };
  });
