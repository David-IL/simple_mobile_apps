# simple_mobile_apps

A monorepo for building small mobile apps end-to-end — idea validation, design, code, CI,
and Play Store deployment — as a hands-on way to learn mobile development.

**Stack:** Expo / React Native (TypeScript), pnpm workspaces + Turborepo, GitHub Actions, EAS Build.
**Platforms:** Android first. iOS is not implemented, but nothing here forecloses it.

## Why this repo exists

A hobby project with two goals: learn the full mobile pipeline hands-on, and build something
my 11-year-old son and I can share. He is an obsessive football player and thinker, and I am
an assistant coach on his team — so the apps here lean football/soccer: hypercasual games
(one mechanic, one screen, infinite replayability) and other small football-adjacent tools.
He is the first playtester and a source of ideas; the apps being small is the point, since
the learning is in shipping them end-to-end.

Ads are treated as something to learn to integrate, not a revenue plan — see
[ADR 6](docs/adr/0006-monetization-is-a-learning-goal.md). Games stay in React Native and get
scoped to fit it, rather than pulling in a second engine — see
[ADR 7](docs/adr/0007-game-rendering-approach.md).

## Layout

| Path | Purpose |
| --- | --- |
| `apps/` | One directory per app, scaffolded by the blueprint generator |
| `packages/config/` | Shared ESLint / TypeScript / Prettier config every app extends |
| `packages/ui/` | Shared React Native components |
| `blueprint/` | CLI that scaffolds new apps and research docs, plus the research template |
| `docs/research/` | One market-research doc per app idea |
| `docs/design/` | Wireframes (`.excalidraw`, editable in VS Code) |
| `docs/adr/` | Architecture decision records |
| `docs/reference/` | Researched external constraints (e.g. Play Families policy) with sources |
| `.claude/skills/` | Repo workflow skills for Claude Code (e.g. `/validate-idea`) |
| `.github/workflows/` | CI (lint/typecheck/test) and EAS build/submit |

## Quickstart

```bash
pnpm install

# 1. Validate an idea before writing any code
/validate-idea a penalty-timing game   # in Claude Code: researches and fills the doc
pnpm blueprint:research                # or create an empty doc to fill in by hand

# 2. Once you set the research doc's status to "proceed", scaffold the app
pnpm blueprint:new

# 3. Run it
pnpm --filter @apps/<slug> start
```

Repo-wide checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Process

See [WORKFLOW.md](WORKFLOW.md) for the idea → research → design → build → ship pipeline
and what setup you still need to do yourself (Expo account, Play Console, GitHub secrets).
