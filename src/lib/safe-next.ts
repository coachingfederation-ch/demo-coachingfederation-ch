/**
 * A post-sign-in return target carried through the auth flow (used by the
 * OAuth consent screen so an MCP client authorization survives login).
 *
 * Only same-origin relative paths are ever honoured — anything else is an
 * open-redirect and is dropped.
 */
export function safeNext(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}