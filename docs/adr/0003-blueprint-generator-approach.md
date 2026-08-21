# 3. Blueprint generator delegates to create-expo-app

- **Status:** accepted
- **Date:** 2026-08-20

## Context

We want a repeatable way to start a new app: consistent config, workspace wiring, Android
package id, and a link back to its research doc. The obvious alternative is to vendor a full
Expo app template in `blueprint/templates/`.

## Decision

`blueprint/src/create-app.ts` shells out to `npx create-expo-app@latest --template
blank-typescript`, then post-processes the result: workspace package name, shared config
extends, `metro.config.js` for pnpm symlinks, `app.json` slug + Android package, per-app
README checklist, and (for the backend flavor) a `.env.example` stub.

The offline/backend choice is **not** a separate template. It only toggles the `.env.example`
stub and a line in the generated checklist. Making it a real template fork would duplicate
maintenance for a difference that is mostly a design decision, not a code one.

## Consequences

- Scaffolding requires network access, and new apps always land on the current Expo SDK
  rather than a stale vendored copy. This is the main reason for the choice.
- Post-processing is coupled to `create-expo-app`'s output shape (`package.json`, `app.json`).
  If Expo changes that layout, `wireWorkspace()` needs updating — it is one function.
- Apps scaffolded months apart may be on different Expo SDKs. Acceptable for independent apps.
- Shelling out is fiddly in two specific ways, both found the hard way scaffolding the first
  real app (`penalty-chaos`, 2026-08-21) and both now fixed in `scaffoldExpoApp()`:
  - **Do not spawn `npx.cmd` directly on Windows.** Node ≥ 18.20.2 / 20.12.2 hardened
    `.cmd`/`.bat` spawning for CVE-2024-27980, so `execFileSync("npx.cmd", …)` throws
    `spawnSync npx.cmd EINVAL`. Go through `cmd.exe /c` instead. `shell: true` also works but
    emits a DEP0190 warning on every scaffold.
  - **Set `CI=1`.** This is a git repo, so `create-expo-app` asks "Skip initializing a new git
    repository?" *after* writing the files, and that prompt fails the call when there is no
    TTY. Its own `--yes` flag does not cover that prompt.
