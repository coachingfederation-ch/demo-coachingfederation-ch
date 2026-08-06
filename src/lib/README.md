# `src/lib` module conventions

Three filename suffixes coexist here on purpose. They mark the server/client
boundary that TanStack Start enforces at build time, so the suffix is not
cosmetic — putting code in the wrong one breaks the bundle.

| Suffix | Runs where | May be imported by |
|---|---|---|
| `*.server.ts` | Server only | Other `*.server.ts` files and `*.functions.ts` handlers. **Never** by a component or route module. Blocked from client bundles by filename. |
| `*.functions.ts` | Declares `createServerFn` RPC endpoints | Components, routes and loaders. The declaration file ships to the client as a stub; the handler body stays on the server. |
| plain `*.ts` | Both | Anything. Browser-safe types, pure helpers, constants, zod schemas. |

So a feature typically spans three files, e.g. articles:

- `articles.ts` — shared types and formatting helpers
- `articles.server.ts` — database access, privileged logic
- `articles.functions.ts` — thin `createServerFn` wrappers the UI calls

## Rules

- A `*.functions.ts` file must stay a thin wrapper: only imports, types and
  exported server-function declarations at module scope. Runtime helpers,
  constants and mock data belong in an imported module, otherwise the server
  function splitter deletes them and you get a `ReferenceError` at runtime even
  though typecheck passes.
- Read `process.env.*` inside a `.handler()`, never at module scope.
- Client code reads config from `import.meta.env.VITE_*` only.
- Anything importing `@/integrations/supabase/client.server` (the admin client
  that bypasses RLS) must be `*.server.ts`, or must `await import()` it inside a
  handler after verifying the caller.