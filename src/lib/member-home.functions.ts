/**
 * Member Area landing read path. Authenticated by definition — everything it
 * returns is scoped to the caller's own member record.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Locale } from "@/i18n/config";
import type { MemberHomeData } from "./member-home.server";

const schema = z.object({ locale: z.enum(["en", "de", "fr", "it"]).optional() });

export const getMemberHome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input ?? {}))
  .handler(async ({ context, data }): Promise<MemberHomeData | null> => {
    const { loadMemberHome } = await import("./member-home.server");
    return loadMemberHome(context.userId, (data.locale ?? "en") as Locale);
  });
