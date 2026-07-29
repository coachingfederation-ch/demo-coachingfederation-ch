import { createFileRoute, Link } from "@tanstack/react-router";
import { requireStaffAccess, ARTICLE_ROLES } from "@/lib/staff-guard";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Shell } from "@/components/cms/Shell";
import { useCms } from "@/i18n/cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_staff/articles/")({
  beforeLoad: ({ context }) => requireStaffAccess(context.queryClient, ARTICLE_ROLES),
  head: () => ({
    meta: [
      { title: "Articles — The Switzerland Chapter of ICF Insights CMS" },
      {
        name: "description",
        content:
          "Editorial workspace for The Switzerland Chapter of ICF: draft, schedule and publish Insights articles.",
      },
      { property: "og:title", content: "Articles — The Switzerland Chapter of ICF Insights CMS" },
      {
        property: "og:description",
        content:
          "Editorial workspace for The Switzerland Chapter of ICF: draft, schedule and publish Insights articles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArticlesPage,
});

type Status = "draft" | "scheduled" | "published" | "unpublished";
type Lang = "en" | "fr" | "de" | "it";

interface Row {
  id: string;
  title: string;
  language: Lang;
  status: Status;
  updated_at: string;
  translations?: { locale: string }[] | null;
}

const filters = ["All", "Drafts", "Scheduled", "Published", "Unpublished"] as const;
type Filter = (typeof filters)[number];

function StatusPill({ status, t }: { status: Status; t: (k: string) => string }) {
  const map: Record<Status, { bg: string; dot: string; label: string }> = {
    draft: {
      bg: "bg-warn-soft text-[color:var(--warn)]",
      dot: "var(--warn)",
      label: t("status.draft"),
    },
    scheduled: {
      bg: "bg-teal-soft text-teal-foreground",
      dot: "var(--teal)",
      label: t("status.scheduled"),
    },
    published: {
      bg: "bg-teal-soft text-teal-foreground",
      dot: "var(--teal)",
      label: t("status.published"),
    },
    unpublished: {
      bg: "bg-secondary text-muted-foreground",
      dot: "var(--muted-foreground)",
      label: t("status.unpublished"),
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function LangChip({ code }: { code: Lang }) {
  return (
    <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-md bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
      {code.toUpperCase()}
    </span>
  );
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  if (diff < day && d.getDate() === new Date().getDate()) return "Today";
  if (diff < 2 * day) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function ArticlesPage() {
  const { t } = useCms();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, language, status, updated_at, translations:article_translations(locale)")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const byStatus =
      filter === "All"
        ? rows
        : rows.filter((r) => r.status === filter.toLowerCase().replace(/s$/, ""));
    const needle = q.trim().toLowerCase();
    return needle ? byStatus.filter((r) => r.title.toLowerCase().includes(needle)) : byStatus;
  }, [rows, filter, q]);

  const counts = useMemo(() => {
    if (!rows) return { total: 0, drafts: 0, scheduled: 0 };
    return {
      total: rows.length,
      drafts: rows.filter((r) => r.status === "draft").length,
      scheduled: rows.filter((r) => r.status === "scheduled").length,
    };
  }, [rows]);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-10 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("list.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {counts.total} article{counts.total === 1 ? "" : "s"} · {counts.drafts} draft
              {counts.drafts === 1 ? "" : "s"} · {counts.scheduled} scheduled
            </p>
          </div>
          <Link
            to="/articles/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            {t("list.new")}
          </Link>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder={t("list.search")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition " +
                  (filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-secondary")
                }
              >
                {t(`list.filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <div className="grid grid-cols-[minmax(0,2fr)_0.8fr_1fr_0.8fr_auto] items-center gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>{t("list.title")}</div>
            <div>{t("editor.sourceLanguage")}</div>
            <div>{t("editor.statusLabel")}</div>
            <div>{t("list.updated")}</div>
            <div className="w-4" />
          </div>
          {rows === null ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              {t("editor.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              {t("list.empty")}
            </div>
          ) : (
            filtered.map((r) => (
              <Link
                to="/articles/$id"
                params={{ id: r.id }}
                key={r.id}
                className="group grid grid-cols-[minmax(0,2fr)_0.8fr_1fr_0.8fr_auto] items-center gap-4 border-b border-border/70 px-6 py-4 text-sm transition last:border-b-0 hover:bg-secondary/60"
              >
                <div className="font-semibold text-foreground">
                  {r.title || <span className="text-muted-foreground">Untitled</span>}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <LangChip code={r.language} />
                  {(r.translations ?? []).map((tr) => (
                    <span
                      key={tr.locale}
                      className="inline-flex h-6 min-w-8 items-center justify-center rounded-md bg-secondary px-1.5 text-[11px] font-semibold text-muted-foreground"
                    >
                      {tr.locale.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div>
                  <StatusPill status={r.status} t={t} />
                </div>
                <div className="text-muted-foreground">{timeAgo(r.updated_at)}</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
