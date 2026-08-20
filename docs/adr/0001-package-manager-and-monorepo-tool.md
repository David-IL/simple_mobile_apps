# 1. pnpm workspaces + Turborepo

- **Status:** accepted
- **Date:** 2026-08-20

## Context

The repo will hold several independent Expo apps plus shared packages. We need workspace
linking (apps importing `@repo/ui`) and a way to run lint/typecheck/test across only what
changed.

## Decision

pnpm workspaces for dependency management, Turborepo as the task runner.

- **pnpm over npm workspaces:** faster, disk-efficient via content-addressed store, and its
  strict `node_modules` layout prevents phantom dependencies. It is the best-supported
  workspace manager in the Expo/React Native monorepo ecosystem.
- **Turborepo over Nx:** simpler mental model and far less configuration for a hobby repo.
  Nx's generators and enforcement are valuable at team scale; here they are overhead. Turbo's
  `--filter=...[<base>]` affected-detection is the one feature we actually need, and it
  works out of the box.

## Consequences

- pnpm's symlinked `node_modules` requires each Expo app to have a `metro.config.js` that
  sets `watchFolders` and `nodeModulesPaths` to include the workspace root. The blueprint
  generator writes this automatically.
- **Gotcha, verified by bundling a test app:** Expo's published monorepo snippet also sets
  `resolver.disableHierarchicalLookup = true`. That snippet assumes a hoisted (npm/yarn)
  layout and **breaks under pnpm** — transitive deps live nested inside
  `.pnpm/<pkg>/node_modules`, so Metro fails to resolve them (`Unable to resolve module
  expo-modules-core`). The generated config deliberately omits that line.
- Turborepo remote caching is available but not configured — it needs an account and gains
  nothing for a single-developer repo.
- If the repo ever grows past ~10 apps or gets multiple contributors, revisit Nx.
