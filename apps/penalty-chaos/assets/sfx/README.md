# Sound effects

**Everything in this folder is a synthesised placeholder.** They are short tones
and noise bursts generated from a script — enough to prove the audio integration
works end to end, not enough to be funny. Each one is meant to be replaced.

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

| File | Fires when | What it should be | Source | Licence |
| --- | --- | --- | --- | --- |
| `kick.wav` | ball is struck | boot on ball, dry and short | *placeholder* | — |
| `goal.wav` | goal | net ripple + crowd cheer | *placeholder* | — |
| `save.wav` | keeper saves | gloves on ball + crowd reaction | *placeholder* | — |
| `miss.wav` | wide or over | crowd "ooooh" / groan | *placeholder* | — |
| `blocked.wav` | hits the pitch invader | dull thud, ideally an "oof" | *placeholder* | — |
| `taunt.wav` | keeper taunts | mumbled chatter, no real words | *placeholder* | — |
| `mascot.wav` | badger appears | something silly and short | *placeholder* | — |
| `chant.wav` | away end starts singing | a short terrace chant, no real club | *placeholder* | — |
| `whistle.wav` | shootout ends | referee's whistle | *placeholder* | — |
| `menu-music.wav` | any menu screen | a seamless loop, quiet, football-ish | *placeholder* | — |

The research doc argues `miss.wav` and `goal.wav` carry more of the comedy than
any animation does, so they are the two worth spending real effort on.

## Format

WAV, mono, 22050 Hz. WAV because Android's ExoPlayer handles it and we can
generate it without a third-party encoder. **m4a/AAC is fine too and smaller** —
if the replacements come as m4a, change the extensions in
[`src/audio/sounds.ts`](../../src/audio/sounds.ts) and nothing else needs to move.

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
