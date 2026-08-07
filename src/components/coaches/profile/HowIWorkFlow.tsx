/**
 * "How I work" — the member writes paragraphs; each becomes a waypoint on a
 * connected flow. Up to four steps lay out horizontally with a connector line
 * behind the nodes; more steps (or narrow screens) fall back to a vertical
 * timeline so long paragraphs stay readable. A single paragraph renders as
 * plain prose, so nothing ever looks half-built.
 */
import { Prose } from "@/components/coaches/profile/shared";
import { RichTextView } from "@/components/rich-text-view";

/** Each waypoint can now carry light formatting, so render it as rich text. */
function StepBody({ text, className }: { text: string; className: string }) {
  return <RichTextView text={text} className={className} />;
}

export function HowIWorkFlow({ text }: { text: string }) {
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
            <StepBody
              text={step}
              className="gap-2 pt-2 text-sm text-muted-foreground md:pt-3"
            />
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
          <StepBody text={step} className="gap-2 pt-3 text-sm text-muted-foreground" />
        </li>
      ))}
    </ol>
  );
}
