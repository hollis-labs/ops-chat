# Contributing

How a change gets from your clone into `main`. This is deliberately short: most
of what you need is written somewhere closer to the thing it describes.

## Before your first change

`README.md` has the clone-and-run steps. You need a running Nanite backend to
see anything in the UI; the README shows the command.

`AGENTS.md` is the fastest orientation to the layout and to the boundaries that
are not obvious from reading the code.

## The sequence

1. **Branch.** `<type>/<short-slug>`, where the type matches the change —
   `feat`, `fix`, `docs`, `chore`. Nothing enforces this; it is what the
   history does.
2. **Change one thing.** A branch carrying two unrelated changes costs the
   reviewer the ability to accept one and question the other.
3. **Run the checks** before you push:
   ```
   npm run typecheck && npm run lint && npm run build
   ```
   There is no test suite yet, so also exercise the change against a real
   Nanite and say what you did.
4. **Push and open a pull request.** A maintainer will review it.

Commit subjects follow the conventional-commit shape — a type, an optional
scope, a colon, then the summary.

## What a pull request should carry

The reviewer was not there when you made the decisions. State what the change
does, what it deliberately leaves alone, and the evidence that it works — the
commands you ran and what came back, not a claim that it passes. For a UI
change, describe what you saw in the browser.

Add a line to `CHANGELOG.md` under `[Unreleased]`.

## The one that cannot be undone

**Do not commit credentials or real session data.** Ops Chat talks to a backend
that holds prompts, tool output, and provider keys. Screenshots, fixtures, and
logs you attach to an issue or PR must be scrubbed; a secret pushed to a public
branch should be treated as leaked even if you delete it afterwards.

## Things that surprise people

- **`/api` is a dev-server proxy**, not something this repo serves. A built
  bundle needs `/api` on the same origin.
- **Only harness v1 endpoints are used for writes.** The legacy message
  endpoints are deprecated; see `AGENTS.md`.
- **Persisted assistant messages are JSON-wrapped**, streamed ones are not.
- **UI primitives come from `@hollis-labs/design-*`.** Missing component? Fix
  it in the kit, not with a local copy.

## What this does not cover

- **Which change is worth making.** Open an issue to discuss larger features
  before building them.
- **Nanite itself.** Backend bugs belong in the Nanite repository.
- **Releases.** Maintainers cut those.
