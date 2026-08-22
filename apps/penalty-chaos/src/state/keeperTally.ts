import type { KeeperId, ShotResultKind } from "../game/types";

/**
 * The keeper record as pure data.
 *
 * Split out from the hook so it can be tested without React or AsyncStorage in
 * the way — the arithmetic here was wrong in a way nobody noticed until a
 * player counted, and untested arithmetic is how that happens.
 */

export type KeeperTally = { faced: number; conceded: number };
export type KeeperRecord = Readonly<Partial<Record<KeeperId, KeeperTally>>>;

export const EMPTY_TALLY: KeeperTally = { faced: 0, conceded: 0 };

export function tallyFor(record: KeeperRecord, keeperId: KeeperId): KeeperTally {
  return record[keeperId] ?? EMPTY_TALLY;
}

/** Rounded save percentage, or null when they have never met. */
export function savePercent(tally: KeeperTally): number | null {
  if (tally.faced === 0) return null;
  return Math.round(((tally.faced - tally.conceded) / tally.faced) * 100);
}

/**
 * One more shot against a keeper. Only a goal counts against him — a shot into
 * row Z was not his doing, and neither was one that hit someone's uncle.
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
    },
  };
}

export function parseRecord(stored: string | null): KeeperRecord {
  if (!stored) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed as Record<string, unknown>).flatMap(([key, value]) => {
      if (typeof value !== "object" || value === null) return [];
      const { faced, conceded } = value as Partial<KeeperTally>;
      if (typeof faced !== "number" || typeof conceded !== "number") return [];
      return [[key, { faced, conceded }] as const];
    });
    return Object.fromEntries(entries);
  } catch {
    // A corrupt record is worth losing silently; it is only bragging rights.
    return {};
  }
}
