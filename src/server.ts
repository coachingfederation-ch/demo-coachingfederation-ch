/**
 * Server entry point for TanStack Start.
 * Exports: default fetch handler. Manages SSR entry loading and catastrophic error normalization.
 */

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
  request: Request,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  // The client hung up mid-render (reload, fast navigation, HMR). That is not an
  // application failure: nobody is left to receive a body, so drop the captured
  // error instead of logging it and reporting a bogus blank screen.
  const captured = consumeLastCapturedError();
  if (isClientAbort(request, captured)) {
    return new Response(null, { status: 499 });
  }

  console.error(captured ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** True when the failure is just the browser cancelling the in-flight request. */
function isClientAbort(request: Request, error: unknown): boolean {
  if (request.signal?.aborted) return true;
  for (let current = error, depth = 0; current && depth < 5; depth += 1) {
    const candidate = current as { name?: unknown; code?: unknown; message?: unknown; cause?: unknown };
    if (candidate.name === "AbortError") return true;
    if (candidate.code === "ECONNRESET" || candidate.code === "ECONNABORTED") return true;
    if (typeof candidate.message === "string" && candidate.message.trim() === "aborted") return true;
    current = candidate.cause;
  }
  return false;
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response, request);
    } catch (error) {
      if (isClientAbort(request, error)) return new Response(null, { status: 499 });
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
