import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled member sync endpoint, called by pg_cron via pg_net with the
 * project's publishable key in the `apikey` header. It never runs while a
 * cutover is in progress.
 */
export const Route = createFileRoute("/api/public/member-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        const provided = request.headers.get("apikey");
        if (!expected || provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { loadIntegrationConfigAdmin } = await import("@/lib/member-email.server");
        const config = await loadIntegrationConfigAdmin();
        if (config.cutover_in_progress) {
          return Response.json({ skipped: "cutover_in_progress" }, { status: 202 });
        }

        const { runMemberSync } = await import("@/lib/member-sync.server");
        const result = await runMemberSync({ triggerSource: "cron" });
        return Response.json(result, { status: result.status === "succeeded" ? 200 : 500 });
      },
    },
  },
});