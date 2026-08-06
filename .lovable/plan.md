# Chat assistant for the site

A single, always-available chat widget that answers questions about coaching, ICF Credentials, events, insights, communities and helps visitors find a coach. It can look up live site data instead of guessing, and it knows a little more when a member is signed in.

## What the visitor gets

- A launcher button in the bottom-right corner on every public page and in the Member Area.
- One ongoing conversation per visitor, restored from this browser when they come back. A "Start over" action clears it. Nothing is stored in the backend.
- Answers stream in as they are written, with a "Thinking..." state and a visible indicator when the assistant is looking something up ("Searching the coach directory").
- Replies are in the visitor's current site language (DE / FR / IT / EN), and link into the real pages: coach profiles, event pages, articles, community pages.
- Signed-in members get membership-aware answers (their own profile, communities in their region, how to volunteer or write for Insights). Signed-out visitors get the public view only.

## What the assistant can look up

Four read-only lookups, all restricted to already-public, published content:

1. Coach directory search — region, language, credential (ACC/PCC/MCC), specialisation, service — plus a single-profile read.
2. Upcoming events — filtered by category, region, language, format, with dates and links.
3. Insights articles — search titles/excerpts and read one article's body.
4. Communities and chapter pages — local communities plus a short curated knowledge base of the site's own copy (membership, credentials, for organisations, volunteering, contact).

When a member is signed in, one extra lookup returns their own profile summary and suggested communities, exactly the data the Member Area already shows them.

## Guardrails

- The assistant only answers about the chapter, coaching and ICF topics; other requests get a short, polite redirect.
- It never invents testimonials, statistics, coach names, prices or effectiveness claims — if a lookup returns nothing, it says so and offers the relevant page or office@coachingfederation.ch.
- It always says "The Switzerland Chapter of ICF", "ICF Credential", "credentialed coach".
- A short disclaimer under the composer: answers are AI-generated and may be incomplete.
- Rate-limit and credit errors surface as a clear message in the chat, not a silent failure.

## Design

Deep Blue launcher and header, bone panel, assistant text on the panel surface with no bubble, user messages in a Deep Blue bubble with white text. Rounded window mask, one brush-stroke mark as accent in the empty state, plus 3-4 suggested starter questions. Keyboard accessible, focus-visible, respects reduced motion, 44px touch targets, closes on Escape.

## Technical notes

- New dependencies: `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, and AI Elements chat primitives (conversation, message, prompt-input, shimmer, tool).
- Model: Lovable AI Gateway, `google/gemini-3.6-flash`, via a server-only provider helper in `src/lib/ai-gateway.server.ts`. `LOVABLE_API_KEY` stays server-side.
- Streaming endpoint: `src/routes/api/chat.ts` (`createFileRoute` + `server.handlers.POST`) using `streamText` + `toUIMessageStreamResponse`, with `stopWhen: stepCountIs(50)`.
- Tools defined in `src/lib/assistant/tools.server.ts`, reusing the existing public data layer (`directory.functions`, `events.functions`, `insights.functions`, `communities.functions`) and the anon Supabase client from `src/lib/supabase-public.server.ts`; member-scoped tools go through the caller's bearer token so RLS applies. No service-role key.
- Client: `src/components/assistant/AssistantWidget.tsx` with `useChat` + `DefaultChatTransport`, rendering `message.parts`; history in one localStorage key, restored via a hydration-safe read.
- Mounted once in `src/routes/__root.tsx` so it survives navigation; hidden on staff CMS routes.
- New locale namespace `assistant.json` for EN/DE/FR/IT (launcher label, placeholder, starters, disclaimer, errors); site language passed to the system prompt.

## PR note

**Summary** — Adds an AI assistant chat widget backed by Lovable AI, with read-only tools over the public coach directory, events, insights and communities, plus member-aware answers when signed in.

**Changes**
- UI: assistant widget + AI Elements primitives, root mount, four locale files.
- Backend: `/api/chat` streaming route, gateway provider helper, tool definitions over existing server data functions.
- Config: three AI SDK packages added.

**Backend / schema changes** — None. No new tables, no migrations, no RLS changes; all reads go through existing public views and policies.

**Testing & verification** — Signed-out and signed-in flows; each tool exercised with a real question; empty-result and no-match handling; reload restores the conversation; "Start over" clears it; all four languages; keyboard and mobile layout; rate-limit/credit error rendering.

**Risks & rollback** — Isolated new files plus one mount line in the root route; removing the mount disables the feature entirely. Model usage draws on workspace AI credits.

**Follow-ups / known debt** — No conversation persistence or transcript export; no analytics on questions asked; no per-visitor rate limiting beyond the gateway's own.