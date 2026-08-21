/** Shared vocabulary for the penalty engine. No React in here — this is all pure. */

export const ZONE_COLS = ["left", "centre", "right"] as const;
export const ZONE_ROWS = ["low", "high"] as const;

export type ZoneCol = (typeof ZONE_COLS)[number];
export type ZoneRow = (typeof ZONE_ROWS)[number];

/** The goal mouth is split into six zones. Keeper picks one; ball lands in one. */
export type Zone = `${ZoneCol}-${ZoneRow}`;

export const ZONES: readonly Zone[] = ZONE_ROWS.flatMap((row) =>
  ZONE_COLS.map((col) => `${col}-${row}` as Zone),
);

/**
 * Where the shot is pointed, in goal-normalised coordinates.
 * x: -1 = left post, +1 = right post. y: 0 = grass, 1 = crossbar.
 * Values outside those bounds are legal — they are how you miss.
 */
export type Aim = { x: number; y: number };

/** 0..1. Higher power reaches the corners but scatters more. */
export type Power = number;

export type KeeperArchetype = {
  id: string;
  /** The name that ships in the binary. Never a real person — see ADR 8. */
  name: string;
  blurb: string;
  /** Shown between shots. Flavour only; never changes the outcome. */
  taunts: readonly string[];
  /** How often a taunt appears at all, 0..1. */
  tauntRate: number;
  /** How many of your recent shots it pattern-matches. 0 = pure guesswork. */
  readDepth: number;
  /** Chance the read actually drives the dive, 0..1. */
  readAccuracy: number;
  /** Natural lean. -1 = always goes left, +1 = always right, 0 = even. */
  diveBias: number;
  /**
   * How strongly it pre-commits before you shoot, 0..1. This is the player's
   * counterplay to readDepth: a keeper that reads you hard should telegraph
   * little, and vice versa. Balance the roster on this axis.
   */
  telegraph: number;
  /** Chance a telegraph is a bluff pointing at the wrong zone, 0..1. */
  bluffRate: number;
  /** Chance of saving a shot in a zone *adjacent* to the dive, 0..1. */
  reach: number;
  /** Two-letter monogram for the shirt. Keeps art needs to zero for v1. */
  monogram: string;
  shirt: string;
};

export type DisruptionId =
  | "crosswind"
  | "pitch-invader"
  | "low-sun"
  | "muddy-spot"
  | "mascot"
  | "away-end";

export type Disruption = {
  id: DisruptionId;
  name: string;
  /** Shown on the banner before the run-up. The player must be able to plan around it. */
  brief: string;
  icon: string;
};

/**
 * Everything the disruption changes, resolved once at round start so the UI and
 * the engine agree. Keeping effects as plain numbers is what keeps this inside
 * ADR 7's "a sprite on a tween plus a term in the outcome function".
 */
export type DisruptionEffect = {
  /** Lateral push added to the ball's landing x. */
  windX: number;
  /** Hard cap on usable power. */
  powerCap: number;
  /** Column the pitch invader is standing in, if any. */
  blockedCol: ZoneCol | null;
  /** Hide the aim preview once the drag starts. */
  blindAim: boolean;
  /** Multiplier on the keeper's readDepth this round. */
  readDepthMultiplier: number;
  /** Additive override on the keeper's telegraph this round. */
  telegraphBonus: number;
  /** Additive change to the keeper's reach this round. */
  reachBonus: number;
};

export type RoundSetup = {
  disruption: Disruption | null;
  effect: DisruptionEffect;
  /** Decided before the player aims, so the telegraph is an honest tell. */
  keeperDive: Zone;
  /** What the keeper *shows*. Null when it gives nothing away. */
  keeperTell: Zone | null;
};

export type ShotResultKind = "goal" | "saved" | "missed" | "blocked";

export type ShotResult = {
  kind: ShotResultKind;
  /** Where the ball actually ended up, after scatter and wind. */
  landing: Aim;
  /** Null when the ball never reached the goal mouth. */
  zone: Zone | null;
  keeperDive: Zone;
  headline: string;
};

export type Rng = () => number;
