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


| --- | --- | --- | --- | --- |
| File | Fires when | Status | Source | Licence |
| --- | --- | --- | --- | --- |
| `kick.mp3` | ball is struck | **real** — 0.8s | *fill in* | *fill in* |
| `whistle.mp3` | shootout ends | **real** — 4.1s | *fill in* | *fill in* |
| `menu-music.mp3` | any menu screen | **real** — 15s loop | *fill in* | *fill in* |
| `stadium-crowd.mp3` | under a match, looping | **real** — 17.5s loop | *fill in* | *fill in* |
| `goal.mp3` | goal | **real** — 5.1s | *fill in* | *fill in* |
| `miss.mp3` | wide or over | **real** — 3.1s | *fill in* | *fill in* |
| `mascot.mp3` | badger appears | **real** — 2.0s | *fill in* | *fill in* |
| `save.wav` | keeper saves | placeholder — gloves on ball + reaction | — | — |
| `blocked.wav` | hits the pitch invader | placeholder — dull thud, ideally an "oof" | — | — |
| `taunt.wav` | keeper taunts | placeholder — mumbled chatter, no real words | — | — |
| `chant.wav` | away end starts singing | placeholder — terrace chant, no real club | — | — |

**None of the real files has a source or licence recorded.** Fill those in before
any release — a row with a blank licence is a row that must not ship.

Three placeholders left. `taunt` is the one worth recording yourself: a wordless
mumble from you or your son is free, unambiguously licensed, funnier than
anything downloadable, and sidesteps ADR 8 entirely because it is your own voice
with consent.

The research doc argues `miss.wav` and `goal.wav` carry more of the comedy than
any animation does, so they are the two worth spending real effort on.

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
