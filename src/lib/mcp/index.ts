/**
 * MCP server definition — the tool surface assistants (ChatGPT, Claude,
 * Cursor…) get when they connect to this app.
 *
 * Callers sign in as a real The Switzerland Chapter of ICF account over OAuth 2.1 and every
 * query runs under that user's RLS, so the MCP surface can never see more than
 * the same person would in the browser.
 *
 * Import-safe by design: no env reads or I/O at module scope.
 */
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getCoachProfile from "./tools/get-coach-profile";
import getInsight from "./tools/get-insight";
import listInsights from "./tools/list-insights";
import searchCoaches from "./tools/search-coaches";

// The OAuth issuer must be the direct Supabase host: on publish SUPABASE_URL is
// rewritten to a proxy that fails RFC 8414 issuer matching. The project ref is
// inlined at build time by Vite.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "icf-switzerland",
  title: "The Switzerland Chapter of ICF",
  version: "0.1.0",
  instructions:
    "Tools for the The Switzerland Chapter of ICF website. Use `search_coaches` to find credentialed coaches in the public directory and `get_coach_profile` for a full profile. Use `list_insights` and `get_insight` to read published Insights articles.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchCoaches, getCoachProfile, listInsights, getInsight],
});
