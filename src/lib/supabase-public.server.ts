/**
 * Anonymous (publishable-key) Supabase client for server-side public reads and
 * writes.
 *
 * Used instead of the admin client wherever RLS should still apply: public
 * directory reads, published-article reads, and the two unauthenticated form
 * endpoints. Anything this client can reach is, by definition, reachable by an
 * anonymous visitor — that is the point.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function publicSupabaseClient() {
  // Read inside the function: env injection happens at call time, not at
  // module scope.
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque `sb_` publishable keys are not JWTs; PostgREST rejects them as
      // a bearer token ("Expected 3 parts in JWT; got 1"), so send them as
      // `apikey` only.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}