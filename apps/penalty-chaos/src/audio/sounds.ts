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

import type { KeeperId } from "../game/types";

export const SFX_IDS = [
  "kick",
  "goal",
  "save",
  "miss",
  "blocked",
  "chant",
  "whistle",
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

/** Which laugh a keeper's taunt plays. Kept here, not in `game/keepers.ts` — a
 * sound is presentation, and that module is deliberately pure parameters. */
export function tauntSfxId(keeper: KeeperId): SfxId {
  return `taunt-${keeper}`;
}
