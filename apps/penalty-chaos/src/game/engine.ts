import {
  ZONE_COLS,
  ZONES,
  type Aim,
  type Disruption,
  type DisruptionEffect,
  type HeadlineKey,
  type KeeperArchetype,
  type Power,
  type Rng,
  type RoundSetup,
  type ShotResult,
  type Zone,
  type ZoneCol,
  type ZoneRow,
} from "./types";

/** How far off-centre the aim can be pushed at full power. >1 is how you miss. */
const AIM_RANGE = 1.15;
/** Scatter at zero power and the extra added at full power. */
const BASE_SPREAD = 0.045;
const POWER_SPREAD = 0.17;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export function colOf(x: number): ZoneCol {
  if (x < -1 / 3) return "left";
  if (x > 1 / 3) return "right";
  return "centre";
}

export function rowOf(y: number): ZoneRow {
  return y < 0.5 ? "low" : "high";
}

/** Null when the ball never crossed the goal mouth. */
export function zoneOf(aim: Aim): Zone | null {
  if (Math.abs(aim.x) > 1 || aim.y > 1 || aim.y < 0) return null;
  return `${colOf(aim.x)}-${rowOf(aim.y)}`;
}

export function splitZone(zone: Zone): { col: ZoneCol; row: ZoneRow } {
  const [col, row] = zone.split("-") as [ZoneCol, ZoneRow];
  return { col, row };
}

/** One step away: same row next column, or same column other row. Not diagonals. */
export function areAdjacent(a: Zone, b: Zone): boolean {
  if (a === b) return false;
  const left = splitZone(a);
  const right = splitZone(b);
  if (left.col === right.col) return true;
  if (left.row !== right.row) return false;
  return Math.abs(ZONE_COLS.indexOf(left.col) - ZONE_COLS.indexOf(right.col)) === 1;
}

/**
 * Turn a drag gesture into an aim and a power. Lives here rather than in the
 * component so the preview the player sees and the shot the engine resolves are
 * computed by the same function — if these two ever drift, every miss looks
 * like the game cheating.
 *
 * `dy` is screen-space: negative means the finger moved up the screen.
 */
export function aimFromDrag(
  dx: number,
  dy: number,
  maxDrag: number,
  powerCap = 1,
): { aim: Aim; power: Power } {
  const length = Math.hypot(dx, dy);
  if (length === 0) return { aim: { x: 0, y: 0 }, power: 0 };

  const power = Math.min(length / maxDrag, 1, powerCap);
  const scale = (power / length) * AIM_RANGE;
  return { aim: { x: dx * scale, y: -dy * scale }, power };
}

function randomZone(diveBias: number, rng: Rng): Zone {
  // Keepers dive more often than they stand up, so centre is deliberately light.
  const weights: Array<[ZoneCol, number]> = [
    ["left", 1 - diveBias],
    ["centre", 0.55],
    ["right", 1 + diveBias],
  ];
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  let col: ZoneCol = "centre";
  for (const [candidate, weight] of weights) {
    roll -= weight;
    if (roll <= 0) {
      col = candidate;
      break;
    }
  }
  // Slight bias low: most penalties are, so most dives are.
  const row: ZoneRow = rng() < 0.58 ? "low" : "high";
  return `${col}-${row}`;
}

/**
 * The zone this player has *actually favoured*, or null if there is no pattern
 * worth reading.
 *
 * Two conditions, both deliberate. The zone must appear at least twice — a
 * single shot is not a habit — and it must beat every other zone outright.
 *
 * The strictness matters. An earlier version broke ties toward the most recent
 * shot, which meant that with no real pattern (say left, right, left, right)
 * the keeper simply dived at wherever you last shot. That collapsed the whole
 * roster to one exploit: never shoot where you just shot. Requiring a genuine
 * repeat makes "mix it up" the real counterplay, and makes an unread keeper
 * guess rather than shadow you.
 */
export function readablePattern(history: readonly Zone[]): Zone | null {
  if (history.length < 2) return null;

  const counts = new Map<Zone, number>();
  for (const zone of history) counts.set(zone, (counts.get(zone) ?? 0) + 1);

  let best: Zone | null = null;
  let bestCount = 0;
  let runnerUp = 0;
  for (const [zone, count] of counts) {
    if (count > bestCount) {
      runnerUp = bestCount;
      best = zone;
      bestCount = count;
    } else if (count > runnerUp) {
      runnerUp = count;
    }
  }

  if (bestCount < 2 || bestCount === runnerUp) return null;
  return best;
}

/**
 * The keeper commits before the player aims. That ordering is what makes the
 * telegraph an honest tell rather than decoration.
 */
export function chooseDive(
  keeper: KeeperArchetype,
  history: readonly Zone[],
  effect: DisruptionEffect,
  rng: Rng,
): Zone {
  const depth = Math.floor(keeper.readDepth * effect.readDepthMultiplier);
  if (depth > 0) {
    const pattern = readablePattern(history.slice(-depth));
    if (pattern && rng() < keeper.readAccuracy) return pattern;
  }
  return randomZone(keeper.diveBias, rng);
}

/** What the keeper shows. Null when it gives nothing away. */
export function chooseTell(
  keeper: KeeperArchetype,
  dive: Zone,
  effect: DisruptionEffect,
  rng: Rng,
): Zone | null {
  const strength = clamp(keeper.telegraph + effect.telegraphBonus, 0, 1);
  if (rng() >= strength) return null;
  if (rng() < keeper.bluffRate) {
    const others = ZONES.filter((zone) => zone !== dive);
    const bluff = others[Math.floor(rng() * others.length)];
    return bluff ?? dive;
  }
  return dive;
}

export function setupRound(
  keeper: KeeperArchetype,
  history: readonly Zone[],
  disruption: Disruption | null,
  effect: DisruptionEffect,
  rng: Rng,
): RoundSetup {
  const keeperDive = chooseDive(keeper, history, effect, rng);
  return {
    disruption,
    effect,
    keeperDive,
    keeperTell: chooseTell(keeper, keeperDive, effect, rng),
  };
}

/** Triangular noise on [-1, 1] — cheaper than a gaussian and tails off sensibly. */
function jitter(rng: Rng): number {
  return rng() + rng() - 1;
}

function missHeadline(landing: Aim): HeadlineKey {
  if (landing.y > 1) return "missOver";
  if (landing.y < 0) return "missGround";
  return landing.x < 0 ? "missWideLeft" : "missWideRight";
}

function goalHeadline(zone: Zone): HeadlineKey {
  const { col, row } = splitZone(zone);
  if (col === "centre") return row === "high" ? "goalCentreHigh" : "goalCentreLow";
  return row === "high" ? "goalCornerHigh" : "goalCornerLow";
}

export function resolveShot(args: {
  aim: Aim;
  power: Power;
  keeper: KeeperArchetype;
  setup: RoundSetup;
  rng: Rng;
}): ShotResult {
  const { aim, power, keeper, setup, rng } = args;
  const { effect, keeperDive } = setup;

  const usablePower = Math.min(power, effect.powerCap);
  const spread = BASE_SPREAD + POWER_SPREAD * usablePower;

  const landing: Aim = {
    x: aim.x + effect.windX + jitter(rng) * spread,
    // Vertical scatter matters less — sliced shots go wide far more than high.
    y: aim.y + jitter(rng) * spread * 0.7,
  };

  const zone = zoneOf(landing);
  if (!zone) {
    return { kind: "missed", landing, zone: null, keeperDive, headline: missHeadline(landing) };
  }

  const { col } = splitZone(zone);
  if (effect.blockedCol === col) {
    return { kind: "blocked", landing, zone, keeperDive, headline: "blocked" };
  }

  if (zone === keeperDive) {
    return { kind: "saved", landing, zone, keeperDive, headline: "saveGuessed" };
  }

  const reach = clamp(keeper.reach + effect.reachBonus, 0, 1);
  if (areAdjacent(zone, keeperDive) && rng() < reach) {
    return { kind: "saved", landing, zone, keeperDive, headline: "saveFingertips" };
  }

  return { kind: "goal", landing, zone, keeperDive, headline: goalHeadline(zone) };
}
