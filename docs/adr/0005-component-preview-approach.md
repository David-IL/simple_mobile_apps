# 5. Defer Storybook; preview components in a real app

- **Status:** accepted
- **Date:** 2026-08-20

## Context

The goal is to do design work inside VS Code. Storybook for React Native was the initial
plan for `packages/ui` — with a `react-native-web` target, stories render in a browser tab
openable from VS Code's Simple Browser, no emulator needed.

## Decision

Defer it. `packages/ui` currently has one placeholder component and there are no apps.
Storybook for RN in a pnpm monorepo requires its own bundler config, a `react-native-web`
dependency tree, and a story-loading setup — a meaningful amount of machinery to maintain
for a library that nothing imports yet.

Until then: preview components by rendering them in the app that uses them, via Expo Go
with fast refresh. Wireframing happens in `docs/design/*.excalidraw` (Excalidraw VS Code
extension), which needs no build step at all.

## Revisit when

`packages/ui` holds components used by two or more apps, or when a component has enough
states (loading/error/empty/disabled) that clicking through them in a real app becomes the
slow part. At that point add `@storybook/react-native` plus a `react-native-web` build in
`packages/ui` and expose it as a `pnpm --filter @repo/ui storybook` script.
