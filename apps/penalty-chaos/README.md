# penalty-chaos

Flavor: **offline-only**

Five penalties against a keeper who taunts you and remembers where you put the last one.
Roughly every other shot, something gets in the way — and you are always told what, before
the run-up.

Research doc: [docs/research/penalty-chaos.md](../../docs/research/penalty-chaos.md)

## Run

```
pnpm install
pnpm --filter @apps/penalty-chaos start
```

```
pnpm --filter @apps/penalty-chaos test        # engine + match rules (vitest, pure logic only)
pnpm --filter @apps/penalty-chaos typecheck
```

## How it is put together

```
src/game/      pure logic, no React — engine, keeper archetypes, disruptions, match rules
src/state/     AsyncStorage-backed keeper renaming
src/components/ GoalScene (the pitch), Scoreboard, DisruptionBanner
src/screens/   Home → Setup → Match → Result
```

`src/game/` has no React imports on purpose: it is the part worth testing, and it is tested.
`resolveShot` and `chooseDive` both take an injected `rng`, which is what makes the fairness
properties assertable rather than vibes.

## Three rules that are load-bearing

1. **Disruptions are telegraphed before the run-up.** Never sprung mid-shot. This is the
   entire design conclusion of the research doc — a random event that punishes you after you
   have committed reads as cheating, not as a joke. If a new gag cannot be shown in advance,
   it is the wrong gag.
2. **The keeper commits before the player aims.** `setupRound()` picks the dive first, then
   the tell. That ordering is what makes the telegraph an honest read rather than decoration,
   and it is the counterweight to the keeper reading your shot pattern.
3. **No real people.** Every keeper is invented. Players may rename them, but that name lives
   on the device and never appears on a result card. See
   [ADR 8](../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md).

The drag → aim mapping lives in `aimFromDrag()` and is used by *both* the preview and the
engine. Keep it that way: if those two ever compute differently, every miss looks like the
game cheating.

## Checklist

- [ ] Wireframes in `docs/design/`
- [x] Screens implemented
- [x] Local persistence chosen (AsyncStorage, for keeper names only)
- [ ] Playtested by an actual 11-year-old
- [ ] Sound
- [ ] App icon + splash (still the Expo default)
- [ ] Play Store listing drafted — release restricted to Norway, see research doc §7
- [ ] First EAS build (`eas build -p android --profile preview`)
