# Sound effects

Some of these are real; the rest are synthesised placeholders — short tones and
noise bursts generated from a script, enough to prove the integration works and
no more. The Status column below says which is which.

**Formats can be mixed freely.** Android's ExoPlayer plays WAV and mp3, Metro
bundles both, and expo-audio does not care. But `require()` paths are static, so
**dropping in `kick.mp3` next to `kick.wav` changes nothing until you edit the
extension in [`src/audio/sounds.ts`](../../src/audio/sounds.ts)** — and delete the
placeholder, or it stays in the repo doing nothing.

## The rule for replacing them

Same principle as [ADR 8](../../../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md):
do not ship media whose rights you have not checked.

- **CC0 / public domain preferred.** No attribution burden, no licence file to
  ship, nothing to get wrong later.
- **CC-BY is acceptable** if the attribution is recorded in the table below *and*
  surfaced somewhere in the app before release.
- **Never** rip audio from a broadcast, a game, a video, or a stock site's
  preview. Crowd noise from a real televised match is someone's recording.
- **No real people.** A voice clip of an actual goalkeeper is a likeness, and
  ADR 8 applies to voices as much as faces.

Fill in `Source` and `Licence` for every file you replace. A row with a blank
licence is a row that must not ship.

## The roster

| File | Fires when | Status | Source | Licence |
| --- | --- | --- | --- | --- |
| `kick.mp3` | ball is struck | **real** — 0.8s | Pixabay | Pixabay Content License |
| `whistle.mp3` | shootout ends | **real** — 4.1s | Pixabay | Pixabay Content License |
| `menu-music.mp3` | any menu screen | **real** — 15s loop | Pixabay | Pixabay Content License |
| `stadium-crowd.mp3` | under a match, looping | **real** — 17.5s loop | Pixabay | Pixabay Content License |
| `goal.mp3` | goal | **real** — 5.1s | Pixabay | Pixabay Content License |
| `miss.mp3` | wide or over | **real** — 3.1s | Pixabay | Pixabay Content License |
| `mascot.mp3` | badger appears | **real** — 2.0s | Pixabay | Pixabay Content License |
| `taunt.mp3` | keeper taunts | **real** — 0.8s | Pixabay | Pixabay Content License |
| `save.wav` | keeper saves | placeholder — gloves on ball + reaction | — | — |
| `blocked.wav` | hits the pitch invader | placeholder — dull thud, ideally an "oof" | — | — |
| `chant.wav` | away end starts singing | placeholder — terrace chant, no real club | — | — |

## The Pixabay licence, checked

All the real files come from [pixabay.com](https://pixabay.com/). Verified against
the [licence summary](https://pixabay.com/service/license-summary/) on 2026-08-21:

- **Commercial use is permitted** and **attribution is not required** ("although
  giving credit is always appreciated"). Modifying or adapting is allowed.
- **Prohibited:** selling or distributing content "on a Standalone basis" where no
  creative effort has been applied; use of recognisable trademarks or brands
  commercially; use as part of a trade mark; misleading or illegal use.

For this app that is clean. The sounds are embedded in a game, which is creative
effort applied — not standalone redistribution. Nothing is being sold, and no
brand is involved.

Three things worth keeping straight:

- **"Royalty-free" is not CC0.** This is Pixabay's own bespoke licence with its own
  terms, not a public-domain dedication. If these files ever get reused outside
  this app, re-read the licence rather than assuming they are free of conditions.
- **Never ship the raw files as a downloadable pack.** That is exactly the
  standalone-distribution clause. Inside the APK is fine; an assets download is not.
- **Pixabay is user-uploaded**, and their own terms warn that "certain Content may
  be subject to additional intellectual property rights". Low risk for generic
  crowd and impact sounds, higher for anything that sounds like it came off a
  broadcast or contains recognisable music. If a file sounds *too* good to be
  someone's upload, it is worth a second look.

Two placeholders left: `save` and `blocked`. Both are impacts rather than crowd
or voice, which makes them the easiest kind to find CC0 — Kenney's impact packs
cover this exact case.

**If `taunt.mp3` contains a real recognisable voice, check it.** ADR 8 covers
voices as much as faces, so a clip of an identifiable person saying something is
the same class of problem as their picture. A wordless mumble, a synthesised
voice, or your own recording is fine.

The research doc argues the crowd reacting to a miss and to a goal carries more
of the comedy than any animation does. Those two are now real, which means the
central claim is finally testable on a phone.

## Format

WAV or mp3, both work. The placeholders are WAV only because that is what can be
generated without a third-party encoder.

The real files came in at 256 kbps, 44.1/48 kHz stereo. That is CD-quality for a
phone speaker playing a 0.8-second thud — **re-encoding effects to mono 128 kbps
would roughly quarter them** with no audible loss on a phone. Not urgent, but the
two loops are ~1 MB of the bundle between them and that is the easy win when APK
size starts to matter.

Keep effects under about half a second. `taunt`, `mascot` and `chant` fire at the
start of a round and will overlap the player thinking; anything long gets annoying
fast.

`menu-music.wav` is the exception: it is one long file with `loop = true`, so it
needs to **loop seamlessly** — start and end at the same point in the bar, and do
not fade in or out, or you will hear a gap every time round. Keep it under about
a minute; a WAV that long is already ~2.5 MB, which is the point to switch the
music track to m4a even if the effects stay WAV.

A chant must not be a real club's. Terrace songs are mostly traditional tunes and
fine, but a recording of a specific crowd singing a specific club's song is both
someone's recording and someone's branding.

## Regenerating the placeholders

The generator lives outside the repo (it was scratch work). If you need it again
it is a small pure-stdlib Python script using `wave` and `math` — but the point
is to delete these files, not to regenerate them.

## Behaviour worth knowing

The app calls `setAudioModeAsync({ playsInSilentMode: false })`, so **sound
respects the phone's ringer switch**. If the phone is on silent or vibrate there
will be no audio, and that is deliberate — a crowd erupting from a silenced phone
in a classroom is the wrong first impression. There is also a Sound on/off toggle
on the home screen, stored on the device.
