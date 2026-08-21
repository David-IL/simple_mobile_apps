import type { KeeperArchetype } from "./types";

/**
 * Keeper archetypes. Every one of these is an invented character — no real
 * goalkeeper's name or likeness ships in this app. See
 * docs/adr/0008-no-real-person-likenesses-or-club-ip.md.
 *
 * A keeper is a parameter set, so the roster is also the difficulty curve.
 * The balancing axis is readDepth vs. telegraph: a keeper allowed to read your
 * pattern hard must give something away, or beating it stops being a skill.
 */
export const KEEPERS: readonly KeeperArchetype[] = [
  {
    id: "sunday",
    name: "The Sunday Keeper",
    blurb: "Turned up in jeans. Dives early, dives wrong.",
    monogram: "SK",
    shirt: "#84cc16",
    taunts: ["Ref, is it half time?", "I've got a five-a-side at four.", "Don't kick it hard, yeah?"],
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
    name: "The Statue",
    blurb: "Does not move. Does not need to. Aim away from the middle.",
    monogram: "ST",
    shirt: "#64748b",
    taunts: ["...", "I am not going anywhere.", "Try the corner. Go on."],
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
    name: "The Chatterbox",
    blurb: "Never stops talking. Occasionally remembers to save one.",
    monogram: "CB",
    shirt: "#f59e0b",
    taunts: [
      "Nice boots. Did they come with the shot?",
      "Left. You're going left. You've got a left face.",
      "My nan takes these better.",
      "I'll tell you where you're going: nowhere.",
    ],
    tauntRate: 0.95,
    readDepth: 1,
    readAccuracy: 0.35,
    diveBias: -0.15,
    telegraph: 0.55,
    bluffRate: 0.15,
    reach: 0.3,
  },
  {
    id: "line-dancer",
    name: "The Line-Dancer",
    blurb: "Jigs about so much you cannot read him. Cannot reach much either.",
    monogram: "LD",
    shirt: "#ec4899",
    taunts: ["Watch the feet!", "Left, right, left, right, whoops.", "This is my warm-up."],
    tauntRate: 0.7,
    readDepth: 1,
    readAccuracy: 0.4,
    diveBias: 0,
    telegraph: 0,
    bluffRate: 0,
    reach: 0.2,
  },
  {
    id: "showboat",
    name: "The Showboat",
    blurb: "Points at the corner he's going to save. Lies about half the time.",
    monogram: "SB",
    shirt: "#a855f7",
    taunts: [
      "That one. I'm saving that one.",
      "Cameras on me, mate.",
      "I'll even tell you where I'm going. Probably.",
    ],
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
    name: "The Veteran",
    blurb: "Seen a thousand of these. Reads you a bit, shows you a bit.",
    monogram: "VT",
    shirt: "#0ea5e9",
    taunts: ["I've saved this one before.", "You've got one shot in you, son.", "Take your time."],
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
    name: "The Wall",
    blurb: "Enormous. Gets a hand to things he has no business reaching.",
    monogram: "WL",
    shirt: "#ef4444",
    taunts: ["Good luck.", "There is no gap.", "You'll need the postage stamp."],
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
    name: "The Mind-Reader",
    blurb: "Remembers every shot you've taken. Gives away nothing. Mix it up.",
    monogram: "MR",
    shirt: "#1e293b",
    taunts: ["I know.", "You've been there twice already.", "Go on then. Same corner."],
    tauntRate: 0.45,
    readDepth: 4,
    readAccuracy: 0.75,
    diveBias: 0,
    telegraph: 0.1,
    bluffRate: 0.3,
    reach: 0.45,
  },
];

export const DEFAULT_KEEPER_ID = "chatterbox";

export function keeperById(id: string): KeeperArchetype {
  const found = KEEPERS.find((k) => k.id === id);
  if (!found) {
    // Roster is a compile-time constant, so this only fires if stored state has
    // gone stale after a keeper was renamed away or removed in an update.
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
