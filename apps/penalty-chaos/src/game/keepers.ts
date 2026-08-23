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
    stillChance: 0.22,
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
    // "Does not move. Does not need to." was previously just the blurb — the
    // random dive had no lever for it at all, so he committed to a side about
    // as often as everyone else (roster default below is 0.22). This is the
    // lever: three dives in four now stay put, matching the roster's one
    // keeper whose whole identity is not diving.
    stillChance: 0.75,
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
    stillChance: 0.22,
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
    stillChance: 0.22,
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
    stillChance: 0.22,
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
    stillChance: 0.22,
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
    stillChance: 0.22,
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
    stillChance: 0.22,
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
  // A keeper who mostly camps the centre is easier to beat than his other
  // numbers suggest — "aim wide" becomes close to a guaranteed plan — so this
  // counts against him the same way telegraph does.
  return keeper.reach * 2 + readPressure - keeper.telegraph * 0.8 - keeper.stillChance * 0.5;
}

/**
 * The four axes a player is shown on the select screen.
 *
 * Every one of these **changes how a shot resolves**. That constraint is the
 * point: a bar is a promise about how the game behaves, and a keeper's build —
 * his girth and stature — is art with no effect on any outcome. Showing a "size"
 * score would invent a mechanic that does not exist, which is precisely how a
 * game earns the "it's rigged" reputation this genre already has. Build already
 * *reflects* reach (The Wall is the widest figure because his reach is the
 * highest), so the picture carries it without a bar pretending otherwise.
 */
export const TRAIT_IDS = ["memory", "telegraph", "reach", "talk"] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

/** Raw, before normalising: whatever number best expresses that axis. */
function rawTrait(keeper: KeeperArchetype, trait: TraitId): number {
  switch (trait) {
    case "memory":
      // Depth alone is misleading — a keeper who looks back four shots but
      // rarely acts on it is not a good reader.
      return keeper.readDepth * keeper.readAccuracy;
    case "telegraph":
      return keeper.telegraph;
    case "reach":
      return keeper.reach;
    case "talk":
      return keeper.tauntRate;
  }
}

/**
 * Scores in 0..1, normalised **across the roster** rather than against an
 * absolute scale. A bar is only useful for choosing between keepers, so the
 * comparison that matters is with the other seven.
 */
export function traitScores(keeper: KeeperArchetype): Record<TraitId, number> {
  const scores = {} as Record<TraitId, number>;
  for (const trait of TRAIT_IDS) {
    const all = KEEPERS.map((candidate) => rawTrait(candidate, trait));
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = max - min || 1;
    scores[trait] = (rawTrait(keeper, trait) - min) / span;
  }
  return scores;
}
