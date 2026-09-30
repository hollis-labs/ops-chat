# ops-chat

Chat-first control-plane shell for Nanite: a Vite + React 19 client over Nanite's HTTP API, built on `@hollis-labs/design-*` and `@hollis-labs/kit-chat`.

It is not: a Nanite backend, a second copy of Flux's full UI, or a place to keep state. Anything that needs persistence belongs in Nanite.

## Start Here

- `README.md` — what it does, how to run it, env vars.
- `src/App.tsx` — the shell (`AppShell` with session sidebar + chat view).
- `src/lib/nanite-api.ts` — the only place that knows Nanite's endpoints and response shapes.
- `src/lib/use-nanite-chat.tsx` — history load + SSE streaming; the `listen(...)` list is the seam for adding more event types.
- `vite.config.ts` — dev port and the `/api` proxy to Nanite.

## Commands

```sh
npm ci
npm run typecheck
npm run lint
npm run build      # tsc --noEmit && vite build
npm run dev        # http://localhost:5190, needs `nanite serve` on :8090
```

There is no test suite yet; typecheck, lint, and build are the gate.

## Boundaries

- Session creation and turns use `/api/harness/v1/*`. The legacy `POST /api/messages` and `GET /api/stream/:id` are deprecated; do not call them.
- History comes from `GET /api/sessions/{id}` because harness v1 has no messages-list operation. Replace it when one exists.
- Persisted assistant content is a JSON `StructuredMessage` (`{v, text, ...}`); streamed deltas are plain text. `extractText` unwraps the former — keep it tolerant of legacy raw text.
- Only `@hollis-labs/*` design/kit packages supply UI primitives. Do not vendor or fork them here; fix them upstream.
- No credentials, tokens, or session data in the bundle, `localStorage`, or committed files. The app is unauthenticated and assumes a trusted local Nanite.
- Out of scope for now: tool calls, envelopes/cards, approvals, plugin panels, settings. Add them deliberately, one event type at a time.
- Keep `package.json` `version` and `CHANGELOG.md` in step; do not `npm publish` (the package is `private`).
