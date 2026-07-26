import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { LOCALES, localizePath, SITE_URL } from "@/i18n/config";

const PATHS = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/find-a-coach", changefreq: "weekly", priority: "0.9" },
  { path: "/for-organisations", changefreq: "monthly", priority: "0.8" },
  { path: "/for-coaches", changefreq: "monthly", priority: "0.8" },
  { path: "/insights", changefreq: "weekly", priority: "0.8" },
  { path: "/events", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
] as const;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { loc: string; changefreq?: string; priority?: string }[] = [];

        for (const locale of LOCALES) {
          for (const p of PATHS) {
            entries.push({
              loc: `${SITE_URL}${localizePath(p.path, locale)}`,
              changefreq: p.changefreq,
              priority: p.priority,
            });
          }
        }

        try {
          const supabase = createClient(
            process.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
              import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            { auth: { persistSession: false } },
          );
          const { data } = await supabase
            .from("articles")
            .select("id, language, published_at")
            .eq("status", "published");
          for (const a of data ?? []) {
            const locale = (LOCALES as readonly string[]).includes(a.language as string)
              ? (a.language as (typeof LOCALES)[number])
              : "en";
            entries.push({
              loc: `${SITE_URL}${localizePath(`/insights/${a.id}`, locale)}`,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch {
          /* articles are optional in the sitemap */
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${e.loc}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});