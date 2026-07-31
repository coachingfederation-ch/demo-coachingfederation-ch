import { createFileRoute } from "@tanstack/react-router";

/**
 * Weekly Europe Pulse scan endpoint, called by pg_cron via pg_net.
 *
 * Auth is the same server-only cron token pattern as the member sync: a shared
 * secret in `x-cron-token`, never the publishable key (which ships to every
 * browser and would let anyone burn Firecrawl and AI credits).
 */
export const Route = createFileRoute("/api/public/europe-pulse-scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.MEMBER_SYNC_CRON_TOKEN;
        const provided = request.headers.get("x-cron-token");
        if (!expected || !provided || provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runEuropePulse } = await import("@/lib/europe-pulse.server");
        const result = await runEuropePulse({ triggerSource: "cron" });
        return Response.json(result, { status: result.status === "succeeded" ? 200 : 500 });
      },
    },
  },
});