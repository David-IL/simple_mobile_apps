/**
 * The sound roster.
 *
 * `require()` is deliberate and unavoidable: Metro resolves asset paths at
 * bundle time, so these cannot be built from a variable. That also means a
 * missing file is a build error rather than silence at runtime, which is the
 * behaviour we want — and it is why swapping a `.wav` for an `.mp3` means
 * editing the extension here rather than just dropping the file in.
 *
 * Mixed formats are fine. Android's ExoPlayer plays both, Metro bundles both,
 * and expo-audio does not care. The remaining `.wav` entries are still the
 * synthesised placeholders — see assets/sfx/README.md for what each slot needs
 * and the licence rules for replacing it.
 */

import { preload } from "expo-audio";

import { SHOUT_MS } from "../game/row";
import type { KeeperId } from "../game/types";

export const SFX_IDS = [
  "kick",
  "goal",
  "save",
  "miss",
  "blocked",
  "chant",
  "whistle",
  "row-drums",
  "ro-shout",
  "taunt-sunday",
  "taunt-statue",
  "taunt-chatterbox",
  "taunt-line-dancer",
  "taunt-showboat",
  "taunt-veteran",
  "taunt-wall",
  "taunt-mind-reader",
] as const;

export type SfxId = (typeof SFX_IDS)[number];

/**
 * One distinct laugh per keeper, keyed the same way as `src/i18n`'s taunt
 * copy — `taunt-${KeeperId}`. Every keeper gets a different clip so a taunt
 * says something about who is taunting, not just that someone is.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
export const SFX_SOURCES: Record<SfxId, number> = {
  kick: require("../../assets/sfx/kick.mp3"),
  goal: require("../../assets/sfx/goal.mp3"),
  save: require("../../assets/sfx/save.mp3"),
  miss: require("../../assets/sfx/miss.mp3"),
  blocked: require("../../assets/sfx/blocked.mp3"),
  chant: require("../../assets/sfx/chant.mp3"),
  whistle: require("../../assets/sfx/whistle.mp3"),
  "row-drums": require("../../assets/sfx/row-drums.mp3"),
  "ro-shout": require("../../assets/sfx/ro-shout.mp3"),
  "taunt-sunday": require("../../assets/sfx/sunday-taunt.mp3"),
  "taunt-statue": require("../../assets/sfx/statue-taunt.mp3"),
  "taunt-chatterbox": require("../../assets/sfx/chatterbox-taunt.mp3"),
  "taunt-line-dancer": require("../../assets/sfx/line-dancer-taunt.mp3"),
  "taunt-showboat": require("../../assets/sfx/showboat-taunt.mp3"),
  "taunt-veteran": require("../../assets/sfx/veteran-taunt.mp3"),
  "taunt-wall": require("../../assets/sfx/wall-taunt.mp3"),
  "taunt-mind-reader": require("../../assets/sfx/mind-reader-taunt.mp3"),
};
/* eslint-enable @typescript-eslint/no-require-imports */

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * The menu loop. Separate from the effects roster because it is played
 * differently: one long file, `loop = true`, started and stopped by which
 * screen you are on rather than by a game event.
 */
export const MUSIC_SOURCE: number = require("../../assets/sfx/menu-music.mp3");
/* eslint-enable @typescript-eslint/no-require-imports */

/** Music sits under the effects so a taunt still cuts through it. */
export const MUSIC_VOLUME = 0.32;

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Stadium ambience, looping under a match. It is the counterpart to the menu
 * music, and it earns its place beyond atmosphere: a crowd reaction to a miss
 * only lands if there was a crowd there a moment before. Cutting from silence
 * to a groan reads as a sound effect; swelling out of a murmur reads as a crowd.
 */
export const AMBIENCE_SOURCE: number = require("../../assets/sfx/stadium-crowd.mp3");
/* eslint-enable @typescript-eslint/no-require-imports */

/** Low enough to sit under everything — it is a bed, not an effect. */
export const AMBIENCE_VOLUME = 0.22;

/** Per-sound levels, so one loud asset does not force a rebalance of the rest. */
export const SFX_VOLUME: Record<SfxId, number> = {
  kick: 0.9,
  goal: 1,
  save: 0.95,
  // A crowd groan has a slow onset and is competing with the ambience bed
  // underneath it. At the old 0.7 it was easy to miss entirely.
  miss: 1,
  blocked: 0.9,
  chant: 0.85,
  whistle: 0.8,
  // The row's metronome, at the player's ceiling.
  //
  // 1 is as loud as expo-audio goes — the property is 0..1 — and the file
  // itself already peaks at 0 dBFS, so there is no gain left anywhere in the
  // chain. If the drum still needs to feel bigger the levers are a fuller
  // sample or bringing the *other* sounds down, not a bigger number here.
  //
  // Deliberately *not* loudness-normalised at export like the taunts are:
  // `loudnorm`'s dynamic mode softens the attack, and the attack is the whole
  // sound. See assets/sfx/README.md.
  /**
   * The row's call: two hits baked into one file, 400ms apart.
   *
   * Scheduling the second beat with a `setTimeout` put it at the mercy of the
   * JS thread, and it showed — the second drum was routinely swallowed, so the
   * call arrived as one hit instead of two. Baking the interval into the audio
   * makes it sample-accurate and costs one `play()` per cycle instead of two.
   */
  "row-drums": 1,
  "ro-shout": 1,
  // Short and speech-like: quiet enough to be atmosphere, loud enough to
  // hear. All eight are loudness-normalised to the same target during
  // trimming (see assets/sfx/README.md), so one shared level is enough —
  // no keeper's laugh should need to be louder than another's.
  "taunt-sunday": 0.85,
  "taunt-statue": 0.85,
  "taunt-chatterbox": 0.85,
  "taunt-line-dancer": 0.85,
  "taunt-showboat": 0.85,
  "taunt-veteran": 0.85,
  "taunt-wall": 0.85,
  "taunt-mind-reader": 0.85,
};

/**
 * How long each clip sounds for, in milliseconds. Measured with `ffprobe`, not
 * estimated — `ffprobe -v error -show_entries format=duration -of csv=p=0 <f>`.
 *
 * This table exists so `SfxProvider` can answer "is that voice still busy?"
 * with arithmetic instead of asking the player. That is not a micro-optimisation.
 * In expo-audio every one of `currentTime`, `playing`, `play()` and `pause()` is
 * wrapped in `runBlocking(mainQueue)` on Android, so reading them **blocks the
 * JS thread until the Android main thread is free**. The old voice picker read
 * `currentTime` once per voice and `playing` once more, which put three or four
 * blocking hops inside a touch handler — on the one screen whose main thread is
 * also decoding a looping video. That is why a shout did not always follow the
 * finger. Knowing the lengths up front removes every one of those reads.
 *
 * **Re-measure when you replace a file.** A number that is too small here makes
 * the provider think a voice is free while it is still sounding; too large and
 * it hoards a voice that is already finished.
 */
export const SFX_LENGTH_MS: Record<SfxId, number> = {
  kick: 792,
  goal: 2000,
  save: 624,
  miss: 2000,
  blocked: 624,
  chant: 5068,
  whistle: 4127,
  "row-drums": 760,
  // The one length that is a *rule* rather than a measurement: it has to fit
  // inside the row's shortest rest, so it is owned by the row and asserted by a
  // test there. See SHOUT_MS in src/game/row.ts.
  "ro-shout": SHOUT_MS,
  "taunt-sunday": 1800,
  "taunt-statue": 2200,
  "taunt-chatterbox": 2200,
  "taunt-line-dancer": 1900,
  "taunt-showboat": 1750,
  "taunt-veteran": 2000,
  "taunt-wall": 2300,
  "taunt-mind-reader": 1900,
};

/** Which laugh a keeper's taunt plays. Kept here, not in `game/keepers.ts` — a
 * sound is presentation, and that module is deliberately pure parameters. */
/**
 * The taunts, as a set.
 *
 * They are treated as one group because only one keeper can be talking at a
 * time — see the exclusivity rule in SfxProvider.
 */
export const TAUNT_SFX_IDS: readonly SfxId[] = SFX_IDS.filter((id) =>
  id.startsWith("taunt-"),
);

export function isTauntSfx(id: SfxId): boolean {
  return TAUNT_SFX_IDS.includes(id);
}

export function tauntSfxId(keeper: KeeperId): SfxId {
  return `taunt-${keeper}`;
}

/**
 * Start buffering the slow ones before React renders.
 *
 * The menu loop took over a second to come in on a cold start. It is not the
 * file - it opens at full level on its first sample - it is a 481 kB mp3 being
 * fetched and decoded while the home screen is already up. `preload` is the
 * documented answer and the docs are explicit that it belongs in module scope,
 * before any component mounts.
 *
 * Only four sources, not the whole roster: the two long loops, because they are
 * by far the largest, and the row's pair, because those two have to answer a
 * finger. The short outcome effects are a few tens of kB and arrive in time
 * without help. Add to this list if another sound shows a first-play delay -
 * preloading everything would just move the contention to app start.
 *
 * **Do not "fix" the loops by re-encoding them smaller.** `menu-music` is
 * played with `loop = true` and mp3 re-encoding adds encoder padding at both
 * ends, which is exactly how a seamless loop acquires an audible gap. See
 * assets/sfx/README.md.
 */
const swallow = () => {
  // A warm cache is an optimisation; failing to get one is not an error.
};

void preload(MUSIC_SOURCE).catch(swallow);
void preload(AMBIENCE_SOURCE).catch(swallow);
void preload(SFX_SOURCES["row-drums"]).catch(swallow);
void preload(SFX_SOURCES["ro-shout"]).catch(swallow);
