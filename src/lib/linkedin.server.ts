/**
 * Server-only logic for sharing a published article on the chapter's LinkedIn
 * company page.
 *
 * Everything here runs behind the publisher gate in `linkedin.functions.ts`.
 * LinkedIn is reached through the Lovable connector gateway, which injects the
 * OAuth token for the connected company page — this module never sees or
 * stores a LinkedIn access token. Post records are written with the admin
 * client because `article_linkedin_posts` is deliberately read-only over the
 * Data API: an audit trail must not be editable by the account that triggered
 * the post.
 */
import { SITE_URL, localizePath, isLocale, type Locale } from "@/i18n/config";
import { linkedInPostUrl, type LinkedInImageMode, type LinkedInPostRecord } from "./linkedin";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/linkedin";
/** Pinned LinkedIn REST version; bump deliberately, never implicitly. */
const LINKEDIN_VERSION = "202506";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  status: string;
  featured_image_url: string | null;
};

/** Canonical public URL of an article in its own language. */
export function canonicalArticleUrl(id: string, language: string) {
  const locale = (isLocale(language) ? language : "en") as Locale;
  return `${SITE_URL}${localizePath(`/insights/${id}`, locale)}`;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Loads the article, refusing anything that is not publicly published. */
export async function loadPublishedArticle(id: string): Promise<Article> {
  const db = await admin();
  const { data, error } = await db
    .from("articles")
    .select("id, title, excerpt, content, language, status, featured_image_url")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Article not found");
  if (data.status !== "published")
    throw new Error("Only a published article can be shared on LinkedIn");
  return data as Article;
}

/** Newest posting attempt for an article, or null when it was never shared. */
export async function latestLinkedInPost(articleId: string): Promise<LinkedInPostRecord | null> {
  const db = await admin();
  const { data, error } = await db
    .from("article_linkedin_posts")
    .select(
      "id, status, linkedin_post_urn, linkedin_post_url, posted_at, commentary, image_mode, error_message, created_at",
    )
    .eq("article_id", articleId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as LinkedInPostRecord | null) ?? null;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "Swiss Standard German (no ß, use ss)",
  fr: "Swiss French",
  it: "Swiss Italian",
};

/**
 * Drafts LinkedIn commentary from the article. A model failure is not fatal:
 * the publisher edits the text anyway, so we fall back to title + excerpt
 * rather than blocking the dialog.
 */
export async function draftCommentary(article: Article, url: string): Promise<string> {
  const fallback = `${article.title}\n\n${article.excerpt}\n\n${url}`;
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallback;

  const prompt = [
    `Write a LinkedIn post in ${LANGUAGE_NAMES[article.language] ?? "English"} for The Switzerland Chapter of ICF.`,
    "Structure: one short hook line, then two or three short lines of substance, then a closing invitation to read the article.",
    "Warm, professional, specific. No emoji spam (at most one). No invented statistics or claims.",
    "End with at most three relevant hashtags on their own line.",
    "Do not include the article link — it is appended separately. Reply with the post text only, no quotes, no markdown.",
    "",
    `TITLE: ${article.title}`,
    `EXCERPT: ${article.excerpt}`,
    `ARTICLE: ${article.content.slice(0, 6000)}`,
  ].join("\n");

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content: "You write concise, human LinkedIn posts for a professional coaching body.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) return fallback;
    return `${text}\n\n${url}`;
  } catch {
    return fallback;
  }
}

/** Gateway credentials, or null when the LinkedIn connector is not linked yet. */
function gatewayAuth(): { lovableKey: string; connectionKey: string } | null {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["LINKEDIN_API_KEY"];
  if (!lovableKey || !connectionKey) return null;
  return { lovableKey, connectionKey };
}

/** True when the app can actually reach LinkedIn (connector linked + page set). */
export async function linkedInReadiness() {
  const db = await admin();
  const { data } = await db
    .from("linkedin_config")
    .select("organization_urn, organization_name")
    .maybeSingle();
  return {
    connected: !!gatewayAuth(),
    organizationUrn: (data?.organization_urn as string | null) ?? null,
    organizationName: (data?.organization_name as string | null) ?? null,
  };
}

/** LinkedIn error bodies carry the real reason; never swallow them. */
async function failOn(response: Response, step: string): Promise<never> {
  const body = await response.text();
  console.error(`LinkedIn ${step} failed [${response.status}]: ${body}`);
  throw new Error(`LinkedIn ${step} failed (${response.status}): ${body.slice(0, 400)}`);
}

function headers(auth: { lovableKey: string; connectionKey: string }, json = true) {
  const h: Record<string, string> = {
    Authorization: `Bearer ${auth.lovableKey}`,
    "X-Connection-Api-Key": auth.connectionKey,
    "LinkedIn-Version": LINKEDIN_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

/**
 * Uploads the branded PNG and creates the post. Returns the share URN.
 * The upload URL LinkedIn hands back is on its own host but still needs the
 * connection's OAuth token, so it is replayed through the gateway by path.
 */
async function createOrganizationPost(input: {
  organizationUrn: string;
  commentary: string;
  imageBytes: Uint8Array;
  altText: string;
}): Promise<string> {
  const auth = gatewayAuth();
  if (!auth) throw new Error("LinkedIn is not connected yet");

  const init = await fetch(`${GATEWAY_URL}/rest/images?action=initializeUpload`, {
    method: "POST",
    headers: headers(auth),
    body: JSON.stringify({ initializeUploadRequest: { owner: input.organizationUrn } }),
  });
  if (!init.ok) await failOn(init, "image upload initialisation");
  const initBody = (await init.json()) as {
    value?: { uploadUrl?: string; image?: string };
  };
  const uploadUrl = initBody.value?.uploadUrl;
  const imageUrn = initBody.value?.image;
  if (!uploadUrl || !imageUrn) throw new Error("LinkedIn did not return an upload target");

  const uploadPath = new URL(uploadUrl);
  const upload = await fetch(`${GATEWAY_URL}${uploadPath.pathname}${uploadPath.search}`, {
    method: "PUT",
    headers: { ...headers(auth, false), "Content-Type": "image/png" },
    body: imageBody(input.imageBytes),
  });
  if (!upload.ok) await failOn(upload, "image upload");

  const post = await fetch(`${GATEWAY_URL}/rest/posts`, {
    method: "POST",
    headers: headers(auth),
    body: JSON.stringify({
      author: input.organizationUrn,
      commentary: input.commentary,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: { media: { id: imageUrn, altText: input.altText.slice(0, 300) } },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!post.ok) await failOn(post, "post creation");

  const urn = post.headers.get("x-restli-id") ?? post.headers.get("x-linkedin-id");
  if (urn) return urn;
  const created = (await post.json().catch(() => ({}))) as { id?: string };
  if (created.id) return created.id;
  throw new Error("LinkedIn accepted the post but returned no id");
}

/** Workers accept a plain ArrayBuffer body; keep the conversion in one place. */
function imageBody(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/**
 * Posts an article to LinkedIn and records the attempt. A failure is recorded
 * as a `failed` row and re-thrown so the publisher sees LinkedIn's own reason.
 */
export async function postArticle(input: {
  articleId: string;
  commentary: string;
  imageMode: LinkedInImageMode;
  imageBase64: string;
  userId: string;
}): Promise<LinkedInPostRecord> {
  const db = await admin();
  const article = await loadPublishedArticle(input.articleId);
  const readiness = await linkedInReadiness();
  if (!readiness.connected)
    throw new Error("LinkedIn is not connected yet — link the LinkedIn connector first.");
  if (!readiness.organizationUrn)
    throw new Error("No LinkedIn company page is configured for the chapter yet.");

  const bytes = decodeBase64(input.imageBase64);

  const { data: row, error: insertError } = await db
    .from("article_linkedin_posts")
    .insert({
      article_id: article.id,
      status: "pending",
      commentary: input.commentary,
      image_mode: input.imageMode,
      created_by: input.userId,
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);

  try {
    const urn = await createOrganizationPost({
      organizationUrn: readiness.organizationUrn,
      commentary: input.commentary,
      imageBytes: bytes,
      altText: article.title,
    });
    const { data: updated, error } = await db
      .from("article_linkedin_posts")
      .update({
        status: "posted",
        linkedin_post_urn: urn,
        linkedin_post_url: linkedInPostUrl(urn),
        posted_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .select(
        "id, status, linkedin_post_urn, linkedin_post_url, posted_at, commentary, image_mode, error_message, created_at",
      )
      .single();
    if (error) throw new Error(error.message);
    return updated as LinkedInPostRecord;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown LinkedIn error";
    await db
      .from("article_linkedin_posts")
      .update({ status: "failed", error_message: message.slice(0, 2000) })
      .eq("id", row.id);
    throw new Error(message);
  }
}

/** Decodes the browser-rendered PNG. `atob` exists in the Worker runtime. */
function decodeBase64(value: string): Uint8Array {
  const clean = value.includes(",") ? value.slice(value.indexOf(",") + 1) : value;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Persists the chapter's LinkedIn company page. Admin-gated by the caller. */
export async function saveLinkedInPage(urn: string | null, name: string | null) {
  const db = await admin();
  const { error } = await db
    .from("linkedin_config")
    .update({ organization_urn: urn, organization_name: name })
    .eq("id", true);
  if (error) throw new Error(error.message);
  return linkedInReadiness();
}
