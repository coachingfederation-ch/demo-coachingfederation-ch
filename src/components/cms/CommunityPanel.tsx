/**
 * Operational-structure CMS: the community-specific fields of a project.
 *
 * Communities are not a separate entity — they are `op_projects` rows flagged
 * `is_community`. This panel edits that flag plus the public-facing content
 * (markdown description, meeting cadence, contact, sign-up link, spoken
 * languages) and offers per-locale AI translation, mirroring the article and
 * event translation panels.
 *
 * Writes go through the caller's RLS-scoped client; the "admins manage
 * op_projects" policy remains the real boundary.
 */
import { useEffect, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/i18n/cms";
import { translateCommunity } from "@/lib/community-translations.functions";

const INPUT =
  "w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/20";
const TARGETS = ["de", "fr", "it"] as const;
type Target = (typeof TARGETS)[number];

export type CommunityFields = {
  id: string;
  is_community: boolean;
  is_featured_community: boolean;
  description: string | null;
  description_de: string | null;
  description_fr: string | null;
  description_it: string | null;
  cadence_note: string | null;
  cadence_note_de: string | null;
  cadence_note_fr: string | null;
  cadence_note_it: string | null;
  contact_email: string | null;
  signup_url: string | null;
  language_slugs: string[] | null;
};

export function CommunityPanel({
  project,
  onSaved,
}: {
  project: CommunityFields;
  onSaved: () => void | Promise<void>;
}) {
  const { t } = useCms();
  const [row, setRow] = useState<CommunityFields>(project);
  const [languages, setLanguages] = useState<{ slug: string; name: string }[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [regionIds, setRegionIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<Target | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setRow(project), [project]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("cf_languages")
        .select("slug, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setLanguages((data ?? []) as { slug: string; name: string }[]);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("cf_regions")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setRegions((data ?? []) as { id: string; name: string }[]);
    })();
  }, []);

  // Region links drive the "communities in your service area" block in the
  // Member Area, so they live with the rest of the community content.
  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("op_project_regions")
        .select("region_id")
        .eq("project_id", project.id);
      setRegionIds((data ?? []).map((r) => r.region_id as string));
    })();
  }, [project.id]);

  const toggleRegion = async (regionId: string) => {
    const attached = regionIds.includes(regionId);
    setRegionIds((prev) => (attached ? prev.filter((id) => id !== regionId) : [...prev, regionId]));
    const query = attached
      ? supabase
          .from("op_project_regions")
          .delete()
          .eq("project_id", project.id)
          .eq("region_id", regionId)
      : supabase.from("op_project_regions").insert({ project_id: project.id, region_id: regionId });
    const { error: err } = await query;
    if (err) setError(err.message);
  };

  const save = async (values: Partial<CommunityFields>) => {
    setRow((prev) => ({ ...prev, ...values }));
    const { error: err } = await supabase
      .from("op_projects")
      .update(values as never)
      .eq("id", project.id);
    if (err) return setError(err.message);
    setError(null);
    await onSaved();
  };

  const toggleLanguage = (slug: string) => {
    const current = row.language_slugs ?? [];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    void save({ language_slugs: next });
  };

  const translate = async (locale: Target) => {
    setBusy(locale);
    setError(null);
    try {
      await translateCommunity({ data: { projectId: project.id, locale } });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const localeField = (field: "description" | "cadence_note", locale: Target) =>
    `${field}_${locale}` as keyof CommunityFields;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-bold">{t("ops.community.title")}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("ops.community.note")}</p>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={row.is_community}
            onChange={(e) => void save({ is_community: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("ops.community.isCommunity")}
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            disabled={!row.is_community}
            checked={row.is_featured_community}
            onChange={(e) => void save({ is_featured_community: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("ops.community.featured")}
        </label>
      </div>

      {row.is_community ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs font-semibold text-muted-foreground">
              {t("ops.community.cadence")}
              <input
                value={row.cadence_note ?? ""}
                onChange={(e) => setRow((p) => ({ ...p, cadence_note: e.target.value }))}
                onBlur={(e) => void save({ cadence_note: e.target.value || null })}
                className={INPUT + " mt-1 font-normal"}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              {t("ops.community.contactEmail")}
              <input
                type="email"
                value={row.contact_email ?? ""}
                onChange={(e) => setRow((p) => ({ ...p, contact_email: e.target.value }))}
                onBlur={(e) => void save({ contact_email: e.target.value || null })}
                className={INPUT + " mt-1 font-normal"}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
              {t("ops.community.signupUrl")}
              <input
                type="url"
                value={row.signup_url ?? ""}
                onChange={(e) => setRow((p) => ({ ...p, signup_url: e.target.value }))}
                onBlur={(e) => void save({ signup_url: e.target.value || null })}
                className={INPUT + " mt-1 font-normal"}
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-muted-foreground">
            {t("ops.community.description")}
            <textarea
              rows={6}
              value={row.description ?? ""}
              onChange={(e) => setRow((p) => ({ ...p, description: e.target.value }))}
              onBlur={(e) => void save({ description: e.target.value || null })}
              className={INPUT + " mt-1 font-normal"}
            />
          </label>

          <fieldset>
            <legend className="text-xs font-semibold text-muted-foreground">
              {t("ops.community.languages")}
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {languages.map((lang) => (
                <label
                  key={lang.slug}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    checked={(row.language_slugs ?? []).includes(lang.slug)}
                    onChange={() => toggleLanguage(lang.slug)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  {lang.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-muted-foreground">
              {t("ops.community.regions")}
            </legend>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("ops.community.regionsNote")}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {regions.map((region) => (
                <label
                  key={region.id}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    checked={regionIds.includes(region.id)}
                    onChange={() => void toggleRegion(region.id)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  {region.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-xs font-bold">{t("ops.community.translations")}</h3>
            {TARGETS.map((locale) => (
              <div key={locale} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(`ops.name_${locale}`)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void translate(locale)}
                    disabled={busy !== null || !row.description}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-secondary disabled:opacity-50"
                  >
                    {busy === locale ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Languages className="h-3 w-3" />
                    )}
                    {t("ops.community.translate")}
                  </button>
                </div>
                <input
                  aria-label={t("ops.community.cadence")}
                  placeholder={t("ops.community.cadence")}
                  value={(row[localeField("cadence_note", locale)] as string | null) ?? ""}
                  onChange={(e) =>
                    setRow((p) => ({ ...p, [localeField("cadence_note", locale)]: e.target.value }))
                  }
                  onBlur={(e) =>
                    void save({ [localeField("cadence_note", locale)]: e.target.value || null })
                  }
                  className={INPUT + " mt-2"}
                />
                <textarea
                  aria-label={t("ops.community.description")}
                  placeholder={t("ops.community.description")}
                  rows={4}
                  value={(row[localeField("description", locale)] as string | null) ?? ""}
                  onChange={(e) =>
                    setRow((p) => ({ ...p, [localeField("description", locale)]: e.target.value }))
                  }
                  onBlur={(e) =>
                    void save({ [localeField("description", locale)]: e.target.value || null })
                  }
                  className={INPUT + " mt-2"}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
