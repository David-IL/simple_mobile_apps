# 4. EAS Build for Android releases

- **Status:** accepted
- **Date:** 2026-08-20

## Context

Development happens on Windows. Android builds *can* be produced locally with Android Studio
and a local keystore, but that means managing signing keys on one machine and reproducing
the toolchain in CI. iOS builds would additionally require a Mac.

## Decision

Use Expo Application Services (EAS) Build and Submit for release builds, driven either from
the CLI or from `.github/workflows/eas-build.yml`.

## Consequences

- No local Android SDK or keystore management required; EAS holds the signing credentials.
- Day-to-day development still uses Expo Go on a physical device — no emulator needed.
- Adds a dependency on a hosted service with a free tier that has build-queue limits. For a
  hobby cadence this is fine; a local `eas build --local` or Gradle path remains available
  as an escape hatch.
- If iOS is added later, the same pipeline covers it without needing a Mac.

## User setup still required

Not scriptable — needs personal accounts. See §6 of [WORKFLOW.md](../../WORKFLOW.md):
Expo account, `eas init` per app, `EXPO_TOKEN` repo secret, Google Play Console account,
and a Play service-account JSON for automated submission.
