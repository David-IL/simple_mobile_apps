---
name: project-penalty-chaos
description: Structure and quality bar of the penalty-chaos app (apps/penalty-chaos) — pure game logic vs React state layer, useful context for reviewing future PRs in this app
metadata:
  type: project
---

`apps/penalty-chaos` is a penalty-shootout game. Its `src/game/*` (engine.ts, match.ts,
disruptions.ts, keepers.ts, types.ts) is deliberately pure — no React, no I/O — and is
unusually well tested (engine.test.ts, match.test.ts) with tests written specifically as
regressions for bugs found in real playtesting (documented in code comments and in
`testing/*.md`). This layer is high quality: boundary conditions (zone splits, adjacency,
sudden-death early-finish) are correct and covered.

The persistence layer under `src/state/*` is where bugs actually live. `keeperRecord.ts` is
the reference-quality implementation: a module-level `writeQueue` promise chain does
read-modify-write directly against AsyncStorage (never against possibly-stale React state),
specifically to avoid two documented historical bugs (write queued inside a setState updater
lost on unmount; write serialized from in-memory state that started empty before load
resolved) — both explained in comments at the top of that file.

`keeperNames.ts` and `playerNames.ts` do **not** follow that same pattern — they write
`AsyncStorage.setItem` with the value returned by their own `setState(prev => ...)` updater,
and separately have a mount-time `AsyncStorage.getItem().then(setState(...))` load effect with
no guard against a load resolving after a more-recent local edit. This reintroduces a version
of the class-2 bug keeperRecord.ts's own comments describe as fixed elsewhere: if the load
resolves after the user has already typed (most reachable for `usePlayerNames`, since it
remounts every time `SetupScreen` remounts — e.g. via "Give up"/"Different keeper" — not just
once per app launch like `useKeeperNames`/`I18nProvider`), the load's `.then` callback
overwrites the freshly-typed state. Narrow timing window, not yet confirmed hit in the wild,
but worth checking again if a similar report ("my name field reset itself") ever comes in —
see [[feedback-penalty-chaos-review]].

Audio (`src/audio/SfxProvider.tsx`) is solid: one `useAudioPlayer` player per sound (required
since it's a hook), taunts made mutually exclusive by pausing siblings, volume re-applied at
play time (with a comment explaining why effect-only volume application is unreliable pre-load).
`GoalScene.tsx`'s ball-flight animation effect (around line 468) has no cleanup/stop on
unmount, so quitting mid-flight (the "Give up" hold button is reachable during any phase,
including "flying") lets the animation's completion callback fire after `MatchScreen` has
unmounted, producing a stray sound effect on the next screen.
