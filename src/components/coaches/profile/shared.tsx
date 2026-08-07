/**
 * Small presentational building blocks shared across the coach profile page:
 * editorial "signature card" panels, sidebar utility cards, free-text prose
 * blocks and label chips. Used by src/pages/CoachProfile.tsx.
 */
import { CARD_SHADOW } from "@/components/site-chrome";
import { Mark, type MarkName } from "@/components/marks";
import { parseRichText, type RichInline } from "@/lib/rich-text";

/**
 * Shared card surface: raised white on the bone page, hairline border and a
 * restrained lift on pointer devices only (no motion for reduced-motion users).
 */
export const PROFILE_CARD =
  "rounded-2xl border border-border/60 bg-card transition-[transform,box-shadow] duration-300 motion-reduce:transition-none md:hover:-translate-y-0.5 md:hover:shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] motion-reduce:md:hover:translate-y-0 " +
  CARD_SHADOW;

/**
 * An editorial content panel: a small mono index, a Quicksand heading and an
 * optional ICF brush stroke underlining it. The brush mark is the only
 * decoration a panel gets, so pass it to at most one or two panels per page.
 */
export function Panel({
  index,
  title,
  mark,
  className,
  children,
}: {
  index: number;
  title: string;
  mark?: MarkName;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={PROFILE_CARD + " p-6 sm:p-8 " + (className ?? "")}>
      <div className="relative mb-6 inline-block max-w-full pr-2">
        <h2 className="flex flex-wrap items-baseline gap-x-3 text-xl leading-tight font-bold tracking-tight text-foreground sm:text-2xl">
          <span className="btn-mono text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
          {title}
        </h2>
        {mark && (
          <Mark
            name={mark}
            className="pointer-events-none absolute -bottom-2.5 left-0 h-2.5 w-full text-accent"
          />
        )}
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}

/** Right-column utility card. */
export function SideCard({
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
    <div className={PROFILE_CARD + " p-6"}>
      <h2 className="eyebrow flex items-center gap-2 text-primary">
        <span aria-hidden className={"h-2 w-2 shrink-0 rounded-full " + dotClass} />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Renders bold/italic runs of one line. */
function Runs({ inline }: { inline: RichInline[] }) {
  return (
    <>
      {inline.map((run, index) => {
        if (run.bold)
          return (
            <strong key={index} className="font-semibold text-foreground">
              {run.text}
            </strong>
          );
        if (run.italic) return <em key={index}>{run.text}</em>;
        return <span key={index}>{run.text}</span>;
      })}
    </>
  );
}

/**
 * Free-text block: blank lines become paragraphs, single breaks are kept, and
 * light Markdown (bold, italic, bullet lists) authored in the member editor is
 * rendered.
 */
export function Prose({ text }: { text: string }) {
  const blocks = parseRichText(text);
  return (
    <div className="flex flex-col gap-3 text-[0.95rem] leading-relaxed text-muted-foreground">
      {blocks.map((block, index) =>
        block.type === "p" ? (
          <p key={index} className="whitespace-pre-line">
            <Runs inline={block.inline} />
          </p>
        ) : (
          <ul key={index} className="list-disc space-y-1.5 pl-5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Runs inline={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/** Sidebar key/value row. Renders nothing when the value is empty. */
export function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2.5 last:border-b-0">
      <dt className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function Chips({ labels }: { labels: string[] }) {
  return (
    <ul className="flex list-none flex-wrap gap-2 p-0">
      {labels.map((label) => (
        <li
          key={label}
          className="inline-flex h-8 items-center rounded-full bg-secondary px-3.5 text-xs font-semibold text-primary"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
