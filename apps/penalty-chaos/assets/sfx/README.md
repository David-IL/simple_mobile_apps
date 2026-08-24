# Sound effects

All files are real audio. The synthesised placeholders that were here to prove
the integration worked have all been replaced and deleted.

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
| `goal.mp3` | goal | **real** — 2.0s: 0.75s of swell off the front, tail cut so it cannot overlap itself | Pixabay | Pixabay Content License |
| `miss.mp3` | **any non-goal** — wide, saved or blocked | **real** — 2.0s, tail cut for the same reason as `goal` | Pixabay | Pixabay Content License |
| `save.mp3` | keeper saves | **real** — 0.6s | Pixabay | Pixabay Content License |
| `blocked.mp3` | hits the pitch invader | **real** — 0.6s | Pixabay | Pixabay Content License |
| `chant.mp3` | away end starts singing | **real** — 5.1s | Pixabay | Pixabay Content License |
| `drum.mp3` | nothing — **source only**, kept to rebuild `row-drums.mp3` | **real** — 0.36s, trimmed from a 1.37s source. Not `require()`d, so it does not ship | Pixabay | Pixabay Content License |
| `row-drums.mp3` | the row's two-beat call | **real** — 0.76s, `drum.mp3` twice with the 400ms gap baked in | Pixabay | Pixabay Content License |
| `ro-shout.mp3` | the shout at the top of the row | **real** — 0.64s, cropped from a 126s own recording | Own recording (David, 2026-08-24) | Own work — no third-party rights |
| `sunday-taunt.mp3` | Sunday Keeper taunts | **real** — 1.8s, trimmed+faded from a 7.0s source | Pixabay | Pixabay Content License |
| `statue-taunt.mp3` | Statue taunts | **real** — 2.2s, trimmed+faded from a 7.0s source | Pixabay | Pixabay Content License |
| `chatterbox-taunt.mp3` | Chatterbox taunts | **real** — 2.2s, trimmed+faded from a 2.4s source | Pixabay | Pixabay Content License |
| `line-dancer-taunt.mp3` | Line-Dancer taunts | **real** — 1.9s, trimmed+faded from a 7.0s source | Pixabay | Pixabay Content License |
| `showboat-taunt.mp3` | Showboat taunts | **real** — 1.75s, trimmed+faded from a 7.8s source, re-sourced 2026-08-24 (see below) | Pixabay | Pixabay Content License |
| `veteran-taunt.mp3` | Veteran taunts | **real** — 2.0s, trimmed+faded from a 4.1s source | Pixabay | Pixabay Content License |
| `wall-taunt.mp3` | Wall taunts | **real** — 2.3s, trimmed+faded from a 3.0s source | Pixabay | Pixabay Content License |
| `mind-reader-taunt.mp3` | Mind-Reader taunts | **real** — 1.9s, trimmed+faded from a 2.0s source | Pixabay | Pixabay Content License |

No placeholders left. Every synthesised file has been replaced and deleted.

## The eight taunt laughs

Each keeper has its own laugh, keyed by id in
[`src/audio/sounds.ts`](../../src/audio/sounds.ts) as `taunt-<keeperId>` — see
`tauntSfxId()` there and its one call site in
[`MatchScreen.tsx`](../../src/screens/MatchScreen.tsx). There used to be a single
shared `taunt.mp3`; it is gone, replaced entirely by the per-keeper files above.

**The source clips were long — 2s to 8.7s — which does not work for a sound
that fires unblocked at the top of a round.** Chatterbox taunts 95% of the
time and Showboat 80%; a several-second laugh on nearly every round of a
match talks over the player instead of punctuating it. Every file here was
trimmed to a ~1.7–2.3s highlight and loudness-normalised (`ffmpeg`,
`loudnorm=I=-16:TP=-1.5:LRA=11`) with a ~250–400ms baked-in fade-out, so none
of them end on a click. That happened offline, once, at export time — there
is no runtime fade or trim logic, deliberately: `SfxProvider` still just calls
`.play()`, same as every other effect.

**If you replace one of these**, re-run the same treatment rather than
dropping a raw clip in — a long or abruptly-cut laugh regresses the exact
problem this fixed. Roughly:

```
ffmpeg -i raw.mp3 -af "atrim=<start>:<end>,asetpts=PTS-STARTPTS,\
loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=<fade_start>:d=<fade_dur>" \
-ac 1 -b:a 128k <keeper-id>-taunt.mp3
```

Pick `<start>`/`<end>` from where the laugh is actually loud — `showboat-taunt.mp3`'s
source had a quiet ~0.9s lead-in before the laugh started, and trimming from 0
caught mostly silence. A quick look at the waveform (`ffmpeg ... showwavespic`)
before committing to a trim window is worth it.

## The Viking row sounds

Two files, added for the row celebration on the result screen. Both were treated
offline, once, exactly like the taunts — there is no runtime trimming.

### `ro-shout.mp3` — cropped from a 126-second own recording

The source is `RO.mp3`, a full row performance: sparse isolated calls at the
start, then claps getting denser and louder to a crescendo. **It contains three
isolated calls before the continuous clapping takes over** — at ~2.4s, ~13.4s and
~20.4s. The second one was chosen: it is the loudest (−9.1 dB peak) and sits in
the quietest part of the recording (−27.9 dB room tone versus −25.4 dB at the
start).

```
ffmpeg -ss 13.14 -t 0.76 -i RO.mp3 \
  -af "highpass=f=85,loudnorm=I=-16:TP=-1.5:LRA=11,\
       afade=t=in:st=0:d=0.03,afade=t=out:st=0.60:d=0.16" \
  -ac 1 -b:a 128k ro-shout.mp3
```

The source has only ~16 dB between room tone and the shout, so the crop carries
audible room noise. **That is deliberate and should stay** — it is supposed to
sound like a crowd, not a studio. `afftdn=nr=12:nf=-32` cleans it up if that ever
changes, at the cost of some life in the shout.

**`RO.mp3` itself does not ship**, verified rather than assumed: `expo export`
bundles only assets reached by a `require()`, and nothing requires it. It stays
in the repo as the re-croppable source — 2 MB in git, 0 bytes in the APK. If the
crop ever needs redoing, the timestamps above are the whole recipe.

It is an **own recording**, which is the cleanest possible answer to the rule at
the top of this file and to [ADR 8](../../../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md)'s
voice clause: no third party's rights, no identifiable public figure.

### `drum.mp3` — trimmed, and deliberately not loudness-normalised

The source ran 1.37s but had decayed to −30 dB by 0.38s, so roughly 0.9s of it
was dead tail. Trimmed to 0.46s with a fade: **43,776 → 8,492 bytes.**

```
ffmpeg -ss 0.015 -t 0.46 -i <source>.mp3 \
  -af "afade=t=out:st=0.34:d=0.12" -ac 1 -b:a 128k drum.mp3
```

Two things here are on purpose and should survive a replacement:

- **No `loudnorm`,** unlike every taunt. It already peaks at −2.7 dB, and
  loudnorm's dynamic mode softens the attack — which on a drum is the entire
  sound. Match the level by ear instead.
- **The 15 ms of lead-in silence was trimmed off.** Silence at the head of a
  sample adds directly to perceived tap latency, and this clip is played on
  every beat of a rhythm mechanic. It is the cheapest millisecond available.

## A slow onset reads as lag

Three separate "the sound is late" reports turned out to be one lesson, and it
is worth stating plainly because it will happen again:

**A player hears an effect when it gets loud, not when it starts.**

`goal.mp3` opened at −13 dB and did not reach full roar until about 1.1s in. Its
first sample was on time; the *cheer* was a second late, which is exactly how it
was reported. The same shape, less severely, applied to the RO shout, whose
crop carried ~150ms of soft lead-in before the voice.

So the roster now carries a fourth number alongside licence and length: **dead
lead-in**, measured as the point a clip first comes within 18 dB of its own
peak. Anything that has to feel instantaneous — an outcome, a tap response —
wants that under about 50ms.

```
goal      peak  -3.7 dB   lead-in 0.02s   4.36s
drum      peak  -1.5 dB   lead-in 0.00s   0.36s
ro-shout  peak -13.4 dB   lead-in 0.04s   0.64s
whistle   peak -12.5 dB   lead-in 1.26s   4.13s   <- fine: it ends a match
miss      peak -14.7 dB   lead-in 0.32s   3.12s   <- deliberate, it is a groan
```

`whistle` and `miss` keep their slow starts on purpose. A referee's whistle
closing a shootout is not a reaction to a frame, and `miss` is a crowd groan
whose swell is the point. **Trim the ones that answer an action; leave the ones
that comment on it.**

**Length is a latency feature, not just a size one.** `goal` and `miss` are the
two effects a player can retrigger quickly — score twice in a few seconds, or
face two saves — and a clip that is still sounding when it is asked to play
again has to be rewound first, which costs a round trip and reads as lag. Both
are cut to 2.0s so that path is rarely taken at all. If another effect starts
feeling late on a second, quick trigger, its length is the first thing to look
at.

**A rhythm belongs in the file, not in a timer.** The row's two beats were
originally two `play()` calls 400ms apart on a `setTimeout`, and the second was
routinely swallowed — the call arrived as one hit instead of two. `row-drums.mp3`
is `drum.mp3` twice with the gap baked in, so the interval is sample-accurate
and the cycle costs one `play()` instead of two. Anything else with a fixed
internal rhythm should be built the same way.

`drum.mp3` has a second constraint: it fires every 400ms during the row, so it
is cut to **0.36s — deliberately shorter than the gap between beats**. A clip
that outlives its own retrigger interval forces a rewind on every hit, and
rewinding is what made sounds arrive late in the first place. See the note at
the top of `src/audio/SfxProvider.tsx`.

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

**If any of the eight `*-taunt.mp3` files or `chant.mp3` contains a real recognisable
voice, check it.** ADR 8 covers voices as much as faces, so a clip of an
identifiable person laughing or singing is the same class of problem as their
picture. A wordless laugh, a synthesised voice, or your own recording is fine.

**`showboat-taunt.mp3`'s original source was uploaded under a name referencing
an anime character's laugh.** That is not itself an ADR 8 problem — ADR 8 is
about real people and real clubs — but the README rule above is broader:
never rip audio from someone else's copyrighted work, and a clip that reads as
lifted from a specific show is worth avoiding even when the licence is clean.
Re-sourced 2026-08-24 with a different Pixabay clip (`freesound_community`,
"Male Laugh Hysterical 01", pixabay.com/sound-effects/people-male-laugh-hysterical-01-99650/)
that carries no such reference.

The research doc argues the crowd reacting to a miss and to a goal carries more
of the comedy than any animation does. Those two are now real, which means the
central claim is finally testable on a phone.

## Format

WAV and mp3 both work; everything here is mp3 now.

The files came in at 256 kbps, 44.1/48 kHz stereo. That is CD-quality for a
phone speaker playing a 0.8-second thud — **re-encoding effects to mono 128 kbps
would roughly quarter them** with no audible loss on a phone. Not urgent, but the
two loops are ~1 MB of the bundle between them and that is the easy win when APK
size starts to matter.

Keep effects under about half a second. `chant` fires at the
start of a round and will overlap the player thinking; anything long gets annoying
fast. The eight `*-taunt.mp3` files are the deliberate exception — a laugh needs
more like 1.5–2.5s to read as a laugh at all — but they are trimmed and faded
specifically because of this rule, not in spite of it: see "The eight taunt
laughs" above before treating that range as the new default for anything else.

`menu-music.wav` is the exception: it is one long file with `loop = true`, so it
needs to **loop seamlessly** — start and end at the same point in the bar, and do
not fade in or out, or you will hear a gap every time round. Keep it under about
a minute; a WAV that long is already ~2.5 MB, which is the point to switch the
music track to m4a even if the effects stay WAV.

A chant must not be a real club's. Terrace songs are mostly traditional tunes and
fine, but a recording of a specific crowd singing a specific club's song is both
someone's recording and someone's branding.

## Levels

`SFX_VOLUME` in [`src/audio/sounds.ts`](../../src/audio/sounds.ts) is per-sound
because real recordings are not normalised to each other the way the synthesised
placeholders were. Two need watching:

- **`miss`** is misleadingly named: it is the crowd's "ooooh", so it layers onto
  *every* outcome that is not a goal, not just a shot that went wide. A save
  plays `save` (gloves) and `miss` (the groan) together, because a save is two
  events. It also has a slow onset and plays over the stadium ambience rather
  than over silence, so it sits at 1.0.
- **The eight `taunt-*` sounds** share one level (0.85) rather than eight
  hand-tuned ones, because they are already loudness-normalised to the same
  target during trimming — see "The eight taunt laughs" above. If a
  replacement clip skips that step, it will likely need its own volume entry.

## Behaviour worth knowing

The app calls `setAudioModeAsync({ playsInSilentMode: true })`, so **sound
ignores the phone's ringer switch and only the in-app Sound toggle controls it**.
An earlier version set this to `false` to respect the ringer switch, which
sounded polite but was a bug: a player who explicitly turns Sound on in the
app gets silence with no way to tell why, since there's nothing on screen that
explains the OS is overriding it. See the comment in
[`SfxProvider.tsx`](../../src/audio/SfxProvider.tsx). The Sound on/off toggle
lives on the home screen and is stored on the device.
