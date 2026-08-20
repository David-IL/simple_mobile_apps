# 2. Start with two shared packages, not a shared framework

- **Status:** accepted
- **Date:** 2026-08-20

## Context

The stated goal is to reuse as much as possible across apps: UI, backend helpers, deployment
scripts. The temptation is to build all of that up front. But the repo currently has zero
apps, so any shared abstraction would be designed against imagined requirements.

## Decision

Create only `packages/config` (ESLint/TypeScript/Prettier) and `packages/ui` (components).
Both are things every app provably needs on day one.

Explicitly **not** created:

- `packages/api-client` or any shared backend layer — no app has a backend yet, and the
  first one that does should define the shape.
- Design tokens / theming — one placeholder component doesn't justify a design system.
- Shared deployment scripts beyond the GitHub Actions workflows — EAS already covers the
  build/submit steps; a wrapper script would add indirection without value.

## Consequences

- The first two or three apps will contain some duplication. That is intended: extract to
  `packages/` on the *second* real occurrence, not the first imagined one.
- The "reuse" goal is served primarily by `packages/config` + the blueprint generator + CI,
  which is where the repetition actually is, rather than by a large shared runtime library.
