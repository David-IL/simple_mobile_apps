# Getting Straffe Kaos onto a phone via Google Play

Written 2026-08-23, sources linked. **Re-check the Play rules before relying on
this** — they move, and two of the things below changed in the last two years.

First, a correction worth having up front: this is **Google Play**, not Apple's
App Store. The app has no iOS configuration and
[ADR 4](../../../docs/adr/0004-eas-for-android-deployment.md) is Android-only.
Publishing to Apple would mean a Mac, a $99/year membership, and a separate
review process. Not now.

## The single most important decision: which track

Your goal is "my son downloads it on his own phone". That is **internal
testing**, not production, and the difference is enormous.

|  | Internal testing | Production |
| --- | --- | --- |
| Testers | up to 100, by email | everyone |
| Review wait | none — live in minutes | days |
| 12-testers rule | **exempt** | **applies** |

**The 12-testers rule is the thing that would otherwise stop you.** A personal
developer account created on or after 13 November 2023 must run a *closed* test
with **at least 12 testers opted in continuously for 14 days** before it can even
apply for production access. The clock starts when the twelfth tester opts in.
([Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465))

Internal testing is exempt from all of that, and its testers do **not** count
toward the twelve. So:

- **Today:** internal testing. Your son installs from Play, from a real listing,
  within about an hour of the account existing.
- **Later, if you want it public:** closed testing with twelve real testers for
  two weeks, then apply for production.

Do not try to go straight to production. You will spend two weeks recruiting
testers before anyone plays anything.

---

## What is already done in this repo

- `eas.json` with three build profiles. `preview` produces an **APK** (installable
  directly), `production` produces an **AAB** (what Play wants).
- `app.json`: the app is now called **Straffe Kaos** on the device rather than
  `penalty-chaos`, has `versionCode: 1`, and the `expo-audio` plugin is
  configured with `recordAudioAndroid: false` and `enableBackgroundPlayback:
  false` so it only carries `MODIFY_AUDIO_SETTINGS` — a normal permission
  Android grants automatically, never shown to the user as a request.
- Store listing copy in both languages, within Play's limits:
  [listing.md](listing.md).
- Privacy policy text in both languages: [privacy-policy.md](privacy-policy.md).
- Derived store graphics in [store/assets/](assets/) — a 512×512 icon and a
  1024×500 feature graphic per language, generated from the app artwork.

## What only you can do

1. **A Google Play developer account.** One-off $25. Use a Google account you
   intend to keep — the account owns the app, and moving apps between accounts
   is painful.
2. **An [expo.dev](https://expo.dev) account**, free.
3. **Host the privacy policy** at a public URL. GitHub Pages on this repo is the
   least effort; a public gist also works. Play needs a URL, not a file.
4. **Take the screenshots.** See the trap below.
5. **Every Play Console form.** None of it is scriptable without a service
   account, and setting that up is more work than clicking through it once.

---

## Step by step

### 1. One-time, in the app directory

**The package is `eas-cli`; the binary it installs is `eas`.** `npx eas …` fails
with *"could not determine executable to run"* because npm looks for a package
called `eas` and there isn't one. Two ways round it — install it once, which is
worth doing since you will run it repeatedly:

```
npm install -g eas-cli
eas login
eas init          # links this project to your Expo account
```

Or without installing anything, naming the package every time:

```
npx eas-cli@latest login
npx eas-cli@latest init
```

Verified 2026-08-23: `npx eas-cli@latest --version` → `eas-cli/22.2.0`.

`eas build:configure` is not needed — `eas.json` already exists.

### 2. Build something installable and check it on a real phone

```
eas build -p android --profile preview
```

This produces an **APK** and a download link. Install it on your own phone
first. This is the last easy chance to catch something before it is on a store
listing.

Worth checking specifically: the app name under the icon reads *Straffe Kaos*,
the icon is yours and not a placeholder, and sound still works — the built app
does not go through Expo Go, so this is the first time the real runtime runs.

**If the build fails on module resolution, this is why.** pnpm links dependencies
in an isolated layout by default, and not every React Native library copes.
Expo supports the isolated layout from SDK 54 onward and we are on 57, so try it
as-is first — but the documented fallback is to add this to
`pnpm-workspace.yaml` at the repo root and reinstall:

```yaml
nodeLinker: hoisted
```

Treat that as a fix for a build that actually failed, not a precaution. It
changes the layout for every package in the workspace, and
[ADR 1](../../../docs/adr/0001-package-manager-and-monorepo-tool.md) exists
because guessing at pnpm layout problems is how the Metro config got broken
last time. ([Expo monorepo guide](https://docs.expo.dev/guides/monorepos/))

### 3. Build the thing Play actually accepts

```
eas build -p android --profile production
```

An **AAB**. Note that `autoIncrement` bumps `versionCode` in `app.json`, so
expect a diff after each production build — commit it. Play rejects a
`versionCode` it has already seen, and forgetting to bump is the most common
first-upload failure.

### 4. Create the app in Play Console

Play Console → **Create app**.

- App name: `Straffe Kaos`
- Default language: **Norwegian (Norway) – no-NO**
- App or game: **Game**
- Free or paid: **Free** (this cannot be changed to paid later)

### 5. Fill in App content — all of it

Play blocks releases until these are done.

| Declaration | Answer for this app |
| --- | --- |
| **Privacy policy** | Your hosted URL. **Required** — see below. |
| **Ads** | No ads. |
| **App access** | All functionality available, no login. |
| **Content rating** | Complete the questionnaire. No violence, no bad language, no user interaction, no data shared, no purchases. Expect PEGI 3 / Everyone. |
| **Target audience** | This is the one to think about. See below. |
| **Data safety** | **No data collected, no data shared.** Everything is on-device only, which Play explicitly does not count as collection. |
| **Government apps** | No. |
| **Financial features** | None. |

**The privacy policy is required, and the research doc was wrong about this.**
[§7 of the research doc](../../../docs/research/penalty-chaos.md) said no privacy
policy was needed because the app collects nothing. That is true for a general-
audience app, but not for this one: Play states that apps whose target audience
includes children must submit a privacy policy *"even apps that do not access any
personal or sensitive user data"*.
([App content](https://support.google.com/googleplay/android-developer/answer/9859455))

**Target audience.** A cartoon football game built for an 11-year-old will be
assessed as child-appealing whatever you declare — Play reviews this itself and
can override you. So declare children honestly and accept
[Families policy](../../../docs/reference/families-policy-and-ads.md). For this
app that costs almost nothing, because the hard Families rules are all about ads
and data and there are neither. It costs exactly one thing: the privacy policy.

### 6. The store listing

Copy is written in [listing.md](listing.md), verified against the limits
(title 30 / short 80 / full 4000). Do both `no-NO` and `en-GB`.

Graphics — the specs, and what is ready:

| Asset | Spec | Status |
| --- | --- | --- |
| App icon | 512×512 PNG, ≤1024 KB | [`store/assets/icon-512.png`](assets/icon-512.png) — 475 KB |
| Feature graphic | 1024×500 JPEG or 24-bit PNG | [`store/assets/feature-graphic-no.jpg`](assets/feature-graphic-no.jpg) and `-en.jpg` |
| Phone screenshots | **at least 2**, up to 8. Min side 320px, max side 3840px | **you need to take these** |

**The screenshot trap.** Play requires that *the longer side is no more than
twice the shorter side*. A modern phone screenshot is typically 1080×2400, which
is 2.22:1 — **it will be rejected**. Crop each one to at most 1080×2160 before
uploading. ([Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151))

Four worth capturing, in this order — they explain the game fastest:

1. **The home screen.** It is the artwork, and it sells the thing.
2. **A match mid-aim**, with a disruption banner showing and the aim line drawn.
3. **The keeper select screen**, showing the pinned keeper with his trait bars.
4. **Full time**, with the shot map.

Take them in Norwegian for `no-NO` and in English for `en-GB` — the language
toggle is on the home screen.

### 7. Countries

Restrict distribution to **Norway**. Research doc §7: the audience is local, and
publishing globally means the strictest jurisdiction you ship to is the one that
governs you. Set under the release's countries/regions.

### 8. Release to internal testing

Play Console → Testing → **Internal testing** → Create new release.

- Upload the AAB from step 3 (or use `eas submit -p android`, which is
  configured to push to the internal track).
- Add your son's Google account email to the tester list.
- Send him the opt-in link. He accepts, then installs from Play like any app.

That is the whole thing. He downloads Straffe Kaos from the Play Store, on his
own phone, with your name on it.

---

## After it is out

- **Bump `versionCode` for every upload.** `autoIncrement` handles it on
  production builds; commit the resulting diff.
- **The store listing is not the app.** Updating copy or screenshots does not
  need a new build.
- **Internal testing releases go live in minutes**, so the fix-upload-play loop
  stays fast. Use it.

## Still outstanding before this could ever go public

Not blockers for internal testing, but they are real:

- **Licences for the eight taunt clips are unrecorded.** Some filenames suggest
  Freesound rather than Pixabay, and Freesound is per-file — much of it is CC-BY,
  which needs attribution somewhere in the app. See
  [assets/sfx/README.md](../assets/sfx/README.md).
- **The banner artwork has no recorded provenance**, and the
  [ADR 8](../../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md) check —
  that nothing in it derives from a real player, crest or kit — has not been done.
- **No real-device performance check** on a low-end Android, which
  [ADR 7](../../../docs/adr/0007-game-rendering-approach.md) asks for explicitly.
