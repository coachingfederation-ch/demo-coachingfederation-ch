/**
 * Insights CMS write path.
 *
 * Every function here runs as the *caller*, using the RLS-scoped client the
 * auth middleware puts on the request context — never the admin client. That
 * is deliberate: the `articles` / `article_translations` policies are the real
 * boundary between contributor and editor, and routing writes through the
 * service role would silently bypass them.
 *
 * The `is_staff` assertion in `articles.functions.ts` is a coarse gate on top
 * of that (it keeps non-staff accounts from reaching the CMS surface at all);
 * RLS still decides what a given staff member may actually change.
 */
import type { ArticleRow, CategoryRow, ProfileRow } from "./articles";

type Client = {
  from: (table: string) => any;
};

/** Everything the editor screen needs for one article, in one round trip. */
export async function loadArticleEditorData(client: Client, id: string) {
  const [articleRes, categoryRes, profileRes] = await Promise.all([
    client.from("articles").select("*").eq("id", id).maybeSingle(),
    client
      .from("categories")
      .select("id, slug, name, name_de, name_fr, name_it, sort_order")
      .order("sort_order", { ascending: true }),
    client
      .from("profiles")
      .select("id, first_name, last_name")
      .order("last_name", { ascending: true }),
  ]);

  if (articleRes.error) throw articleRes.error;

  return {
    article: (articleRes.data ?? null) as ArticleRow | null,
    categories: (categoryRes.data ?? []) as CategoryRow[],
    profiles: (profileRes.data ?? []) as ProfileRow[],
  };
}

/**
 * The fields the editor autosaves. Status, scheduling and `is_featured` are
 * deliberately absent — those are explicit actions, not keystrokes.
 */
export type ArticleContentPatch = {
  title: string;
  excerpt: string;
  content: string;
  language: "en" | "de" | "fr" | "it";
  category_id: string | null;
  author_id: string;
  featured_image_url: string | null;
  image_credit_name: string | null;
  image_credit_url: string | null;
  image_source: string | null;
};

export async function saveArticleContent(
  client: Client,
  id: string,
  patch: ArticleContentPatch,
) {
  const { error } = await client.from("articles").update(patch).eq("id", id);
  if (error) throw error;
  return { ok: true as const };
}

/**
 * Status transitions. Timestamps are derived here rather than trusted from the
 * client, and `first_published_at` is write-once — it is what locks an
 * article's source language after the first publication.
 */
export type ArticleTransition =
  | { action: "publish" }
  | { action: "schedule"; scheduledAt: string }
  | { action: "unpublish" };

export type ArticleStatusPatch = {
  status: "published" | "scheduled" | "unpublished";
  published_at?: string | null;
  first_published_at?: string | null;
  scheduled_at: string | null;
};

export async function transitionArticle(
  client: Client,
  id: string,
  transition: ArticleTransition,
): Promise<ArticleStatusPatch> {
  const { data: current, error: readError } = await client
    .from("articles")
    .select("first_published_at")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw readError;
  if (!current) throw new Error("Article not found.");
  const firstPublished = (current as { first_published_at: string | null }).first_published_at;

  let patch: ArticleStatusPatch;
  if (transition.action === "publish") {
    const now = new Date().toISOString();
    patch = {
      status: "published",
      published_at: now,
      first_published_at: firstPublished ?? now,
      scheduled_at: null,
    };
  } else if (transition.action === "schedule") {
    patch = {
      status: "scheduled",
      scheduled_at: transition.scheduledAt,
      first_published_at: firstPublished ?? transition.scheduledAt,
    };
  } else {
    patch = { status: "unpublished", scheduled_at: null };
  }

  const { error } = await client.from("articles").update(patch).eq("id", id);
  if (error) throw error;
  return patch;
}

/** Only one article may be featured; a database trigger unsets the previous one. */
export async function setArticleFeatured(client: Client, id: string, featured: boolean) {
  const { error } = await client.from("articles").update({ is_featured: featured }).eq("id", id);
  if (error) throw error;
  return { is_featured: featured };
}

export async function deleteArticle(client: Client, id: string) {
  const { error } = await client.from("articles").delete().eq("id", id);
  if (error) throw error;
  return { ok: true as const };
}