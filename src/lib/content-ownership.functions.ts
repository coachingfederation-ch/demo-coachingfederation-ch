/**
 * Admin-only RPC surface for content ownership (see `content-ownership.server.ts`).
 * Reassignment writes run as the caller, so the `articles` / `events` RLS
 * policies remain the real write boundary.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./authz";

export const getContentOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { loadContentOwnership } = await import("./content-ownership.server");
    return await loadContentOwnership();
  });

export const reassignContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        targetProfileId: z.string().uuid(),
        articleIds: z.array(z.string().uuid()).max(500),
        eventIds: z.array(z.string().uuid()).max(500),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { reassignContentOwnership } = await import("./content-ownership.server");
    return await reassignContentOwnership(
      context.supabase,
      data.targetProfileId,
      data.articleIds,
      data.eventIds,
    );
  });