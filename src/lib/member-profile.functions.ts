/**
 * Member Area RPC surface. Every call is authenticated; the member record is
 * resolved from the bearer token's user id, so no caller can address someone
 * else's profile.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const linkSchema = z.object({
  link_type: z.enum(["website", "linkedin", "other"]),
  label: z.string().max(80).nullish(),
  url: z.string().url().max(250).startsWith("https://"),
});

const updateSchema = z.object({
  tagline: z.string().max(160).nullish(),
  description: z.string().max(3000).nullish(),
  availability_slug: z.string().max(60).nullish(),
  coaching_available: z.boolean().optional(),
  mentoring_available: z.boolean().optional(),
  supervision_available: z.boolean().optional(),
  visibility: z.enum(["draft", "published"]).optional(),
  profile_image_path: z.string().max(300).nullish(),
  region_ids: z.array(z.string().uuid()).max(40).optional(),
  language_ids: z.array(z.string().uuid()).max(40).optional(),
  format_ids: z.array(z.string().uuid()).max(40).optional(),
  specialisation_ids: z.array(z.string().uuid()).max(40).optional(),
  links: z.array(linkSchema).max(6).optional(),
});

export const getMyMemberProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadMyMemberProfile } = await import("./member-profile.server");
    return await loadMyMemberProfile(context.userId);
  });

export const saveMyMemberProfile = createServerFn({ method: "POST" })
  .inputValidator((input) => updateSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { updateMyMemberProfile } = await import("./member-profile.server");
    return await updateMyMemberProfile(context.userId, data as never);
  });
