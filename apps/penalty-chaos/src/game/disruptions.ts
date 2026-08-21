import { ZONE_COLS, type Disruption, type DisruptionEffect, type Rng, type ZoneCol } from "./types";

/**
 * The comedy. Every one of these is *telegraphed before the run-up* — that rule
 * is the whole design, not a preference. Research found that the two shipped
 * games with sprung mid-shot disruptions earn their sharpest one-star reviews
 * from exactly that feature: a random event that punishes you after you have
 * committed reads as cheating, not as a joke. Shown in advance, it is a puzzle.
 *
 * See docs/research/penalty-chaos.md §6b.
 */
export const DISRUPTIONS: readonly Disruption[] = [
  {
    id: "crosswind",
    name: "Crosswind",
    brief: "The flag is horizontal. The ball will drift — aim into it.",
    icon: "🚩",
  },
  {
    id: "pitch-invader",
    name: "Pitch invader",
    brief: "Someone's uncle is on the pitch. He is blocking one side of the goal.",
    icon: "🏃",
  },
  {
    id: "low-sun",
    name: "Low sun",
    brief: "Blinding. You lose the aim line the moment you start to drag.",
    icon: "🌇",
  },
  {
    id: "muddy-spot",
    name: "Muddy penalty spot",
    brief: "No run-up worth having. You cannot get full power on it — place it.",
    icon: "🌧️",
  },
  {
    id: "mascot",
    name: "Mascot behind the goal",
    brief: "A giant badger is dancing. The keeper has stopped paying attention to you.",
    icon: "🦡",
  },
  {
    id: "away-end",
    name: "The away end starts singing",
    brief: "He's playing to the crowd — commits early and showily, but he's stretching.",
    icon: "📣",
  },
];

export const NO_EFFECT: DisruptionEffect = {
  windX: 0,
  powerCap: 1,
  blockedCol: null,
  blindAim: false,
  readDepthMultiplier: 1,
  telegraphBonus: 0,
  reachBonus: 0,
};

function pick<T>(items: readonly T[], rng: Rng): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error("Cannot pick from an empty list");
  return item;
}

/**
 * Resolve a disruption into concrete numbers once, at round start, so that the
 * banner the player reads and the maths the engine runs cannot disagree.
 */
export function effectFor(disruption: Disruption | null, rng: Rng): DisruptionEffect {
  if (!disruption) return NO_EFFECT;

  switch (disruption.id) {
    case "crosswind": {
      // Always meaningful enough to have to correct for, never enough to be fatal.
      const strength = 0.18 + rng() * 0.16;
      return { ...NO_EFFECT, windX: rng() < 0.5 ? -strength : strength };
    }
    case "pitch-invader":
      return { ...NO_EFFECT, blockedCol: pick(ZONE_COLS, rng) };
    case "low-sun":
      return { ...NO_EFFECT, blindAim: true };
    case "muddy-spot":
      return { ...NO_EFFECT, powerCap: 0.62 };
    case "mascot":
      // Keeper stops reading you. Free hit for anyone who has been predictable.
      return { ...NO_EFFECT, readDepthMultiplier: 0 };
    case "away-end":
      // Shows you exactly where he's going, then very nearly gets there anyway.
      return { ...NO_EFFECT, telegraphBonus: 1, reachBonus: 0.15 };
  }
}

/** Which side of the goal the invader is standing in, for the banner text. */
export function blockedColLabel(col: ZoneCol): string {
  return col === "centre" ? "the middle" : `the ${col}`;
}

/**
 * Roughly one shot in two is disrupted. Frequent enough to be the texture of the
 * game, rare enough that a clean shot still feels like the normal case.
 */
export function rollDisruption(rng: Rng, chance = 0.5): Disruption | null {
  if (rng() >= chance) return null;
  return pick(DISRUPTIONS, rng);
}
