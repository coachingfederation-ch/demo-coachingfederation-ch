import { useMemo, useState } from "react";
import { CARD_SHADOW } from "@/components/site-chrome";
import { useI18n } from "@/i18n";
import {
  CANTONS,
  COACHES,
  COACHING_FORMATS,
  COACH_LANGUAGES,
  CREDENTIAL_LEVELS,
  SPECIALIZATION_KEYS,
  initials,
  type Coach,
  type CoachLanguage,
  type CoachingFormat,
  type CredentialLevel,
} from "@/lib/coaches";

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

export function CoachCard({ coach }: { coach: Coach }) {
  const { t } = useI18n();
  const { icf, local } = coach;
  return (
    <article
      className={"flex w-full flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}
    >
      <div className="flex items-start gap-4">
        {icf.photoUrl ? (
          <img
            src={icf.photoUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-bold text-primary"
          >
            {initials(icf.fullName)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{icf.fullName}</h3>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {icf.city} · {icf.canton} ·{" "}
            {icf.languages.map((l) => l.toUpperCase()).join(" / ")}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
          <span className="inline-flex h-6 items-center rounded-full bg-primary px-2.5 text-[11px] font-bold tracking-wider text-primary-foreground">
            {icf.credential}
          </span>
          {local.featured && (
            <span className="inline-flex h-6 items-center rounded-full bg-accent px-2.5 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
              {t("directory.card.featured")}
            </span>
          )}
        </div>
      </div>

      {local.customHeadline && (
        <p className="text-sm font-semibold text-primary">{local.customHeadline}</p>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">{icf.bioSnippet}</p>

      <div className="flex flex-wrap gap-2">
        {icf.specializations.map((s) => (
          <span
            key={s}
            className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-[11px] font-semibold text-muted-foreground"
          >
            {t(`directory.specializations.${s}`)}
          </span>
        ))}
        {icf.formats.map((f) => (
          <span
            key={f}
            className="inline-flex h-6 items-center rounded-full border border-border px-2.5 text-[11px] font-semibold text-muted-foreground"
          >
            {t(`directory.formats.${f}`)}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border/70 pt-4 text-xs font-semibold">
        <span
          aria-hidden
          className={
            "h-2 w-2 rounded-full " + (local.acceptingClients ? "bg-accent" : "bg-border")
          }
        />
        <span className={local.acceptingClients ? "text-foreground" : "text-muted-foreground"}>
          {local.acceptingClients ? t("directory.card.accepting") : t("directory.card.waitlist")}
        </span>
        <span className="ml-auto font-normal text-muted-foreground">
          {t("directory.card.credentialSince").replace("{year}", String(icf.credentialSince))}
        </span>
      </div>
    </article>
  );
}

export function CoachDirectory() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [canton, setCanton] = useState("all");
  const [language, setLanguage] = useState<"all" | CoachLanguage>("all");
  const [credentials, setCredentials] = useState<CredentialLevel[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [formats, setFormats] = useState<CoachingFormat[]>([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  function toggle<T>(list: T[], set: (v: T[]) => void, value: T) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const dirty =
    query !== "" ||
    canton !== "all" ||
    language !== "all" ||
    credentials.length > 0 ||
    specializations.length > 0 ||
    formats.length > 0 ||
    acceptingOnly;

  function clearAll() {
    setQuery("");
    setCanton("all");
    setLanguage("all");
    setCredentials([]);
    setSpecializations([]);
    setFormats([]);
    setAcceptingOnly(false);
  }

  const results = useMemo(
    () =>
      COACHES.filter(({ icf, local }) => {
        if (canton !== "all" && icf.canton !== canton) return false;
        if (language !== "all" && !icf.languages.includes(language)) return false;
        if (credentials.length && !credentials.includes(icf.credential)) return false;
        if (specializations.length && !specializations.some((s) => icf.specializations.includes(s)))
          return false;
        if (formats.length && !formats.some((f) => icf.formats.includes(f))) return false;
        if (acceptingOnly && !local.acceptingClients) return false;
        if (query) {
          const haystack = [
            icf.fullName,
            icf.city,
            icf.canton,
            icf.bioSnippet,
            ...icf.specializations.map((s) => t(`directory.specializations.${s}`)),
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(query.toLowerCase())) return false;
        }
        return true;
      }),
    [query, canton, language, credentials, specializations, formats, acceptingOnly, t],
  );

  const countLabel =
    results.length === 1
      ? t("directory.results.one")
      : t("directory.results.many").replace("{count}", String(results.length));

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
        <label htmlFor="coach-canton" className="btn-mono mb-2 block">
          {t("directory.filters.cantonLabel")}
        </label>
        <select
          id="coach-canton"
          value={canton}
          onChange={(e) => setCanton(e.target.value)}
          className={FIELD}
        >
          <option value="all">{t("directory.filters.cantonAll")}</option>
          {CANTONS.map((c) => (
            <option key={c} value={c}>
              {c}
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
          onChange={(e) => setLanguage(e.target.value as "all" | CoachLanguage)}
          className={FIELD}
        >
          <option value="all">{t("directory.filters.languageAll")}</option>
          {COACH_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {t(`directory.languages.${l}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="btn-mono mb-2">{t("directory.filters.credentialLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {CREDENTIAL_LEVELS.map((c) => (
            <Chip
              key={c}
              active={credentials.includes(c)}
              onClick={() => toggle(credentials, setCredentials, c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="btn-mono mb-2">{t("directory.filters.specializationLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATION_KEYS.map((s) => (
            <Chip
              key={s}
              active={specializations.includes(s)}
              onClick={() => toggle(specializations, setSpecializations, s)}
            >
              {t(`directory.specializations.${s}`)}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="btn-mono mb-2">{t("directory.filters.formatLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {COACHING_FORMATS.map((f) => (
            <Chip key={f} active={formats.includes(f)} onClick={() => toggle(formats, setFormats, f)}>
              {t(`directory.formats.${f}`)}
            </Chip>
          ))}
        </div>
      </div>

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
              {countLabel}
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

          {results.length ? (
            <ul className="grid list-none gap-5 p-0 md:grid-cols-2">
              {results.map((c) => (
                <li key={c.id} className="flex">
                  <CoachCard coach={c} />
                </li>
              ))}
            </ul>
          ) : (
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