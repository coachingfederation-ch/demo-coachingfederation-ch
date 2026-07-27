/**
 * ICF Global Chapter SOAP API client.
 *
 * Server-only. Credentials come from secrets and are selected by the current
 * integration mode, so a single runtime can point at TEST or LIVE without a
 * code change.
 */
import { XMLParser } from "fast-xml-parser";
import type { IntegrationMode } from "./integration";

export type NormalizedMember = {
  cst_recno: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  organisation: string | null;
  credential_slug: string | null;
  member_type: string | null;
  membership_join_date: string | null;
  membership_expiration_date: string | null;
};

/**
 * Every optional imported field defaults to null. The feed is the authoritative
 * full snapshot per run: an omitted tag means "no value", never "keep the old
 * value". History stays recoverable through member_import_snapshots.
 */
const EMPTY: Omit<NormalizedMember, "cst_recno"> = {
  first_name: null,
  last_name: null,
  full_name: null,
  email: null,
  phone: null,
  city: null,
  country: null,
  organisation: null,
  credential_slug: null,
  member_type: null,
  membership_join_date: null,
  membership_expiration_date: null,
};

export function soapCredentials(mode: IntegrationMode) {
  const prefix = mode === "live" ? "ICF_SOAP_LIVE" : "ICF_SOAP_TEST";
  const url = process.env[`${prefix}_URL`];
  const username = process.env[`${prefix}_USERNAME`];
  const password = process.env[`${prefix}_PASSWORD`];
  const chapterCode = process.env[`${prefix}_CHAPTER_CODE`] ?? "";
  if (!url || !username || !password) {
    throw new Error(
      `Missing ICF SOAP credentials for ${mode} mode (${prefix}_URL / _USERNAME / _PASSWORD).`,
    );
  }
  return { url, username, password, chapterCode };
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function date(value: unknown): string | null {
  const s = text(value);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  const lower = new Map(Object.keys(row).map((k) => [k.toLowerCase(), k]));
  for (const key of keys) {
    const actual = lower.get(key.toLowerCase());
    if (actual !== undefined) return row[actual];
  }
  return undefined;
}

export function normalizeMemberRow(row: Record<string, unknown>): NormalizedMember | null {
  const recno = text(pick(row, "cst_recno", "cstRecno", "RecordNumber"));
  if (!recno) return null;
  const first = text(pick(row, "cst_first_name", "FirstName", "first_name"));
  const last = text(pick(row, "cst_last_name", "LastName", "last_name"));
  const full = text(pick(row, "cst_full_name", "FullName", "full_name"));
  return {
    ...EMPTY,
    cst_recno: recno,
    first_name: first,
    last_name: last,
    full_name: full ?? ([first, last].filter(Boolean).join(" ") || null),
    email: text(pick(row, "cst_eml_address_dn", "Email", "email"))?.toLowerCase() ?? null,
    phone: text(pick(row, "cst_phn_number_complete_dn", "Phone", "phone")),
    city: text(pick(row, "cst_adr_city", "City", "city")),
    country: text(pick(row, "cst_adr_country", "Country", "country")),
    organisation: text(pick(row, "cst_organization", "Organization", "organisation")),
    credential_slug: text(pick(row, "credential", "cst_credential", "CredentialLevel"))?.toLowerCase() ?? null,
    member_type: text(pick(row, "member_type", "cst_member_type", "MemberType")),
    membership_join_date: date(pick(row, "membership_join_date", "JoinDate", "cst_join_date")),
    membership_expiration_date: date(
      pick(row, "membership_expiration_date", "ExpirationDate", "cst_expiration_date"),
    ),
  };
}

/** Locate the repeated member elements inside an arbitrarily nested SOAP body. */
function collectMemberRows(node: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectMemberRows(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  const hasRecno = Object.keys(record).some((k) => k.toLowerCase().includes("recno"));
  if (hasRecno) {
    out.push(record);
    return;
  }
  for (const value of Object.values(record)) collectMemberRows(value, out);
}

export function parseMemberFeed(xml: string): NormalizedMember[] {
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    trimValues: true,
    removeNSPrefix: true,
    processEntities: false,
  });
  const doc = parser.parse(xml);
  const rows: Record<string, unknown>[] = [];
  collectMemberRows(doc, rows);
  const seen = new Set<string>();
  const members: NormalizedMember[] = [];
  for (const row of rows) {
    const normalized = normalizeMemberRow(row);
    if (!normalized || seen.has(normalized.cst_recno)) continue;
    seen.add(normalized.cst_recno);
    members.push(normalized);
  }
  return members;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}

export async function fetchActiveMemberFeed(mode: IntegrationMode): Promise<NormalizedMember[]> {
  const { url, username, password, chapterCode } = soapCredentials(mode);
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetChapterMembers xmlns="http://www.icf.org/">
      <username>${escapeXml(username)}</username>
      <password>${escapeXml(password)}</password>
      <chapterCode>${escapeXml(chapterCode)}</chapterCode>
    </GetChapterMembers>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "http://www.icf.org/GetChapterMembers",
    },
    body: envelope,
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`ICF SOAP request failed with status ${response.status}`);
  }
  if (/<(\w+:)?Fault>/i.test(body)) {
    throw new Error("ICF SOAP endpoint returned a Fault response");
  }
  return parseMemberFeed(body);
}