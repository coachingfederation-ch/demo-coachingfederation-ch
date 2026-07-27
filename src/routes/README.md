# Route conventions

File-based routing (TanStack Router). `src/routeTree.gen.ts` is generated —
never edit it.

## Naming

| Pattern | Meaning |
|---|---|
| `about.tsx` | Static path `/about`. |
| `coach.$profileId.tsx` | Dynamic segment → `/coach/:profileId`. |
| `insights.index.tsx` | The index of `/insights`, alongside `insights.$id.tsx`. |
| `_staff/`, `_member/` | Pathless layouts. They add a gate and a shell, not a URL segment. |
| `$locale/` | Localized mirrors: `/de/about`, `/fr/about`, `/it/about`. |
| `api/public/*` | Raw HTTP handlers for external callers. This prefix bypasses site auth — verify the caller inside the handler. |

Every parent route (including pathless ones) must render `<Outlet />`.

## Adding a public page

1. Put the page body in `src/pages/`.
2. Add `src/routes/<name>.tsx` (English, unprefixed).
3. Add `src/routes/$locale/<name>.tsx` rendering the same component.
4. Add copy keys to all four dictionaries in `src/i18n`.
5. Give the route its own `head()` with a unique title, description and OG
   tags. `__root` does not count.
6. Link to it with `<LocaleLink>`, not `<Link>`, so visitors stay in their
   language.

## Loaders

Loaders are isomorphic — they run on the client too. Database access and
secrets belong in a server function, never inline in a loader.

Never call a `requireSupabaseAuth`-protected server function from a public
route's loader: SSR and prerender have no session and it will throw
`Unauthorized`. Call it from the component with `useServerFn`, or place the
route under `_staff` / `_member`, where the gate runs first.