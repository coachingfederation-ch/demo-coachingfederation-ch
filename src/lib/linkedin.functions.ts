/**
 * RPC surface for the "Publish to LinkedIn" publisher action.
 * Exports: getLinkedInDraft, publishArticleToLinkedIn.
 * Called by components/cms/LinkedInShareCard.tsx.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertLinkedInPublisher } from "./linkedin-authz";
import { assertAdmin } from "./authz";
import { LINKEDIN_COMMENTARY_LIMIT } from "./linkedin";

const draftInput = z.object({ articleId: z.string().uuid() });

const publishInput = z.object({
  articleId: z.string().uuid(),
  commentary: z.string().min(1).max(LINKEDIN_COMMENTARY_LIMIT),
  imageMode: z.enum(["feature", "marks"]),
  /** Base64 PNG rendered in the browser from the branded card. */
  imageBase64: z.string().min(100).max(8_000_000),
});

/** Loads the article, an AI-drafted commentary and the connector readiness. */
export const getLinkedInDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => draftInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertLinkedInPublisher(context);
    const server = await import("./linkedin.server");
    const article = await server.loadPublishedArticle(data.articleId);
    const url = server.canonicalArticleUrl(article.id, article.language);
    const [commentary, readiness, latest] = await Promise.all([
      server.draftCommentary(article, url),
      server.linkedInReadiness(),
      server.latestLinkedInPost(article.id),
    ]);
    return {
      commentary,
      url,
      readiness,
      latest,
      article: {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        language: article.language,
        featured_image_url: article.featured_image_url,
      },
    };
  });

/** Posts the confirmed text and branded visual to the chapter's LinkedIn page. */
export const publishArticleToLinkedIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => publishInput.parse(data))
  .handler(async ({ data, context }) => {
    const userId = await assertLinkedInPublisher(context);
    const server = await import("./linkedin.server");
    return server.postArticle({ ...data, userId });
  });

const pageInput = z.object({
  organizationUrn: z
    .string()
    .trim()
    .max(200)
    .regex(/^$|^urn:li:organization:\d+$/, "Expected a urn:li:organization:<id> value"),
  organizationName: z.string().trim().max(200),
});

/** Reads the configured LinkedIn company page (admin settings screen). */
export const getLinkedInPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const server = await import("./linkedin.server");
    return server.linkedInReadiness();
  });

/** Sets the LinkedIn company page every article post is published to. */
export const saveLinkedInPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => pageInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const server = await import("./linkedin.server");
    return server.saveLinkedInPage(data.organizationUrn || null, data.organizationName || null);
  });
