/**
 * Public Coach Finder UI.
 *
 * Data comes from `queryCoachDirectory` (the `coach_directory_public` view),
 * never from local fixtures: only members that are active, credentialed and
 * whose profile is `published` are ever returned. Facet filters are applied
 * server-side; the free-text box narrows the current page client-side.
 */
import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CARD_SHADOW } from "@/components/site-chrome";
import { useI18n } from "@/i18n";
import { queryCoachDirectory, type DirectoryEntry } from "@/lib/directory.functions";
import {
  fetchActiveVocabularies,
  vocabLabel,
  type CoachFinderVocabularies,
  type VocabRow,
} from "@/lib/vocabularies";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-semibold transition sm:min-h-8 " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

const FIELD =
  "h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-foreground outline-none transition focus:border-primary";

type LabelLookup = (slug: string) => string;

export function CoachCard({
  entry,
  specialisationLabel,
  formatLabel,
}: {
  entry: DirectoryEntry;
  specialisationLabel: LabelLookup;
  formatLabel: LabelLookup;
}) {
  const { t } = useI18n();
  const name = entry.full_name ?? "";
  const location = [entry.city, entry.country].filter(Boolean).join(" · ");
  const langs = (entry.language_slugs ?? []).map((l) => l.toUpperCase()).join(" / ");
  const accepting = entry.availability_slug !== "not-accepting";
  const credentialYear = entry.credential_awarded_on
    ? new Date(entry.credential_awarded_on).getFullYear()
    : null;

  return (
    <article
      className={"flex w-full flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-bold text-primary"
        >
          {initials(name)}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{name}</h3>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {[location, langs].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
          {entry.credential_slug && (
            <span className="inline-flex h-6 items-center rounded-full bg-primary px-2.5 text-[11px] font-bold tracking-wider text-primary-foreground">
              {entry.credential_slug.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {entry.tagline && <p className="text-sm font-semibold text-primary">{entry.tagline}</p>}
      {entry.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {(entry.specialisation_slugs ?? []).map((s) => (
          <span
            key={s}
            className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-[11px] font-semibold text-muted-foreground"
          >
            {specialisationLabel(s)}
          </span>
        ))}
        {(entry.format_slugs ?? []).map((f) => (
          <span
            key={f}
            className="inline-flex h-6 items-center rounded-full border border-border px-2.5 text-[11px] font-semibold text-muted-foreground"
          >
            {formatLabel(f)}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border/70 pt-4 text-xs font-semibold">
        <span
          aria-hidden
          className={"h-2 w-2 rounded-full " + (accepting ? "bg-accent" : "bg-border")}
        />
        <span className={accepting ? "text-foreground" : "text-muted-foreground"}>
          {accepting ? t("directory.card.accepting") : t("directory.card.waitlist")}
        </span>
        {credentialYear && (
          <span className="ml-auto font-normal text-muted-foreground">
            {t("directory.card.credentialSince").replace("{year}", String(credentialYear))}
          </span>
        )}
      </div>
    </article>
  );
}

export function CoachDirectory() {
  const { t, locale } = useI18n();
  const { data: vocab } = useQuery<CoachFinderVocabularies>({
    queryKey: ["coach-finder-vocabularies"],
    queryFn: fetchActiveVocabularies,
    staleTime: 5 * 60 * 1000,
  });

  const regions = vocab?.cf_regions ?? [];
  const languages = vocab?.cf_languages ?? [];
  const credentialTerms = vocab?.cf_credentials ?? [];
  const specialisationTerms = vocab?.cf_specialisations ?? [];
  const formatTerms = vocab?.cf_formats ?? [];

  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [language, setLanguage] = useState("all");
  const [credentials, setCredentials] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  const label = (row: VocabRow) => vocabLabel(row, locale);
  const lookup = (rows: VocabRow[]): LabelLookup => {
    const map = new Map(rows.map((r) => [r.slug, vocabLabel(r, locale)]));
    return (slug) => map.get(slug) ?? slug;
  };
  const specialisationLabel = useMemo(() => lookup(specialisationTerms), [specialisationTerms, locale]);
  const formatLabel = useMemo(() => lookup(formatTerms), [formatTerms, locale]);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    setPage(0);
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filters = useMemo(
    () => ({
      regions: region === "all" ? undefined : [region],
      languages: language === "all" ? undefined : [language],
      credentials: credentials.length ? credentials : undefined,
      specialisations: specializations.length ? specializations : undefined,
      formats: formats.length ? formats : undefined,
      page,
    }),
    [region, language, credentials, specializations, formats, page],
  );

  const { data, isPending, isError } = useQuery({
    queryKey: ["coach-directory", filters],
    queryFn: () => queryCoachDirectory({ data: filters }),
    placeholderData: keepPreviousData,
  });

  const dirty =
    query !== "" ||
    region !== "all" ||
    language !== "all" ||
    credentials.length > 0 ||
    specializations.length > 0 ||
    formats.length > 0 ||
    acceptingOnly;

  function clearAll() {
    setQuery("");
    setRegion("all");
    setLanguage("all");
    setCredentials([]);
    setSpecializations([]);
    setFormats([]);
    setAcceptingOnly(false);
    setPage(0);
  }

  // Free text and availability narrow the page the server returned; the facet
  // filters above are what the view is queried with.
  const results = useMemo(() => {
    const entries = data?.entries ?? [];
    const needle = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (acceptingOnly && e.availability_slug !== "accepting") return false;
      if (!needle) return true;
      const haystack = [
        e.full_name,
        e.city,
        e.country,
        e.organisation,
        e.tagline,
        e.description,
        ...(e.specialisation_slugs ?? []).map(specialisationLabel),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [data, query, acceptingOnly, specialisationLabel]);

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 12;
  const narrowed = query.trim() !== "" || acceptingOnly;
  const shownCount = narrowed ? results.length : total;
  const countLabel =
    shownCount === 1
      ? t("directory.results.one")
      : t("directory.results.many").replace("{count}", String(shownCount));
  const hasMore = !narrowed && (page + 1) * pageSize < total;

  const filterPanel = (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="coach-search" className="btn-mono mb-2 block">
          {t("directory.filters.searchLabel")}
        </label>
        <input
          id="coach-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("directory.filters.searchPlaceholder")}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="coach-region" className="btn-mono mb-2 block">
          {t("directory.filters.regionLabel")}
        </label>
        <select
          id="coach-region"
          value={region}
          onChange={(e) => {
            setPage(0);
            setRegion(e.target.value);
          }}
          className={FIELD}
        >
          <option value="all">{t("directory.filters.regionAll")}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.slug}>
              {label(r)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="coach-language" className="btn-mono mb-2 block">
          {t("directory.filters.languageLabel")}
        </label>
        <select
          id="coach-language"
          value={language}
          onChange={(e) => {
            setPage(0);
            setLanguage(e.target.value);
          }}
          className={FIELD}
        >
          <option value="all">{t("directory.filters.languageAll")}</option>
          {languages.map((l) => (
            <option key={l.id} value={l.slug}>
              {label(l)}
            </option>
          ))}
        </select>
      </div>

      {credentialTerms.length > 0 && (
        <div>
          <p className="btn-mono mb-2">{t("directory.filters.credentialLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {credentialTerms.map((c) => (
              <Chip
                key={c.id}
                active={credentials.includes(c.slug)}
                onClick={() => toggle(credentials, setCredentials, c.slug)}
              >
                {c.slug}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {specialisationTerms.length > 0 && (
        <div>
          <p className="btn-mono mb-2">{t("directory.filters.specializationLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {specialisationTerms.map((s) => (
              <Chip
                key={s.id}
                active={specializations.includes(s.slug)}
                onClick={() => toggle(specializations, setSpecializations, s.slug)}
              >
                {label(s)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {formatTerms.length > 0 && (
        <div>
          <p className="btn-mono mb-2">{t("directory.filters.formatLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {formatTerms.map((f) => (
              <Chip
                key={f.id}
                active={formats.includes(f.slug)}
                onClick={() => toggle(formats, setFormats, f.slug)}
              >
                {label(f)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={acceptingOnly}
          onChange={(e) => setAcceptingOnly(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        {t("directory.filters.acceptingLabel")}
      </label>

      <div className={"rounded-2xl border border-border/70 bg-muted p-5 " + CARD_SHADOW}>
        <p className="text-sm font-bold text-foreground">{t("directory.note.title")}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("directory.note.body")}
        </p>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-8 py-16">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="mb-4 inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground lg:hidden"
          >
            {t("directory.filters.toggle")}
          </button>
          <div className={showFilters ? "block" : "hidden lg:block"}>{filterPanel}</div>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            {/* 4.1.3: announce the new result count when filters change. */}
            <p role="status" aria-live="polite" className="text-sm font-semibold text-muted-foreground">
              {isPending ? t("directory.results.loading") : countLabel}
            </p>
            {dirty && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t("directory.filters.clear")}
              </button>
            )}
          </div>

          {isError ? (
            <div className="rounded-2xl border border-border/70 bg-card px-8 py-16 text-center">
              <p className="text-base font-bold text-foreground">{t("directory.results.errorTitle")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("directory.results.errorBody")}</p>
            </div>
          ) : results.length ? (
            <>
              <ul className="grid list-none gap-5 p-0 md:grid-cols-2">
                {results.map((entry) => (
                  <li key={entry.profile_id} className="flex">
                    <CoachCard
                      entry={entry}
                      specialisationLabel={specialisationLabel}
                      formatLabel={formatLabel}
                    />
                  </li>
                ))}
              </ul>
              {(page > 0 || hasMore) && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground disabled:opacity-40"
                  >
                    {t("directory.results.prev")}
                  </button>
                  <button
                    type="button"
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground disabled:opacity-40"
                  >
                    {t("directory.results.next")}
                  </button>
                </div>
              )}
            </>
          ) : isPending ? null : (
            <div className="rounded-2xl border border-border/70 bg-card px-8 py-16 text-center">
              <p className="text-base font-bold text-foreground">
                {t("directory.results.emptyTitle")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("directory.results.emptyBody")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
