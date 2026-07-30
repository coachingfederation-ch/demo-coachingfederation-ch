import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./authz";

const searchSchema = z.object({ term: z.string() });
const projectSchema = z.object({ projectId: z.string().uuid() });
const memberSchema = z.object({ memberId: z.string().uuid() });

/** Member name search for the operational-structure assignment picker. */
export const searchOpsMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => searchSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { searchOpsMembers: run } = await import("./ops-admin.server");
    return await run(data.term);
  });

/** Assignments of one project, with member names resolved server-side. */
export const listOpsAssignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => projectSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { listOpsAssignments: run } = await import("./ops-admin.server");
    return await run(data.projectId);
  });

/** Remaining assignment count for a member (drives the editor-revoke prompt). */
export const countOpsAssignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { countOpsAssignments: run } = await import("./ops-admin.server");
    return await run(data.memberId);
  });
