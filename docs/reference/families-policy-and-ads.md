# Google Play Families policy + ads — verified constraints

Researched 2026-08-20, with sources. **Re-check before relying on it** — Play policy moves.

> **Read this only when actually adding ads to an app.** Per
> [ADR 6](../adr/0006-monetization-is-a-learning-goal.md), ads here are a compliance and
> integration exercise, not a revenue plan, and no app is planned around ad income. This doc
> is the reference for doing that exercise properly when the time comes — it is not an
> argument for or against building anything.

It matters because the apps lean football/soccer and are playtested by an 11-year-old. If
they appeal to under-13s, Play's Families policy applies, and it collides with rewarded video
ads in a way that is not obvious up front.

Confidence markers: **(A)** verified in an official source · **(B)** widely reported,
unofficial · **(C)** could not confirm.

## The headline conflict: rewarded video in a child-directed app

**(A)** Families policy prohibits "monetization and advertising that interfere with normal
app use or game play, including **rewarded or opt-in ads**, that are not **closeable after
five seconds**." A standard 15–30s non-skippable rewarded video does not meet that bar.

**(C)** Whether an *opt-in* rewarded video counts as "interfering with normal game play" is
genuinely ambiguous in the policy text, and no official page resolves it. **(B)** Developers
report rejections under exactly this clause for rewarded ads in family-rated games.

**Do not assume rewarded video works in a Families app.** The three realistic routes:

1. **Declare 13+** and keep the art, listing, and terminology genuinely non-child-directed.
2. **Declare mixed audience** with a neutral age screen, serving rewarded ads only to the
   13+ branch. **(A)** A neutral age screen is required for mixed audience, and must not
   encourage users to falsify their age.
3. **Accept 5-second-closeable ads**, which breaks the rewarded-video economics.

**(A)** Your declaration is not final: Google "reserves the right to conduct its own review,"
and child-appealing imagery or terminology "may impact Google Play's assessment of your
declared target audience." Declaring 18+ does not protect a cartoon football game.

Source: [Families policies](https://support.google.com/googleplay/android-developer/answer/9893335),
[Target audience and content](https://support.google.com/googleplay/android-developer/answer/9867159)

## Other Families rules that bite

**(A)** For a child-inclusive target audience:

- Only **Google Play-certified ad SDKs**. AdMob qualifies (`play-services-ads` ≥ 19.0.0) —
  see the [certified SDK list](https://support.google.com/googleplay/android-developer/answer/9283445).
  Note the program is closed to new applicants, so future *mediation adapters* may not be
  certifiable.
- **No personalized/interest-based ads or remarketing** to children or unknown-age users.
- Also prohibited: interstitials on app launch, multiple ad placements per page, ads not
  clearly distinguishable from content, designs producing inadvertent clicks, and
  "emotionally manipulative tactics to encourage ad viewing."
- **Do not transmit the Android Advertising ID (AAID)** from children or unknown-age users.
  Child-only apps must never transmit it. Use App Set ID for analytics instead.
- A **privacy policy is mandatory** — required even for apps collecting no data — and the
  **Data safety form must cover third-party SDKs**, AdMob included.

**(C)** There is *no* official rule literally stating "users must not be required to watch
ads to progress." Don't cite one. A hard ad-gate would be argued under the five-second and
manipulative-tactics clauses instead.

**(A)** COPPA/GDPR-K lever is AdMob's **Tag for age treatment (TFAT)** —
`setAgeRestrictedTreatment(CHILD | TEEN | UNSPECIFIED)`. The older TFCD/TFUA tags are
**deprecated**. Google is explicit that its tools "do not relieve you of your obligations
under the law." EEA/UK/CH personalized ads additionally need a Google-certified CMP on IAB
TCF (Google's own is the UMP SDK).
[Tag for age treatment](https://support.google.com/admob/answer/6219315) ·
[Data practices in Families apps](https://support.google.com/googleplay/android-developer/answer/11043825)

## Technical consequences for this repo

**(A) Ads mean no more Expo Go.** `react-native-google-mobile-ads` (Invertase) is the
standard library — Expo's own `expo-ads-admob` was **removed in SDK 46** and its migration
guidance points there. Its docs state plainly: *"This module contains custom native code
which is NOT supported by Expo Go."*

So the moment an app adds ads, the dev loop changes:

```
npx eas build --profile development     # then install that build on the device
# or: npx expo prebuild && npx expo run:android
```

Config plugin entry in `app.json` — note the Expo plugin uses **camelCase**, unlike the
bare-RN snake_case form:

```json
{ "expo": { "plugins": [
  ["react-native-google-mobile-ads", { "androidAppId": "ca-app-pub-xxxx~xxxx" }]
]}}
```

Use `TestIds.REWARDED` during development — serving real ad units to your own device risks
account action. Call `setRequestConfiguration()` **before** `initialize()`; ads can preload
on init.

**(A) AD_ID permission conflict.** Apps targeting Android 13+ that use the advertising ID
must declare `com.google.android.gms.permission.AD_ID`, and the Google Mobile Ads SDK
declares it *for* you via manifest merge. But Families data practices require a child-only
app to **not** declare it. **(B)** The community fix is a manifest-merger removal
(`tools:node="remove"`) via a small custom Expo config plugin; it's reported as finicky when
other SDKs re-add the permission. **(C)** No official Expo/Invertase documented option.
**Verify the merged manifest in the build output rather than trusting config.**

## Sequencing

**(C)** No official guidance recommends a no-ads first release. **(B)** Shipping v1 ad-free
is still lower-risk in practice: it keeps Families ad-SDK, AD_ID, and rewarded-format
questions out of your very first review and lets the target-audience declaration settle
cleanly. But be honest that it **defers** the risk rather than removing it — **(A)** adding
ads later flips the Ads declaration, likely the advertising-ID declaration, and the Data
safety form, all of which go through review.
