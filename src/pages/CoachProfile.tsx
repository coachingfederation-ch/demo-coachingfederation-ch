/**
 * Public, read-only coach profile.
 *
 * Data comes from the same public-safe path as the listing
 * (`coach_directory_public` via `getPublicCoachProfile`), so nothing is shown
 * here that a visitor could not already see in search results — plus the
 * member's own website links, which are only loaded after the view has already
 * confirmed the profile is published and eligible.
 */
import { useQuery } from "@tanstack/react-query";
import { CARD_SHADOW, SiteFooter, SiteHeaderBar } from "@/components/site-chrome";
import { CoachAvatar } from "@/components/coaches/directory";
import { LocaleLink, useI18n } from "@/i18n";
import type { PublicCoachProfile } from "@/lib/directory.functions";
import {
  fetchActiveVocabularies,
  vocabLabel,
  type CoachFinderVocabularies,
  type VocabRow,
} from "@/lib/vocabularies";

export function CoachProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-7xl px-5 pt-6 pb-8 sm:px-8">
          <SiteHeaderBar compact />
        </div>
      </header>
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function CoachFallback({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const { t } = useI18n();
  return (
    <CoachProfileShell>
      <div className="mx-auto max-w-3xl px-8 py-28 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t(bodyKey)}</p>
        <LocaleLink
          to="/find-a-coach"
          className="mt-8 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          {t("directory.detail.back")}
        </LocaleLink>
      </div>
    </CoachProfileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border/70 pt-6">
      <h2 className="btn-mono mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Chips({ labels }: { labels: string[] }) {
  return (
    <ul className="flex list-none flex-wrap gap-2 p-0">
      {labels.map((label) => (
        <li
          key={label}
          className="inline-flex h-7 items-center rounded-full bg-muted px-3 text-xs font-semibold text-muted-foreground"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

export default function CoachProfilePage({ profile }: { profile: PublicCoachProfile }) {
  const { t, locale } = useI18n();
  const { data: vocab } = useQuery<CoachFinderVocabularies>({
    queryKey: ["coach-finder-vocabularies"],
    queryFn: fetchActiveVocabularies,
    staleTime: 5 * 60 * 1000,
  });

  const lookup = (rows: VocabRow[] | undefined) => {
    const map = new Map((rows ?? []).map((r) => [r.slug, vocabLabel(r, locale)]));
    return (slug: string) => map.get(slug) ?? slug;
  };
  const specialisationLabel = lookup(vocab?.cf_specialisations);
  const formatLabel = lookup(vocab?.cf_formats);
  const languageLabel = lookup(vocab?.cf_languages);
  const regionLabel = lookup(vocab?.cf_regions);

  const name = profile.full_name ?? "";
  const location = [profile.city, profile.country].filter(Boolean).join(" · ");
  const accepting = profile.availability_slug !== "not-accepting";
  const credentialYear = profile.credential_awarded_on
    ? new Date(profile.credential_awarded_on).getFullYear()
    : null;
  const languages = (profile.language_slugs ?? []).map(languageLabel);
  const regions = (profile.region_slugs ?? []).map(regionLabel);
  const specialisations = (profile.specialisation_slugs ?? []).map(specialisationLabel);
  const formats = (profile.format_slugs ?? []).map(formatLabel);

  return (
    <CoachProfileShell>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <LocaleLink
          to="/find-a-coach"
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          ← {t("directory.detail.back")}
        </LocaleLink>

        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}>
            <CoachAvatar
              name={name}
              imageUrl={profile.image_url}
              className="h-40 w-40 rounded-2xl text-4xl"
            />
            <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-foreground">
              {name}
            </h1>
            {profile.credential_slug && (
              <p className="mt-3">
                <span className="inline-flex h-6 items-center rounded-full bg-primary px-2.5 text-[11px] font-bold tracking-wider text-primary-foreground">
                  {profile.credential_slug.toUpperCase()}
                </span>
              </p>
            )}
            {location && (
              <p className="mt-3 text-sm font-semibold text-muted-foreground">{location}</p>
            )}
            {profile.organisation && (
              <p className="mt-1 text-sm text-muted-foreground">{profile.organisation}</p>
            )}
            {credentialYear && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("directory.card.credentialSince").replace("{year}", String(credentialYear))}
              </p>
            )}
            <p className="mt-5 flex items-center gap-2 text-xs font-semibold">
              <span
                aria-hidden
                className={"h-2 w-2 rounded-full " + (accepting ? "bg-accent" : "bg-border")}
              />
              <span className={accepting ? "text-foreground" : "text-muted-foreground"}>
                {accepting ? t("directory.card.accepting") : t("directory.card.waitlist")}
              </span>
            </p>
          </aside>

          <div className="flex flex-col gap-6">
            {profile.tagline && (
              <p className="text-lg font-semibold leading-relaxed text-primary">
                {profile.tagline}
              </p>
            )}
            {profile.description && (
              <Section title={t("directory.detail.about")}>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {profile.description}
                </p>
              </Section>
            )}
            {specialisations.length > 0 && (
              <Section title={t("directory.detail.specialisations")}>
                <Chips labels={specialisations} />
              </Section>
            )}
            {formats.length > 0 && (
              <Section title={t("directory.detail.formats")}>
                <Chips labels={formats} />
              </Section>
            )}
            {languages.length > 0 && (
              <Section title={t("directory.detail.languages")}>
                <Chips labels={languages} />
              </Section>
            )}
            {regions.length > 0 && (
              <Section title={t("directory.detail.regions")}>
                <Chips labels={regions} />
              </Section>
            )}
            {profile.links.length > 0 && (
              <Section title={t("directory.detail.links")}>
                <ul className="flex list-none flex-col gap-2 p-0">
                  {profile.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {link.label || link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            <Section title={t("directory.note.title")}>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("directory.note.body")}
              </p>
            </Section>
          </div>
        </div>
      </div>
    </CoachProfileShell>
  );
}
