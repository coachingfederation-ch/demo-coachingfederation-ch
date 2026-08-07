/**
 * Educational context section shown before the coach finder search UI.
 *
 * Explains the three ICF credential levels, highlights inclusive coaching
 * (DEIB touchpoint), and points organisations to the chapter contact. The
 * section is collapsible on mobile and always visible on desktop.
 */
import { useState } from "react";
import { useI18n } from "@/i18n";
import { Mark } from "@/components/marks";

const EMAIL = "office@coachingfederation.ch";

export function CoachFinderContext() {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);

  const credentialCards = [
    {
      abbr: t("directory.finderContext.credentials.acc.abbr"),
      title: t("directory.finderContext.credentials.acc.title"),
      description: t("directory.finderContext.credentials.acc.description"),
    },
    {
      abbr: t("directory.finderContext.credentials.pcc.abbr"),
      title: t("directory.finderContext.credentials.pcc.title"),
      description: t("directory.finderContext.credentials.pcc.description"),
    },
    {
      abbr: t("directory.finderContext.credentials.mcc.abbr"),
      title: t("directory.finderContext.credentials.mcc.title"),
      description: t("directory.finderContext.credentials.mcc.description"),
    },
  ];

  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Mobile disclosure: native <details> open by default, controlled via state so the toggle label flips. */}
        <details
          open={open}
          onToggle={(e) => setOpen(e.currentTarget.open)}
          className="group"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-soft)] lg:hidden">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              {t("directory.finderContext.credentials.title")}
            </h2>
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground"
              aria-hidden
            >
              {open ? "−" : "+"}
            </span>
          </summary>

          {/* Desktop always-visible heading (hidden on mobile because the summary handles it). */}
          <div className="mb-8 hidden lg:block">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {t("directory.finderContext.credentials.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {t("directory.finderContext.credentials.lede")}
            </p>
          </div>

          <div className="mt-6 space-y-6 lg:mt-0">
            {/* Credential cards */}
            <div className="grid gap-5 md:grid-cols-3">
              {credentialCards.map((card) => (
                <div
                  key={card.abbr}
                  className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-[var(--shadow-soft)]"
                >
                <div className="relative z-10">
                  <div className="relative inline-block">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-semibold text-primary">
                        {card.abbr}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {card.title}
                      </span>
                    </div>
                    <span
                      className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full text-mark-yellow"
                      aria-hidden
                    >
                      <Mark name="highlight1" className="h-full w-full" />
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-foreground">
                    {card.description}
                  </p>
                </div>
                </div>
              ))}
            </div>

            {/* DEIB note and Organisations CTA */}
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-mark-yellow/40 bg-mark-yellow/15 p-6">
                <div className="relative z-10 flex gap-4">
                  <div
                    className="mt-1 h-8 w-8 shrink-0 text-mark-yellow"
                    aria-hidden
                  >
                    <Mark name="asterisk2" className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {t("directory.finderContext.deib.title")}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {t("directory.finderContext.deib.lede")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-hero p-6 text-hero-foreground">
                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div
                      className="mt-1 h-8 w-8 shrink-0 text-hero-foreground/80"
                      aria-hidden
                    >
                      <Mark name="arrow2" className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold">
                        {t("directory.finderContext.organisations.title")}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed opacity-90">
                        {t("directory.finderContext.organisations.lede")}
                      </p>
                      <a
                        href={`mailto:${EMAIL}`}
                        target="_top"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-hero-foreground px-5 py-2.5 text-sm font-semibold text-hero transition-colors hover:bg-white"
                      >
                        {t("directory.finderContext.organisations.cta")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
