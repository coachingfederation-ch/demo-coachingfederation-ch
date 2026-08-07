/**
 * One document in the governance archive: title, description and a download or
 * external link. Rendered as a list item so the archive stays a real list for
 * screen readers.
 */
import { Download, ExternalLink, FileText } from "lucide-react";
import { fileTypeLabel, formatFileSize, type GovernanceDocument } from "@/lib/governance";
import { useI18n } from "@/i18n";

export function DocumentRow({ doc }: { doc: GovernanceDocument }) {
  const { t } = useI18n();
  const type = fileTypeLabel(doc.mimeType);
  const size = formatFileSize(doc.fileSizeBytes);
  const meta = [type, size].filter(Boolean).join(" · ");

  return (
    <li className="rounded-2xl border border-border/70 bg-card p-5 transition hover:shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span
            className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"
            aria-hidden
          >
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">{doc.title}</h3>
            {doc.description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {doc.description}
              </p>
            ) : null}
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              {[doc.year ? String(doc.year) : null, doc.language.toUpperCase(), meta || null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        {doc.url ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {doc.isExternal ? t("governance.open") : t("governance.download")}
            <span className="sr-only"> — {doc.title}</span>
            {doc.isExternal ? (
              <ExternalLink className="h-4 w-4" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
          </a>
        ) : (
          <span className="shrink-0 text-sm text-muted-foreground">
            {t("governance.unavailable")}
          </span>
        )}
      </div>
    </li>
  );
}
