import type { KeeperId, ShotResultKind } from "../game/types";

/**
 * The keeper record as pure data.
 *
 * Split out from the hook so it can be tested without React or AsyncStorage in
 * the way — the arithmetic here was wrong in a way nobody noticed until a
 * player counted, and untested arithmetic is how that happens.
 */

/**
 * How many recent outcomes are kept per keeper, and how many are shown.
 *
 * Storing more than is displayed is deliberate: the window shown can be tuned
 * without throwing away history that has already been collected.
 */
export const FORM_WINDOW = 10;
export const FORM_SHOWN = 5;

export type KeeperTally = {
  faced: number;
  conceded: number;
  /**
   * The last `FORM_WINDOW` outcomes against this keeper, oldest first.
   *
   * Career save percentage is a lifetime average, which means it gets *less*
   * responsive the more the game is played — after a hundred shots one more
   * goal moves it half a point. Form is the number that still moves in a single
   * session, and it is also how the player already talks about the roster
   * ("X has become much better"). See docs/design/penalty-chaos-stickiness.md.
   */
  recent: readonly ShotResultKind[];
};

export type KeeperRecord = Readonly<Partial<Record<KeeperId, KeeperTally>>>;

export const EMPTY_TALLY: KeeperTally = { faced: 0, conceded: 0, recent: [] };

export function tallyFor(record: KeeperRecord, keeperId: KeeperId): KeeperTally {
  return record[keeperId] ?? EMPTY_TALLY;
}

/**
 * Rounded save percentage, or null when they have never met.
 *
 * Takes only the two counters it needs rather than a whole tally, so callers
 * with a bare `{ faced, conceded }` — tests, mostly — do not have to invent a
 * form list to ask a question that has nothing to do with form.
 */
export function savePercent(tally: { faced: number; conceded: number }): number | null {
  if (tally.faced === 0) return null;
  return Math.round(((tally.faced - tally.conceded) / tally.faced) * 100);
}

/** The last `count` outcomes, oldest first. Shorter than `count` early on. */
export function recentForm(tally: KeeperTally, count: number = FORM_SHOWN): ShotResultKind[] {
  return tally.recent.slice(-count);
}

/** How many of the last `count` shots were scored. The number worth leading with. */
export function recentScored(tally: KeeperTally, count: number = FORM_SHOWN): number {
  return recentForm(tally, count).filter((kind) => kind === "goal").length;
}

/**
 * One more shot against a keeper. Only a goal counts against him — a shot into
 * row Z was not his doing, and neither was one that hit someone's uncle.
 *
 * Every outcome joins the form list, though, including the misses. Form is "how
 * have the last five gone", and a shot ballooned over the bar is very much part
 * of how it went.
 */
export function applyShot(
  record: KeeperRecord,
  keeperId: KeeperId,
  kind: ShotResultKind,
): KeeperRecord {
  const current = tallyFor(record, keeperId);
  return {
    ...record,
    [keeperId]: {
      faced: current.faced + 1,
      conceded: current.conceded + (kind === "goal" ? 1 : 0),
      recent: [...current.recent, kind].slice(-FORM_WINDOW),
    },
  };
}

const SHOT_KINDS: readonly ShotResultKind[] = ["goal", "saved", "missed", "blocked"];

function parseRecent(value: unknown): ShotResultKind[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is ShotResultKind =>
      SHOT_KINDS.includes(entry as ShotResultKind),
    )
    .slice(-FORM_WINDOW);
}

export function parseRecord(stored: string | null): KeeperRecord {
  if (!stored) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed as Record<string, unknown>).flatMap(([key, value]) => {
      if (typeof value !== "object" || value === null) return [];
      const { faced, conceded, recent } = value as Partial<KeeperTally>;
      if (typeof faced !== "number" || typeof conceded !== "number") return [];
      // `recent` is absent from every record written before form existed. That
      // is a migration, not corruption: the career counters are still good, so
      // keep them and start the form list from the next shot taken.
      return [[key, { faced, conceded, recent: parseRecent(recent) }] as const];
    });
    return Object.fromEntries(entries);
  } catch {
    // A corrupt record is worth losing silently; it is only bragging rights.
    return {};
  }
}
