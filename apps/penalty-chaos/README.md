# penalty-chaos

Flavor: **offline-only**

Five penalties against a keeper who taunts you and remembers where you put the last one.
Roughly every other shot, something gets in the way — and you are always told what, before
the run-up.

Norwegian and English. Norwegian is the default on a Norwegian phone.

Research doc: [docs/research/penalty-chaos.md](../../docs/research/penalty-chaos.md) ·
Wireframes: [docs/design/penalty-chaos.excalidraw](../../docs/design/penalty-chaos.excalidraw)

## Run

```
pnpm install
pnpm --filter @apps/penalty-chaos start
```

```
pnpm --filter @apps/penalty-chaos test        # engine + match rules (vitest, pure logic only)
pnpm --filter @apps/penalty-chaos typecheck
```

**Expo Go must match the SDK.** This app is SDK 57 and the Play Store build of Expo Go is
older, so it will refuse to open the project. Sideload the matching APK from
[expo/expo-go-releases](https://github.com/expo/expo-go-releases) — updating from the Play
Store does not help. See [ADR 3](../../docs/adr/0003-blueprint-generator-approach.md).

## How it is put together

```
src/game/       pure logic, no React, no copy, no colours — engine, keeper
                archetypes, disruptions, match rules
src/i18n/       en + nb message bundles, typed so a gap is a compile error
src/audio/      sound roster + SfxProvider
src/state/      AsyncStorage-backed keeper renaming
src/components/ GoalScene (the pitch), Scoreboard, DisruptionBanner
src/components/art/  SVG figures + keeperLooks (build, shirt, squad number)
src/screens/    Home → Setup → Match → Result
```

`src/game/` has no React imports and no display copy on purpose: it is the part worth
testing, and it is tested. `resolveShot` and `chooseDive` both take an injected `rng`, which
is what makes the fairness properties assertable rather than vibes.

## Four rules that are load-bearing

1. **Disruptions are telegraphed before the run-up.** Never sprung mid-shot. This is the
   entire design conclusion of the research doc — a random event that punishes you after you
   have committed reads as cheating, not as a joke. If a new gag cannot be shown in advance,
   it is the wrong gag.
2. **The keeper commits before the player aims.** `setupRound()` picks the dive first, then
   the tell. That ordering is what makes the telegraph an honest read rather than decoration,
   and it is the counterweight to the keeper reading your shot pattern.
3. **A read needs a genuine repeat.** `readablePattern()` requires a zone to appear at least
   twice *and* beat every other zone outright. An earlier version broke ties toward the most
   recent shot, which meant an unread keeper just shadowed your last shot — beatable by one
   trivial rule. There is a regression test for the exact sequence that exposed it.
4. **No real people.** Every keeper is invented. Players may rename them, but that name lives
   on the device and never appears on a result card. See
   [ADR 8](../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md).

Two seams worth not breaking:

- **`aimFromDrag()` is used by both the preview and the engine.** If those ever compute
  differently, every miss looks like the game cheating.
- **Art components are pure and static.** `KeeperFigure` takes a `pose` and draws it; movement
  belongs to the caller's `Animated` transforms. The mascot's wiggle is the one documented
  exception. See [ADR 9](../../docs/adr/0009-svg-for-character-art.md).
- **`src/game/` holds no copy and no colours.** Names and taunts are in `src/i18n`; shirt,
  build and squad number are in `src/components/art/keeperLooks.ts`. Both keyed by keeper id.
  A keeper's *build* is meant to say what its parameters do — The Wall is the widest figure
  because `reach` is his mechanic.

## Checklist

- [x] Wireframes in `docs/design/`
- [x] Screens implemented
- [x] Local persistence chosen (AsyncStorage — keeper names and language only)
- [x] Norwegian + English ([ADR 10](../../docs/adr/0010-localisation-typed-bundles.md))
- [x] Character art ([ADR 9](../../docs/adr/0009-svg-for-character-art.md))
- [ ] Playtested in Norwegian by the actual 11-year-old
- [ ] Real-device performance check on the SVG version
- [x] Sound *integration* — `expo-audio`, mute toggle, respects the ringer switch
- [ ] Sound *assets* — all 8 files are synthesised placeholders; see
      [assets/sfx/README.md](assets/sfx/README.md) for what each needs and the licence rules
- [ ] App icon + splash (still the Expo default)
- [ ] Play Store listing drafted — release restricted to Norway, see research doc §7
- [ ] First EAS build (`eas build -p android --profile preview`)
