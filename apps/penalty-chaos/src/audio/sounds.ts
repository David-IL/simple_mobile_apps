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

export const SFX_IDS = [
  "kick",
  "goal",
  "save",
  "miss",
  "blocked",
  "taunt",
  "mascot",
  "chant",
  "whistle",
] as const;

export type SfxId = (typeof SFX_IDS)[number];

/* eslint-disable @typescript-eslint/no-require-imports */
export const SFX_SOURCES: Record<SfxId, number> = {
  kick: require("../../assets/sfx/kick.mp3"),
  goal: require("../../assets/sfx/goal.mp3"),
  save: require("../../assets/sfx/save.mp3"),
  miss: require("../../assets/sfx/miss.mp3"),
  blocked: require("../../assets/sfx/blocked.mp3"),
  taunt: require("../../assets/sfx/taunt.mp3"),
  mascot: require("../../assets/sfx/mascot.mp3"),
  chant: require("../../assets/sfx/chant.mp3"),
  whistle: require("../../assets/sfx/whistle.mp3"),
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
  // Short and speech-like: quiet enough to be atmosphere, loud enough to hear.
  taunt: 0.85,
  mascot: 0.75,
  chant: 0.85,
  whistle: 0.8,
};
