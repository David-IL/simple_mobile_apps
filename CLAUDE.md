# simple_mobile_apps

Monorepo of small Expo/React Native apps, built as a hands-on way to learn mobile
development end-to-end. Android-first. Process lives in [WORKFLOW.md](WORKFLOW.md);
decisions and their reasoning live in [docs/adr/](docs/adr/) — read those before
re-litigating an architectural choice.

## Layout

`apps/<slug>` — one app each, scaffolded by `pnpm blueprint:new`, never by hand.
`packages/config` — shared ESLint/TS/Prettier. `packages/ui` — shared components.
`blueprint/` — the generators. `docs/` — research, design, ADRs.

## Commands

```
pnpm lint | typecheck | test      # turbo, whole workspace
pnpm --filter @apps/<slug> start  # Metro + Expo Go
pnpm blueprint:research | blueprint:new
```

Both generators also take positional args (`<slug> [title|flavor]`) to skip the prompts.

## Domain

The apps lean football/soccer — small games and football-adjacent tools. David's 11-year-old
son is the first playtester and a source of ideas; building things together is half the point.

**Success is: it shipped, it works, someone actually used it, and something new was learned.
Not installs, not revenue** ([ADR 6](docs/adr/0006-monetization-is-a-learning-goal.md)). Ads
are a compliance-and-integration exercise for when he wants to learn that, not a plan —
never justify building something on projected ad money, and don't assume a new app has ads.
Distribution is the binding constraint, not code: the realistic audience is the one reachable
in person — the team, the club, other coaches and parents.

**Games stay in React Native** ([ADR 7](docs/adr/0007-game-rendering-approach.md)). Scope
mechanics to what RN does well — one-tap timing, reaction and precision taps, drag-and-release
aiming, card and grid interactions, tween-driven motion. Reach for tooling in order: layout
and `Animated`, then `react-native-reanimated` for UI-thread animation, then
`@shopify/react-native-skia` only when a canvas is genuinely needed (per app, never in the
blueprint scaffold). **If an idea needs a physics engine or dozens of moving bodies, that's a
signal to change the idea, not the stack** — and that call belongs at the research stage, not
mid-build.

When ads *do* come up, read
[docs/reference/families-policy-and-ads.md](docs/reference/families-policy-and-ads.md) rather
than recalling policy — Families rules collide with rewarded video in non-obvious ways, and
that doc marks what's verified versus genuinely ambiguous.

## Conventions

- **Extend the shared config, don't fork it.** Apps get `@repo/config` for ESLint/TS and
  `@repo/ui` for components. If a rule needs changing, change it in `packages/config` so
  every app gets it.
- **Extract to `packages/` on the second real occurrence, not the first imagined one.**
  Duplication across two young apps is fine and expected; see
  [ADR 0002](docs/adr/0002-minimal-shared-packages.md). There is deliberately no shared
  backend/api-client package yet — the first app that needs one defines its shape.
- **Prefer offline-only.** No running cost, no auth, no privacy policy, no server. Reach for
  a backend only when the checklist in the research doc genuinely ticks a box.
- **Expo changes fast — read the versioned docs.** Check
  `https://docs.expo.dev/versions/v<SDK>/` for the app's actual SDK before writing Expo code
  rather than relying on recalled APIs. Generated apps carry an `AGENTS.md` saying the same.
- **Never add `resolver.disableHierarchicalLookup` to a `metro.config.js`.** Expo's published
  monorepo snippet includes it; it assumes a hoisted layout and breaks under pnpm (Metro then
  can't resolve transitive deps nested in `.pnpm/`). This was hit and verified — see
  [ADR 0001](docs/adr/0001-package-manager-and-monorepo-tool.md).
- **Record non-obvious decisions as an ADR** in `docs/adr/`, numbered, Nygard format. Cheap
  to write, saves re-arguing later. Recording what was *deliberately not built*, and why,
  counts.

## Verifying

Type-checking is not evidence that an app runs. For anything touching module resolution,
Metro config, or workspace wiring, bundle it:

```
pnpm --filter @apps/<slug> exec expo export --platform android --output-dir <tmp>
```

Prefer a real check over an assumption — and report what the output actually said, including
when it failed.

## Working style

David asks for critical review and wants genuine pushback, not agreement — lead with the
risks and unstated constraints in a proposal before building it. The learning value of
touching each stage is the point of this repo, so don't optimize away the parts he's trying
to learn (deployment and design included). Equally, don't over-build infrastructure ahead of
a real app that needs it.
