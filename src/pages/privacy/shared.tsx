/**
 * Shared presentational helpers used across the Privacy page sections:
 * ExternalLink, MailLink, Table, InfoCallout.
 * Consumed by all section components in src/pages/privacy/*.
 */
import { Info } from "lucide-react";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </a>
  );
}

function MailLink({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      target="_top"
      className="text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {address}
    </a>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div
      className="overflow-x-auto rounded-2xl border border-border/70 bg-card"
      tabIndex={0}
      role="region"
      aria-label={headers.join(", ")}
    >
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-foreground/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/50 p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  );
}
