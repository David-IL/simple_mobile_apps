import type { KeeperArchetype, KeeperId } from "./types";

/**
 * Keeper archetypes — pure parameters. Every one is an invented character; no
 * real goalkeeper's name or likeness ships in this app. See
 * docs/adr/0008-no-real-person-likenesses-or-club-ip.md.
 *
 * Names, blurbs and taunts are translated copy (src/i18n); shirt colours, build
 * and squad numbers are art (src/components/art/keeperLooks.ts). Both are keyed
 * by `id`. Nothing a player reads or looks at belongs in this file.
 *
 * A keeper is a parameter set, so the roster is also the difficulty curve. The
 * balancing axis is readDepth vs. telegraph: a keeper allowed to read your
 * pattern hard must give something away, or beating it stops being a skill.
 */
export const KEEPERS: readonly KeeperArchetype[] = [
  {
    id: "sunday",
    tauntRate: 0.5,
    readDepth: 0,
    readAccuracy: 0,
    diveBias: 0,
    telegraph: 0.85,
    bluffRate: 0,
    reach: 0.15,
  },
  {
    id: "statue",
    tauntRate: 0.3,
    readDepth: 0,
    readAccuracy: 0,
    diveBias: 0,
    telegraph: 1,
    bluffRate: 0,
    reach: 0.5,
  },
  {
    id: "chatterbox",
    tauntRate: 0.95,
    // readDepth 2, not 1: a read now needs a genuine repeat, so a window of one
    // shot could never fire and this keeper would lose its read entirely.
    readDepth: 2,
    readAccuracy: 0.35,
    diveBias: -0.15,
    telegraph: 0.55,
    bluffRate: 0.15,
    reach: 0.3,
  },
  {
    id: "line-dancer",
    tauntRate: 0.7,
    readDepth: 2,
    readAccuracy: 0.4,
    diveBias: 0,
    telegraph: 0,
    bluffRate: 0,
    reach: 0.2,
  },
  {
    id: "showboat",
    tauntRate: 0.8,
    readDepth: 2,
    readAccuracy: 0.45,
    diveBias: 0.1,
    telegraph: 0.9,
    bluffRate: 0.45,
    reach: 0.35,
  },
  {
    id: "veteran",
    tauntRate: 0.5,
    readDepth: 2,
    readAccuracy: 0.55,
    diveBias: 0,
    telegraph: 0.45,
    bluffRate: 0.2,
    reach: 0.4,
  },
  {
    id: "wall",
    tauntRate: 0.4,
    readDepth: 2,
    readAccuracy: 0.5,
    diveBias: 0,
    telegraph: 0.3,
    bluffRate: 0.15,
    reach: 0.65,
  },
  {
    id: "mind-reader",
    tauntRate: 0.45,
    readDepth: 4,
    readAccuracy: 0.75,
    diveBias: 0,
    telegraph: 0.1,
    bluffRate: 0.3,
    reach: 0.45,
  },
];

export function keeperById(id: KeeperId): KeeperArchetype {
  const found = KEEPERS.find((keeper) => keeper.id === id);
  if (!found) {
    // The roster is a compile-time constant, so this is unreachable in practice.
    const fallback = KEEPERS[0];
    if (!fallback) throw new Error("Keeper roster is empty");
    return fallback;
  }
  return found;
}

/**
 * Rough ordering for the select screen. Not shown as a number — it just keeps
 * the list walking from "you will score" to "you will not".
 */
export function difficultyOf(keeper: KeeperArchetype): number {
  const readPressure = keeper.readDepth * keeper.readAccuracy;
  return keeper.reach * 2 + readPressure - keeper.telegraph * 0.8;
}
