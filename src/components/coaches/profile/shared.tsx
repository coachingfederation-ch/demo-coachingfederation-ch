/**
 * Small presentational building blocks shared across the coach profile page:
 * numbered content panels, sidebar utility cards, free-text prose blocks and
 * label chips. Extracted verbatim from src/pages/CoachProfile.tsx.
 */
import { CARD_SHADOW } from "@/components/site-chrome";

/**
 * A numbered content panel. The mono "01 / Title" eyebrow plus a coloured
 * left edge is what discerns sections now — the old hairline separators read
 * as one continuous wall of text.
 */
export function Panel({
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
export function Prose({ text }: { text: string }) {
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

/** Sidebar key/value row. Renders nothing when the value is empty. */
export function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
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
          className="inline-flex h-7 items-center rounded-full bg-muted px-3 text-xs font-semibold text-muted-foreground"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
