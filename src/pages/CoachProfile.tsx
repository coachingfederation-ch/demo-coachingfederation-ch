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

/** Free-text block: blank lines become paragraphs, single breaks are kept. */
function Prose({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
        >
          {paragraph.trim()}
        </p>
      ))}
    </div>
  );
}

/**
 * "How I work" — the member writes paragraphs; each becomes a numbered step.
 * A single paragraph simply renders as prose, so nothing looks half-filled.
 */
function Steps({ text }: { text: string }) {
  const steps = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (steps.length < 2) return <Prose text={text} />;
  return (
    <ol className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {steps.slice(0, 6).map((step, index) => (
        <li key={index}>
          <p className="eyebrow text-primary">{String(index + 1).padStart(2, "0")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step}</p>
        </li>
      ))}
    </ol>
  );
}

/** Sidebar key/value row. Renders nothing when the value is empty. */
function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
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
  const clientTypeLabel = lookup(vocab?.cf_client_types);
  const availabilityLabel = lookup(vocab?.cf_availability_labels);

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
  const clientTypes = (profile.client_type_slugs ?? []).map(clientTypeLabel);

  const bookingUrl = profile.booking_url;
  const contactEmail = profile.contact_email;
  const hasCta = Boolean(bookingUrl || contactEmail);
  const experience = profile.experience_band
    ? t(`directory.detail.experienceBands.${profile.experience_band}`)
    : null;
  const availabilityText =
    profile.availability_note ||
    (profile.availability_slug ? availabilityLabel(profile.availability_slug) : null);
  const hasSidebarFacts = Boolean(
    formats.length ||
      profile.session_length_note ||
      languages.length ||
      availabilityText ||
      experience,
  );

  return (
    <CoachProfileShell>
      {/* Hero: identity, at-a-glance meta and the two contact actions. */}
      <div className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
          <LocaleLink
            to="/find-a-coach"
            className="inline-flex items-center text-sm font-semibold text-hero-foreground/80 hover:text-hero-foreground"
          >
            ← {t("directory.detail.back")}
          </LocaleLink>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
            <CoachAvatar
              name={name}
              imageUrl={profile.image_url}
              className="h-28 w-28 shrink-0 rounded-full text-3xl sm:h-36 sm:w-36 sm:text-4xl"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {name}
                </h1>
                {profile.credential_slug && (
                  <span className="inline-flex h-6 items-center rounded-full bg-hero-foreground/15 px-2.5 text-[11px] font-bold tracking-wider">
                    {profile.credential_slug.toUpperCase()}
                  </span>
                )}
              </div>
              {profile.tagline && (
                <p className="mt-3 max-w-2xl text-lg font-semibold leading-relaxed text-hero-foreground/90">
                  {profile.tagline}
                </p>
              )}
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-hero-foreground/80">
                {location && <span>{location}</span>}
                {profile.organisation && <span>{profile.organisation}</span>}
                {languages.length > 0 && <span>{languages.join(" · ")}</span>}
                {credentialYear && (
                  <span>
                    {t("directory.card.credentialSince").replace("{year}", String(credentialYear))}
                  </span>
                )}
              </p>
              <p className="mt-4 flex items-center gap-2 text-xs font-semibold">
                <span
                  aria-hidden
                  className={
                    "h-2 w-2 rounded-full " + (accepting ? "bg-accent" : "bg-hero-foreground/40")
                  }
                />
                <span className="text-hero-foreground/90">
                  {accepting ? t("directory.card.accepting") : t("directory.card.waitlist")}
                </span>
              </p>
              {hasCta && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {bookingUrl && (
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground"
                    >
                      {t("directory.detail.book")}
                    </a>
                  )}
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex h-11 items-center rounded-full border border-hero-foreground/40 px-5 text-sm font-semibold text-hero-foreground hover:bg-hero-foreground/10"
                    >
                      {t("directory.detail.message")}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {profile.description && (
            <section>
              <h2 className="btn-mono mb-3">{t("directory.detail.about")}</h2>
              <Prose text={profile.description} />
            </section>
          )}
          {profile.approach && (
            <Section title={t("directory.detail.approach")}>
              <Steps text={profile.approach} />
            </Section>
          )}
          {specialisations.length > 0 && (
            <Section title={t("directory.detail.specialisations")}>
              <Chips labels={specialisations} />
            </Section>
          )}
          {clientTypes.length > 0 && (
            <Section title={t("directory.detail.clientTypes")}>
              <Chips labels={clientTypes} />
            </Section>
          )}
          {profile.qualifications && (
            <Section title={t("directory.detail.qualifications")}>
              <Prose text={profile.qualifications} />
            </Section>
          )}
          {profile.testimonial_quote && (
            <section className="border-t border-border/70 pt-6">
              <figure className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}>
                <blockquote className="text-base font-semibold leading-relaxed text-foreground">
                  “{profile.testimonial_quote}”
                </blockquote>
                {profile.testimonial_attribution && (
                  <figcaption className="mt-3 text-xs font-semibold text-muted-foreground">
                    {profile.testimonial_attribution}
                  </figcaption>
                )}
              </figure>
            </section>
          )}
          {profile.fees_note && (
            <Section title={t("directory.detail.fees")}>
              <Prose text={profile.fees_note} />
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
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
          {(hasSidebarFacts || hasCta) && (
            <div className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}>
              <h2 className="eyebrow text-muted-foreground">
                {t("directory.detail.workWith").replace("{name}", name.split(" ")[0] ?? name)}
              </h2>
              {hasSidebarFacts && (
                <dl className="mt-4">
                  <Fact
                    label={t("directory.detail.formats")}
                    value={formats.length ? formats.join(" · ") : null}
                  />
                  <Fact
                    label={t("directory.detail.session")}
                    value={profile.session_length_note}
                  />
                  <Fact
                    label={t("directory.detail.languages")}
                    value={languages.length ? languages.join(" · ") : null}
                  />
                  <Fact label={t("directory.detail.experience")} value={experience} />
                  <Fact label={t("directory.detail.availability")} value={availabilityText} />
                </dl>
              )}
              {hasCta && (
                <div className="mt-5 flex flex-col gap-2">
                  {bookingUrl && (
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                    >
                      {t("directory.detail.book")}
                    </a>
                  )}
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground hover:bg-secondary"
                    >
                      {t("directory.detail.message")}
                    </a>
                  )}
                  {profile.response_time_note && (
                    <p className="text-xs text-muted-foreground">{profile.response_time_note}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border/70 bg-secondary/60 p-6">
            <h2 className="eyebrow text-muted-foreground">{t("directory.note.title")}</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t("directory.note.body")}
            </p>
          </div>
        </aside>
      </div>
    </CoachProfileShell>
  );
}
