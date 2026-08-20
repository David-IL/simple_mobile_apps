# 7. Stay on React Native for games; scope mechanics to fit

- **Status:** accepted
- **Date:** 2026-08-20

## Context

This repo is Expo / React Native (see [ADR 1](0001-package-manager-and-monorepo-tool.md)),
and the blueprint generator scaffolds apps from `create-expo-app --template blank-typescript`
with no rendering dependencies beyond stock RN.

Some of the planned apps are small football games. The conventional advice for hypercasual is
Unity or Phaser, and it isn't wrong: those are built around a 60fps game loop with a canvas
and a physics engine, whereas React Native is built around a UI thread reconciling a component
tree. A game with many independently moving bodies, per-frame collision, or particle effects
is swimming upstream in RN.

The realistic options:

1. **Unity** — right tool for the genre, but a completely separate toolchain, language (C#),
   build pipeline, and CI story. It would sit outside the monorepo and outside everything this
   repo exists to teach (pnpm workspaces, EAS, GitHub Actions, the shared config packages).
2. **Phaser in a WebView** — reuses web skills, but means a webview bridge, awkward native
   integration for ads and storage, and worse feel on mid-range Android.
3. **React Native, with `react-native-reanimated` for animation and
   `@shopify/react-native-skia` when a canvas is genuinely needed.** Skia gives a real
   immediate-mode drawing surface and runs its render loop off the JS thread.

## Decision

Games stay in React Native, in this monorepo, on the existing pipeline.

Mechanics get scoped to what RN does well rather than fighting the framework: one-tap timing,
reaction and precision taps, tap targets, drag-and-release aiming, card and grid interactions,
simple tween-driven motion. These cover a lot of football-game ideas — penalty timing, keepy-
uppy rhythm, shot placement, reaction drills, formation puzzles.

Reach for tooling in order:

- Layout, `Pressable`, and `Animated` for anything that isn't per-frame.
- `react-native-reanimated` when animation must run on the UI thread.
- `@shopify/react-native-skia` when a game genuinely needs a canvas — added per app that needs
  it, not baked into the blueprint scaffold.

If an idea genuinely requires a physics engine and dozens of moving bodies, that is a signal
to change the idea, not the stack.

## Consequences

- One toolchain, one CI pipeline, one deployment story across every app in the repo — which is
  the point of the repo. Learning happens in the pipeline, not in a second engine.
- Shared code in `packages/ui/` stays usable by games as well as utility apps.
- Genuinely rules out some game types. Physics-heavy or twitch-action concepts are off the
  table, and that constraint should be applied at the research stage rather than discovered
  mid-build.
- Performance on low-end Android needs actual testing on a real device, not just the dev
  machine. A game that stutters is not shippable, and RN gives more ways to accidentally
  stutter than a game engine does.
- Revisit if a game idea worth building keeps hitting the ceiling. Rewriting one game in Unity
  later is a smaller cost than adopting a second toolchain now for a game that may not exist.
