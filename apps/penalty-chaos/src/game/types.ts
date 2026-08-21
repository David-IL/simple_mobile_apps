/**
 * Shared vocabulary for the penalty engine. No React and no display copy in
 * here — this is all pure. Anything a player reads lives in src/i18n.
 */

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

export const KEEPER_IDS = [
  "sunday",
  "statue",
  "chatterbox",
  "line-dancer",
  "showboat",
  "veteran",
  "wall",
  "mind-reader",
] as const;

export type KeeperId = (typeof KEEPER_IDS)[number];

/** How the figure is drawn this instant. Art concern, but the engine picks it. */
export type KeeperPose = "ready" | "lean" | "dive" | "beaten" | "celebrate";

/**
 * A keeper is a parameter set, and nothing else. Its name, blurb and taunts are
 * translated copy in src/i18n; its shirt, build and squad number are art in
 * src/components/art/keeperLooks.ts. Both are keyed by this id.
 */
export type KeeperArchetype = {
  id: KeeperId;
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
};

export const DISRUPTION_IDS = [
  "crosswind",
  "pitch-invader",
  "low-sun",
  "muddy-spot",
  "away-end",
] as const;

export type DisruptionId = (typeof DISRUPTION_IDS)[number];

/** Name and brief are translated copy — see src/i18n, keyed by id. */
export type Disruption = { id: DisruptionId };

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

/**
 * Which line of commentary to show. A key, not a sentence — the engine has no
 * business knowing what language anyone reads.
 */
export type HeadlineKey =
  | "missOver"
  | "missGround"
  | "missWideLeft"
  | "missWideRight"
  | "blocked"
  | "saveGuessed"
  | "saveFingertips"
  | "goalCentreLow"
  | "goalCentreHigh"
  | "goalCornerLow"
  | "goalCornerHigh";

export type ShotResult = {
  kind: ShotResultKind;
  /** Where the ball actually ended up, after scatter and wind. */
  landing: Aim;
  /** Null when the ball never reached the goal mouth. */
  zone: Zone | null;
  keeperDive: Zone;
  headline: HeadlineKey;
};

export type Rng = () => number;
