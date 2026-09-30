# Security policy

## Supported versions

Ops Chat is pre-1.0 software. Security fixes are made on `main` and released in
the next patch version. Older versions do not receive backports.

## Report a vulnerability

Do not include an exploit, token, session transcript, database, or provider
credential in a public issue.

Use GitHub's private vulnerability-reporting flow when the repository's
Security tab offers it. If it is unavailable, contact a repository maintainer
privately through a contact channel published on the Hollis Labs organization
or maintainer profile. Include:

- the affected commit or version, browser, and operating system
- how you reach the Nanite backend (local, reverse proxy, remote)
- reproduction steps and the security impact
- whether credentials or conversation data may have been exposed
- a safe way to contact you about coordination

Maintainers will acknowledge a private report, investigate it, and coordinate
disclosure; response times are best effort.

## Deployment boundary

Ops Chat is a static browser client. It has no server component, no accounts,
and no authentication of its own; it forwards `/api` requests to a Nanite
backend and renders what comes back.

- The dev server (`npm run dev`) is for local development only. Do not expose
  it to a network.
- Whatever can reach the UI can use it as the Nanite user: list sessions, read
  transcripts, and send turns to agents that may run tools. Authentication and
  TLS are the responsibility of the Nanite deployment and any reverse proxy in
  front of it. Nanite is designed as a single-user local application; see its
  own security documentation before exposing it.
- Serve a built bundle from the same origin as `/api` so browser origin
  protections apply.

## Data handling

Ops Chat stores nothing in `localStorage`, cookies, or files. Session
transcripts are fetched from Nanite and held in memory while the page is open.
Transcript Markdown is rendered through `@hollis-labs/kit-chat`; model output
is untrusted content, so report any way it can execute script or load remote
resources.

## Current security limitations

- no built-in authentication, TLS, or access control
- assumes a trusted, single-user Nanite backend
- pre-1.0 contracts; the Nanite API it depends on can change
