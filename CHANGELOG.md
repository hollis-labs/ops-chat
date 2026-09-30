# Changelog

All notable changes to Ops Chat are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0: minor bumps for additive surface, patch bumps for fixes and documentation.

## [Unreleased]

## [0.1.1] - 2026-09-30

### Added

- Open-source project documents: `README.md`, `AGENTS.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `TRADEMARK.md`, and this changelog. No runtime change.

## [0.1.0] - 2026-09-18

### Added

- MVP chat-first control-plane shell on the Hollis Labs design kit, wired to
  Nanite: session sidebar, streaming chat transcript, session creation and
  turn sending through Nanite's harness v1 API, and Markdown rendering via
  `@hollis-labs/kit-chat`.
- Dev server on port 5190 (`OPS_CHAT_UI_PORT`) proxying `/api` to Nanite on
  port 8090 (`NANITE_API_PORT`).
- MIT license.

[Unreleased]: https://github.com/hollis-labs/ops-chat/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/hollis-labs/ops-chat/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/hollis-labs/ops-chat/releases/tag/v0.1.0
