/**
 * Shared types and constants for the public governance document archive.
 *
 * Client-safe: no Supabase client, no server-only imports. The category slugs
 * mirror the CHECK constraint on `public.governance_documents` — keep the two
 * in step.
 */

export const GOVERNANCE_CATEGORIES = [
  "agm",
  "code-of-ethics",
  "deib",
  "charter",
  "annual-report",
  "other",
] as const;

export type GovernanceCategory = (typeof GOVERNANCE_CATEGORIES)[number];

/** A published document as rendered on the public archive. */
export type GovernanceDocument = {
  id: string;
  title: string;
  description: string | null;
  category: GovernanceCategory;
  year: number | null;
  language: string;
  /** Signed storage URL, or the external link when the entry is a reference. */
  url: string | null;
  isExternal: boolean;
  fileSizeBytes: number | null;
  mimeType: string | null;
  documentDate: string | null;
};

/** Human file size. Returns null when the size is unknown. */
export function formatFileSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/** Short file-type label from a MIME type, e.g. "PDF". */
export function fileTypeLabel(mimeType: string | null): string | null {
  if (!mimeType) return null;
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("word")) return "DOC";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "XLS";
  if (mimeType.includes("presentation")) return "PPT";
  return mimeType.split("/").pop()?.toUpperCase() ?? null;
}

/** Group documents by year, newest first; undated documents come last. */
export function groupByYear(
  documents: GovernanceDocument[],
): Array<{ year: number | null; documents: GovernanceDocument[] }> {
  const groups = new Map<number | null, GovernanceDocument[]>();
  for (const doc of documents) {
    const key = doc.year ?? null;
    const bucket = groups.get(key);
    if (bucket) bucket.push(doc);
    else groups.set(key, [doc]);
  }
  return [...groups.entries()]
    .sort((a, b) => {
      if (a[0] === b[0]) return 0;
      if (a[0] === null) return 1;
      if (b[0] === null) return -1;
      return b[0] - a[0];
    })
    .map(([year, docs]) => ({ year, documents: docs }));
}
