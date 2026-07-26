import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), locale: z.enum(["en", "de", "fr", "it"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabasePublic = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row, error } = await supabasePublic
      .from("articles")
      .select(
        "id, title, excerpt, content, category, category_id, featured_image_url, published_at, language, category_ref:categories(id, slug, name, name_de, name_fr, name_it), author:profiles(first_name, last_name), translations:article_translations(locale, title, excerpt, content)",
      )
      .eq("id", data.id)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const { translations, ...article } = row as typeof row & {
      translations?: { locale: string; title: string; excerpt: string; content: string | null }[] | null;
    };
    const available = [article.language, ...(translations ?? []).map((tr) => tr.locale)];

    if (article.language === data.locale) {
      return { ...article, resolvedLocale: article.language, available };
    }
    const match = (translations ?? []).find((tr) => tr.locale === data.locale);
    if (!match) {
      return { ...article, resolvedLocale: article.language, available };
    }
    return {
      ...article,
      title: match.title,
      excerpt: match.excerpt,
      content: match.content ?? article.content,
      resolvedLocale: data.locale,
      available,
    };
  });