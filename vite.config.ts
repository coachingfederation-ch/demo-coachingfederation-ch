// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Server-side code (email routes) needs non-VITE_ env vars in process.env.
// These are never added to the client define block.
Object.assign(process.env, loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), ""));

export default defineConfig({
  plugins: [mcpPlugin()],
  vite: {
    resolve: {
      alias: {
        // React Email's htmlparser2 path needs entities v4.5.0; pin every
        // import to the hoisted copy so a nested v5+ copy can't break SSR.
        "entities/lib/decode.js": path.resolve(
          import.meta.dirname,
          "node_modules/entities/lib/decode.js",
        ),
        "entities/lib/encode.js": path.resolve(
          import.meta.dirname,
          "node_modules/entities/lib/encode.js",
        ),
        // parse5 v7 (via rehype-raw/hast-util-raw) needs entities v6 subpath
        // exports, which v4.5.0 doesn't provide. Point those subpaths at the
        // nested v6 copy so the broad `entities` alias below can't swallow them.
        "entities/escape": path.resolve(
          import.meta.dirname,
          "node_modules/parse5/node_modules/entities/dist/esm/escape.js",
        ),
        "entities/decode": path.resolve(
          import.meta.dirname,
          "node_modules/parse5/node_modules/entities/dist/esm/decode.js",
        ),
        entities: path.resolve(import.meta.dirname, "node_modules/entities"),
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
