import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { Callout, parseCallout } from "@/components/callout";

/** Renders article body markdown with site-token styling. Raw HTML is not allowed. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-5 text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-10 text-2xl font-bold tracking-tight md:text-3xl">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 text-2xl font-bold tracking-tight md:text-3xl">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 text-lg font-semibold tracking-tight md:text-xl">{children}</h3>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          hr: () => <hr className="my-10 border-border/70" />,
          code: ({ children }) => (
            <code className="rounded bg-secondary px-1.5 py-0.5 text-[0.9em]">{children}</code>
          ),
          blockquote: ({ children }) => {
            const callout = parseCallout(children);
            if (callout) {
              return (
                <Callout shade={callout.shade} emoji={callout.emoji}>
                  {children}
                </Callout>
              );
            }
            return (
              <blockquote className="border-l-2 border-primary/50 pl-5 text-lg italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}