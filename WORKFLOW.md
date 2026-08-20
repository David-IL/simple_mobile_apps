# Workflow: idea → ship

The pipeline every app in this repo goes through. Each stage has a gate; don't skip forward.

---

## 1. Idea

Write it down as one sentence. Ideas are cheap — the filter is the next stage.

## 2. Research (gate: decision = `proceed`)

```bash
/validate-idea a habit tracker with no signup    # Claude Code: researches and fills the doc
pnpm blueprint:research                          # or create an empty doc to fill in by hand
```

Either way you get `docs/research/<slug>.md`, from
[`blueprint/market-research/TEMPLATE.md`](blueprint/market-research/TEMPLATE.md).

The [`validate-idea`](.claude/skills/validate-idea/SKILL.md) skill scans competitors and
demand signals, fills the doc citing what it verified and flagging what it couldn't, and
argues *against* weak ideas. It leaves `Status: draft` — flipping the gate to `proceed` is
your call, not its.

This is a **30-minute exercise to find the reason not to build it**, not a business plan.
It is a checklist, not an automated verdict — you do the searching (Play Store category
browsing, review-reading, a few web searches) and record what you find.

The two decisions that come out of it and actually shape the code:

- **Offline-only vs. cloud backend.** Offline-only is dramatically cheaper: no running cost,
  no auth, no privacy policy, no server to maintain. Prefer it unless the checklist in
  §4 of the template genuinely ticks a box.
- **MVP scope, including explicit non-goals.** The non-goals are what stop a two-evening
  app from becoming a six-month one.

Set `Status: proceed` at the top when you're ready. `shelved` is a perfectly good outcome —
the doc stays in the repo as a record of why.

## 3. Design (gate: you can draw the main screens)

Done in VS Code:

- **Wireframes** — create `docs/design/<slug>.excalidraw` and edit it with the Excalidraw
  extension. Version-controlled, diffable-ish, no external tool or account.
- **Components** — build shared pieces in `packages/ui`. Anything used by two apps belongs
  there; anything used by one stays in the app.

Rough screens first. Pixel-level polish after the app runs.

## 4. Scaffold

```bash
pnpm blueprint:new
```

Prompts for a slug and the offline/backend flavor, then runs `create-expo-app`, wires the
new app into the workspace (shared config, shared UI, Metro config for symlinked packages),
sets the Android package id, and writes a per-app README checklist.

It warns if there's no research doc for that slug.

## 5. Build

```bash
pnpm --filter @apps/<slug> start     # Metro; scan the QR with Expo Go on your phone
pnpm lint && pnpm typecheck          # or let CI do it
```

Testing on a real Android device via Expo Go is the fastest loop and needs no emulator.
An Android emulator (Android Studio) is optional and heavier.

**Until you add a native module.** Ads (`react-native-google-mobile-ads`) and anything else
with custom native code do not run in Expo Go — you need a development build:

```bash
npx eas build --profile development   # install the result on your device, once
# or, locally: npx expo prebuild && npx expo run:android
```

After that the JS reload loop is the same. See
[docs/reference/families-policy-and-ads.md](docs/reference/families-policy-and-ads.md).

## 6. Ship

**One-time setup you must do yourself** (not scriptable — needs your accounts):

1. Create an [expo.dev](https://expo.dev) account.
2. In the app directory: `npx eas-cli login` then `eas init` and `eas build:configure`
   (creates `eas.json` and the EAS project id).
3. Create an expo.dev access token; add it as the GitHub repo secret `EXPO_TOKEN`.
4. Google Play Console developer account (one-time fee) for actual store release.
5. For automated submission: a Play service-account JSON wired into `eas.json`.

Then:

```bash
eas build -p android --profile preview      # installable APK for yourself
eas build -p android --profile production   # AAB for the Play Store
eas submit -p android --latest
```

Or run the **EAS Build (Android)** workflow from the GitHub Actions tab
(`.github/workflows/eas-build.yml`), which does the same in CI.

EAS builds in Expo's cloud, so you never need Android signing set up locally on Windows.

## 7. Record the decision

If you made a non-obvious architectural choice, add an ADR in `docs/adr/`. Copy the format
of the existing ones. Cheap to write, saves re-litigating later.

---

## Deliberately not built yet

These are deferred until a real app needs them — building them now would be guessing:

- A shared backend / API-client package (the first backend app defines its shape)
- Design tokens / theming system in `packages/ui`
- Storybook (see [ADR 0005](docs/adr/0005-component-preview-approach.md))
- Turborepo remote caching
- iOS configuration
- A `ship-android` skill for stage 6, and a design skill for stage 3 — both deliberately
  wait until the first real ship, so they encode what actually happened rather than guesses
