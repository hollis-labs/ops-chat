# Ops Chat

A chat-first control-plane shell for [Nanite](https://github.com/hollis-labs/nanite),
built on the Hollis Labs design kit. It is a small Vite + React app: a session
sidebar on the left, a streaming chat transcript on the right, and nothing
else yet.

> **Early MVP.** Ops Chat covers the smallest useful slice of Nanite's chat
> contract — list sessions, start one, send a turn, watch the reply stream in.
> Tool calls, envelopes/cards, approvals, and the rest of Nanite's event types
> are deliberately not rendered yet. Interfaces change without notice.

## What it does

- Lists Nanite sessions (`GET /api/sessions`) and loads a session's history.
- Creates a session against an agent via Nanite's harness v1 API
  (`POST /api/harness/v1/sessions`).
- Sends a turn (`POST /api/harness/v1/sessions/{id}/turns`) and renders the
  reply as it arrives over server-sent events, including cancel.
- Renders transcript content as Markdown through `@hollis-labs/kit-chat`.

It is a pure client. All state lives in Nanite; Ops Chat stores nothing of its
own and has no authentication of its own.

## Run it

Requirements: a current Node LTS and a running Nanite backend.

```bash
# Terminal 1, in nanite/
go run ./cmd/nanite serve -port 8090 -db ./nanite.db

# Terminal 2, here
npm ci
npm run dev   # http://localhost:5190, proxies /api to Nanite at :8090
```

| Variable | Default | Purpose |
|---|---|---|
| `OPS_CHAT_UI_PORT` | `5190` | Port for the Vite dev server |
| `NANITE_API_PORT` | `8090` | Port of the Nanite backend the dev server proxies `/api` to |

The proxy is configured in `vite.config.ts`. There is no production server in
this repo: `npm run build` produces a static bundle in `dist/` that expects
`/api` to be served from the same origin (for example by a reverse proxy in
front of Nanite).

## Scripts

```bash
npm run dev         # vite dev server
npm run build       # tsc --noEmit && vite build
npm run typecheck   # tsc --noEmit
npm run lint        # biome check .
npm run lint:fix    # biome check --write .
```

## Layout

- `src/App.tsx` — shell: session sidebar + chat view.
- `src/components/` — `SessionSidebar`, `ChatView`.
- `src/lib/nanite-api.ts` — typed client for the Nanite endpoints above.
- `src/lib/use-nanite-chat.tsx` — history loading and SSE streaming hook.

Dependencies on the `@hollis-labs/design-*` and `@hollis-labs/kit-chat`
packages come from the public npm registry.

## Project docs

[`AGENTS.md`](AGENTS.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md) ·
[`SECURITY.md`](SECURITY.md) · [`CHANGELOG.md`](CHANGELOG.md) ·
[`TRADEMARK.md`](TRADEMARK.md)

## License

MIT — see [`LICENSE`](LICENSE). The name and branding are covered separately
by [`TRADEMARK.md`](TRADEMARK.md).
