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

/**
 * A numbered content panel. The mono "01 / Title" eyebrow plus a coloured
 * left edge is what discerns sections now — the old hairline separators read
 * as one continuous wall of text.
 */
function Panel({
  index,
  title,
  edge = "primary",
  children,
}: {
  index: number;
  title: string;
  edge?: "primary" | "accent" | "muted";
  children: React.ReactNode;
}) {
  const edgeClass =
    edge === "accent"
      ? "border-l-4 border-l-accent"
      : edge === "muted"
        ? "border-l-4 border-l-mark-blue/40"
        : "border-l-4 border-l-primary";
  return (
    <section
      className={
        "rounded-2xl border border-border/60 bg-card p-6 sm:p-8 " + edgeClass + " " + CARD_SHADOW
      }
    >
      <h2 className="btn-mono mb-5 font-semibold tracking-widest uppercase">
        {String(index).padStart(2, "0")} / {title}
      </h2>
      {children}
    </section>
  );
}

/** Right-column utility card. */
function SideCard({
  title,
  dot = "accent",
  children,
}: {
  title: string;
  dot?: "accent" | "primary" | "muted";
  children: React.ReactNode;
}) {
  const dotClass =
    dot === "primary" ? "bg-primary" : dot === "muted" ? "bg-mark-blue/50" : "bg-accent";
  return (
    <div className={"rounded-2xl border border-border/60 bg-card p-6 " + CARD_SHADOW}>
      <h2 className="eyebrow flex items-center gap-2 text-primary">
        <span aria-hidden className={"h-2 w-2 shrink-0 rounded-full " + dotClass} />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
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
 * "How I work" — the member writes paragraphs; each becomes a waypoint on a
 * connected flow. Up to four steps lay out horizontally with a connector line
 * behind the nodes; more steps (or narrow screens) fall back to a vertical
 * timeline so long paragraphs stay readable. A single paragraph renders as
 * plain prose, so nothing ever looks half-built.
 */
function Steps({ text }: { text: string }) {
  const steps = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (steps.length < 2) return <Prose text={text} />;

  const nodeTone = (index: number) =>
    index % 3 === 0
      ? "bg-primary text-primary-foreground"
      : index % 3 === 1
        ? "bg-accent text-accent-foreground"
        : "bg-teal-soft text-primary";
  const horizontal = steps.length <= 4;

  if (horizontal) {
    return (
      <ol className="relative flex list-none flex-col gap-8 p-0 md:flex-row md:items-start md:gap-4">
        {/* Connector: vertical on mobile, horizontal behind the nodes on desktop. */}
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-primary via-accent to-teal-soft opacity-30 md:top-6 md:right-0 md:bottom-auto md:left-0 md:h-0.5 md:w-full md:bg-gradient-to-r"
        />
        {steps.map((step, index) => (
          <li
            key={index}
            className="relative z-10 flex flex-1 items-start gap-4 md:flex-col md:items-center md:text-center"
          >
            <span
              className={
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ring-8 ring-card " +
                nodeTone(index)
              }
            >
              {index + 1}
            </span>
            <p className="pt-2 text-sm leading-relaxed text-muted-foreground md:pt-3">{step}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="relative flex list-none flex-col gap-8 p-0">
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-primary via-accent to-teal-soft opacity-30"
      />
      {steps.map((step, index) => (
        <li key={index} className="relative z-10 flex items-start gap-4">
          <span
            className={
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ring-8 ring-card " +
              nodeTone(index)
            }
          >
            {index + 1}
          </span>
          <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{step}</p>
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
  const hasSidebarCards = Boolean(
    hasSidebarFacts || hasCta || profile.fees_note || regions.length || profile.links.length,
  );
  // Panels are numbered in render order, skipping whatever the coach left empty.
  let panelIndex = 0;
  const panel = () => ++panelIndex;

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

      <div
        className={
          "mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:items-start " +
          (hasSidebarCards ? "lg:grid-cols-[minmax(0,1fr)_340px]" : "lg:grid-cols-1")
        }
      >
        <div className="flex min-w-0 flex-col gap-6">
          {profile.description && (
            <Panel index={panel()} title={t("directory.detail.about")} edge="primary">
              <Prose text={profile.description} />
            </Panel>
          )}
          {profile.approach && (
            <Panel index={panel()} title={t("directory.detail.approach")} edge="accent">
              <Steps text={profile.approach} />
            </Panel>
          )}
          {(specialisations.length > 0 || clientTypes.length > 0) && (
            <div
              className={
                "grid gap-6 " +
                (specialisations.length > 0 && clientTypes.length > 0 ? "md:grid-cols-2" : "")
              }
            >
              {specialisations.length > 0 && (
                <Panel index={panel()} title={t("directory.detail.specialisations")} edge="accent">
                  <Chips labels={specialisations} />
                </Panel>
              )}
              {clientTypes.length > 0 && (
                <Panel index={panel()} title={t("directory.detail.clientTypes")} edge="muted">
                  <Chips labels={clientTypes} />
                </Panel>
              )}
            </div>
          )}
          {profile.qualifications && (
            <Panel index={panel()} title={t("directory.detail.qualifications")} edge="primary">
              <Prose text={profile.qualifications} />
            </Panel>
          )}
          {profile.testimonial_quote && (
            <figure
              className={
                "rounded-2xl border border-border/60 bg-hero p-8 text-hero-foreground " +
                CARD_SHADOW
              }
            >
              <blockquote className="text-lg font-semibold leading-relaxed">
                “{profile.testimonial_quote}”
              </blockquote>
              {profile.testimonial_attribution && (
                <figcaption className="mt-4 text-xs font-semibold text-hero-foreground/70">
                  {profile.testimonial_attribution}
                </figcaption>
              )}
            </figure>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
          {(hasSidebarFacts || hasCta) && (
            <div className={"rounded-2xl border border-border/60 bg-card p-6 " + CARD_SHADOW}>
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
                      className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground"
                    >
                      {t("directory.detail.book")}
                    </a>
                  )}
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border-2 border-primary px-5 text-sm font-semibold text-primary hover:bg-secondary"
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

          {/* Practical details live in the right rail: fees, where they work, links. */}
          {profile.fees_note && (
            <SideCard title={t("directory.detail.fees")} dot="accent">
              <Prose text={profile.fees_note} />
            </SideCard>
          )}
          {regions.length > 0 && (
            <SideCard title={t("directory.detail.regions")} dot="primary">
              <Chips labels={regions} />
            </SideCard>
          )}
          {profile.links.length > 0 && (
            <SideCard title={t("directory.detail.links")} dot="muted">
              <ul className="flex list-none flex-col gap-3 p-0">
                {profile.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <span>{link.label || link.url}</span>
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </SideCard>
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
