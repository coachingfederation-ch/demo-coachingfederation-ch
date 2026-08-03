/**
 * Homepage advertising band.
 *
 * A CSS-only marquee: the card track is rendered twice and translated by -50%,
 * so the loop is seamless without JS. Motion pauses on hover/focus and is
 * disabled entirely under `prefers-reduced-motion`, where the band degrades to
 * a plain horizontally scrollable row.
 *
 * Content is static demo data for now (see `home.ads` in the locale files).
 */
import { Mark } from "@/components/marks";

export type SponsorItem = { name: string; category: string; claim: string };

/** Surface rotation keeps the band rhythmic instead of six identical tiles. */
const SURFACES = [
  "bg-card text-foreground border-border",
  "bg-background text-foreground border-border",
  "bg-hero text-hero-foreground border-transparent",
] as const;

function SponsorCard({
  item,
  index,
  cta,
}: {
  item: SponsorItem;
  index: number;
  cta: string;
}) {
  const onHero = index % SURFACES.length === 2;
  return (
    <article
      className={
        "relative flex h-full min-h-[13rem] w-[19rem] shrink-0 flex-col overflow-hidden rounded-2xl border p-6 sm:w-[21rem] " +
        SURFACES[index % SURFACES.length]
      }
    >
      {onHero ? (
        <Mark
          name="circular1"
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 text-mark-cream opacity-20"
        />
      ) : null}
      <p className={onHero ? "section-label !text-white/70" : "section-label"}>{item.category}</p>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight">
        {item.name}
      </h3>
      <p
        className={
          "mt-2 flex-1 text-sm leading-[1.65] " +
          (onHero ? "text-white/85" : "text-muted-foreground")
        }
      >
        {item.claim}
      </p>
      <span
        className={
          "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold " +
          (onHero ? "text-mark-cream" : "text-primary")
        }
      >
        {cta}
      </span>
    </article>
  );
}

export function SponsorMarquee({
  items,
  adLabel,
  cta,
}: {
  items: SponsorItem[];
  adLabel: string;
  cta: string;
}) {
  return (
    <div
      className="group relative overflow-hidden motion-reduce:overflow-x-auto"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max items-stretch gap-5 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-stretch gap-5" aria-hidden={copy === 1 || undefined}>
            {items.map((item, i) => (
              <div key={item.name} className="relative flex">
                <SponsorCard item={item} index={i} cta={cta} />
                <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center rounded-full border border-border bg-chip px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-chip-foreground">
                  {adLabel}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}