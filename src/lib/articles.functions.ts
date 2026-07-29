/**
 * Insights CMS RPC surface (staff only).
 *
 * Thin wrappers: validation, the staff gate, and a dynamic import of the
 * server-only logic. Writes run as the caller through `context.supabase`, so
 * the `articles` RLS policies remain the real write boundary — see the header
 * of `articles.server.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff as assertStaffRole } from "./authz";
import type { AuthedContext } from "./authz";

/**
 * Staff gate: admin, editor or organizer. Delegates to the shared guard and
 * hands back the caller's RLS-scoped client, which is what the handlers below
 * pass into the server-only logic.
 */
async function assertStaff(context: AuthedContext) {
  await assertStaffRole(context);
  return context.supabase;
}

const idSchema = z.object({ id: z.string().uuid() });

const contentSchema = idSchema.extend({
  title: z.string().max(300),
  excerpt: z.string().max(1000),
  content: z.string().max(200_000),
  language: z.enum(["en", "de", "fr", "it"]),
  category_id: z.string().uuid().nullable(),
  author_id: z.string().uuid(),
  featured_image_url: z.string().max(2000).nullable(),
  image_credit_name: z.string().max(200).nullable(),
  image_credit_url: z.string().max(2000).nullable(),
  image_source: z.string().max(40).nullable(),
});

const transitionSchema = z.union([
  idSchema.extend({ action: z.literal("publish") }),
  idSchema.extend({ action: z.literal("schedule"), scheduledAt: z.string().datetime() }),
  idSchema.extend({ action: z.literal("unpublish") }),
]);

export const getArticleEditorData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ context, data }) => {
    const client = await assertStaff(context);
    const { loadArticleEditorData } = await import("./articles.server");
    return await loadArticleEditorData(client, data.id);
  });

export const saveArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => contentSchema.parse(input))
  .handler(async ({ context, data }) => {
    const client = await assertStaff(context);
    const { saveArticleContent } = await import("./articles.server");
    const { id, ...patch } = data;
    return await saveArticleContent(client, id, patch);
  });

export const changeArticleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transitionSchema.parse(input))
  .handler(async ({ context, data }) => {
    const client = await assertStaff(context);
    const { transitionArticle } = await import("./articles.server");
    const { id, ...transition } = data;
    return await transitionArticle(client, id, transition as never);
  });

export const setArticleFeaturedFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.extend({ featured: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    const client = await assertStaff(context);
    const { setArticleFeatured } = await import("./articles.server");
    return await setArticleFeatured(client, data.id, data.featured);
  });

export const removeArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ context, data }) => {
    const client = await assertStaff(context);
    const { deleteArticle } = await import("./articles.server");
    return await deleteArticle(client, data.id);
  });
