import { useState } from "react";
import { Mark, type MarkName } from "@/components/marks";
import { CARD_SHADOW } from "@/components/site-chrome";
import { useI18n } from "@/i18n";

const benefitMarks: MarkName[] = [
  "circular1",
  "star",
  "asterisk1",
  "circular2",
  "asterisk3",
  "arrow1",
];

export function BenefitGrid() {
  const { t, tList } = useI18n();
  const items = tList<{ title: string; desc: string }>("coaches.benefits.items");
  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-8">
      <p className="eyebrow">{t("coaches.benefits.eyebrow")}</p>
      <h2 className="mt-3 max-w-2xl display-lg">
        {t("coaches.benefits.title")}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {t("coaches.benefits.lede")}
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={item.title}
            className={"rounded-2xl border border-border bg-card p-7 " + CARD_SHADOW}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-primary">
              <Mark name={benefitMarks[i % benefitMarks.length]} className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-base font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href="https://coachingfederation.org/about/icf-membership/individual-membership/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {t("coaches.benefits.cta")}
        </a>
        <p className="text-xs text-muted-foreground">{t("coaches.benefits.ctaNote")}</p>
      </div>
      </div>
    </section>
  );
}

export function LearningTabs() {
  const { t, tList } = useI18n();
  const tabs = tList<{ label: string; title: string; desc: string }>("coaches.learning.tabs");
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const current = tabs[Math.min(active, tabs.length - 1)];
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-8">
        <p className="eyebrow">{t("coaches.learning.eyebrow")}</p>
        <h2 className="mt-3 max-w-2xl display-lg">
          {t("coaches.learning.title")}
        </h2>
        <div
          role="tablist"
          aria-label={t("coaches.learning.eyebrow")}
          className="mt-10 flex flex-wrap gap-2"
          onKeyDown={(e) => {
            // ARIA APG tabs: arrow / Home / End move selection between tabs.
            const last = tabs.length - 1;
            let next: number | null = null;
            if (e.key === "ArrowRight" || e.key === "ArrowDown")
              next = active === last ? 0 : active + 1;
            else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
              next = active === 0 ? last : active - 1;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = last;
            if (next === null) return;
            e.preventDefault();
            setActive(next);
            document.getElementById(`learning-tab-${next}`)?.focus();
          }}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              id={`learning-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`learning-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={
                "inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-semibold transition sm:min-h-9 " +
                (i === active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`learning-panel-${active}`}
          aria-labelledby={`learning-tab-${active}`}
          tabIndex={0}
          className={
            "mt-6 grid gap-8 rounded-2xl border border-border/70 bg-card p-8 md:grid-cols-[1fr_1.4fr] md:p-12 " +
            CARD_SHADOW
          }
        >
          <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-mark-blue text-mark-cream">
            <Mark name={benefitMarks[active % benefitMarks.length]} className="h-1/2 w-1/2" />
          </div>
          <div className="self-center">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">{current.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{current.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CommunityGrid() {
  const { tList } = useI18n();
  const items = tList<{ name: string; languages: string; status: string }>(
    "coaches.chapters.items",
  );
  if (items.length === 0) return null;
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2">
      {items.map((c) => (
        <div
          key={c.name}
          className={
            "flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4 " +
            CARD_SHADOW
          }
        >
          <div>
            <p className="text-sm font-semibold tracking-tight">{c.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.status}</p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-chip-foreground">
            {c.languages}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MemberStories() {
  const { t, tList } = useI18n();
  const items = tList<{
    quote: string;
    name: string;
    credential: string;
    community: string;
    languages: string;
  }>("coaches.stories.items");
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const story = items[index % items.length];
  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-8">
      <p className="eyebrow">{t("coaches.stories.eyebrow")}</p>
      <h2 className="mt-3 max-w-2xl display-lg">
        {t("coaches.stories.title")}
      </h2>
      <figure
        className={"mt-10 rounded-2xl border border-border bg-card p-8 md:p-12 " + CARD_SHADOW}
      >
        <blockquote className="max-w-3xl text-xl font-semibold leading-snug tracking-tight md:text-2xl">
          “{story.quote}”
        </blockquote>
        <figcaption className="mt-8 flex flex-wrap items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-primary">
            <Mark name="circular2" className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold">
            {story.name}, {story.credential}
          </span>
          <span className="text-sm text-muted-foreground">{story.community}</span>
          <span className="inline-flex items-center rounded-full bg-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-chip-foreground">
            {story.languages}
          </span>
        </figcaption>
      </figure>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          aria-label={t("coaches.stories.prev")}
          onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-sm text-muted-foreground transition hover:text-foreground"
        >
          ←
        </button>
        <button
          type="button"
          aria-label={t("coaches.stories.next")}
          onClick={() => setIndex((i) => (i + 1) % items.length)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-sm text-muted-foreground transition hover:text-foreground"
        >
          →
        </button>
        <div className="ml-2 flex gap-1.5">
          {items.map((s, i) => (
            <span
              key={s.name}
              className={
                "h-1.5 w-6 rounded-full transition " + (i === index ? "bg-primary" : "bg-border")
              }
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
