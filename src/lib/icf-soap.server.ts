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

/**
 * ICF runs a netFORUM xWeb service: `Signon.asmx` issues a token, then
 * `netFORUMXML.asmx` executes a named web method with that token in a SOAP
 * header. Every value below is a server-only secret and is never logged.
 */
export function soapCredentials(mode: IntegrationMode) {
  const prefix = mode === "live" ? "ICF_SOAP_LIVE" : "ICF_SOAP_TEST";
  const baseUrl = (process.env[`${prefix}_BASE_URL`] ?? "").replace(/\/+$/, "");
  const username = process.env[`${prefix}_USERNAME`];
  const password = process.env[`${prefix}_PASSWORD`];
  const cstKey = process.env[`${prefix}_CST_KEY`];
  if (!baseUrl || !username || !password || !cstKey) {
    throw new Error(
      `Missing ICF API credentials for ${mode} mode (${prefix}_BASE_URL / _USERNAME / _PASSWORD / _CST_KEY).`,
    );
  }
  return {
    signonUrl: `${baseUrl}/Signon.asmx`,
    executeUrl: `${baseUrl}/netFORUMXML.asmx`,
    username,
    password,
    cstKey,
  };
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

/** netFORUM xWeb namespace, shared by Signon.asmx and netFORUMXML.asmx. */
const XWEB_NS = "http://www.avectra.com/2005/";

export const WEB_SERVICE_NAME = "ICF_Chapter_API";
export const WEB_METHOD = "GetIndividualInfoHavingChapterRelationship";

/**
 * Credentials never leave this module: they are read from server-only env vars
 * inside the request and are never logged. Fault bodies are not echoed back to
 * callers, because a fault can quote the request envelope (and its token).
 */
async function callSoap(
  url: string,
  operation: string,
  bodyXml: string,
  headerXml = "",
): Promise<string> {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Header>${headerXml}</soap:Header>
  <soap:Body>${bodyXml}</soap:Body>
</soap:Envelope>`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${XWEB_NS}${operation}`,
    },
    body: envelope,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`ICF ${operation} failed with status ${response.status}`);
  }
  if (/<(\w+:)?Fault>/i.test(text)) {
    throw new Error(`ICF ${operation} returned a Fault response`);
  }
  return text;
}

function xmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    trimValues: true,
    removeNSPrefix: true,
    processEntities: false,
  });
}

/** Depth-first search for the first non-empty token-shaped value. */
function findToken(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (/(token|authenticateresult|sessionid)/i.test(key) && value && typeof value !== "object") {
      const s = String(value).trim();
      if (s && s.toLowerCase() !== "null") return s;
    }
    const nested = findToken(value);
    if (nested) return nested;
  }
  return null;
}

/**
 * Step 1 — Authenticate against Signon.asmx and return the session token that
 * every subsequent Execute call must carry.
 */
export async function authenticate(mode: IntegrationMode): Promise<string> {
  const { signonUrl, username, password } = soapCredentials(mode);
  const body = await callSoap(
    signonUrl,
    "Authenticate",
    `<Authenticate xmlns="${XWEB_NS}"><userName>${escapeXml(username)}</userName><password>${escapeXml(password)}</password></Authenticate>`,
  );
  const token = findToken(xmlParser().parse(body));
  if (!token) throw new Error("ICF Authenticate returned no token.");
  return token;
}

/**
 * Step 2 — Execute `ICF_Chapter_API.GetIndividualInfoHavingChapterRelationship`
 * with the chapter's cst_key. The response is treated as the authoritative full
 * active-member snapshot for the run.
 */
export async function fetchActiveMemberFeed(mode: IntegrationMode): Promise<NormalizedMember[]> {
  const { executeUrl, cstKey } = soapCredentials(mode);
  const token = await authenticate(mode);

  const body = await callSoap(
    executeUrl,
    "ExecuteMethod",
    `<ExecuteMethod xmlns="${XWEB_NS}">
      <objectName>${WEB_SERVICE_NAME}</objectName>
      <methodName>${WEB_METHOD}</methodName>
      <parameters>
        <string>cst_key</string>
        <string>${escapeXml(cstKey)}</string>
      </parameters>
    </ExecuteMethod>`,
    `<AuthorizationToken xmlns="${XWEB_NS}"><Token>${escapeXml(token)}</Token></AuthorizationToken>`,
  );
  return parseMemberFeed(body);
}