import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KeeperId, ShotResultKind } from "../game/types";

/**
 * How every keeper has done against this phone, for good.
 *
 * Built because it is what the player was already doing in his head. Two
 * sessions in he was talking about keepers by name, with reputations — "X has
 * become much better", "Y is bad" — and the app remembered nothing about any of
 * them between matches. This turns a feeling he was already having into
 * something the game can show him.
 *
 * Recorded per shot rather than per match, so an abandoned shootout still
 * counts. The shots happened; the keeper faced them.
 */
const STORAGE_KEY = "penalty-chaos/keeper-record";

export type KeeperTally = { faced: number; conceded: number };
export type KeeperRecord = Readonly<Partial<Record<KeeperId, KeeperTally>>>;

const EMPTY: KeeperTally = { faced: 0, conceded: 0 };

export function tallyFor(record: KeeperRecord, keeperId: KeeperId): KeeperTally {
  return record[keeperId] ?? EMPTY;
}

/** Rounded save percentage, or null when they have never met. */
export function savePercent(tally: KeeperTally): number | null {
  if (tally.faced === 0) return null;
  return Math.round(((tally.faced - tally.conceded) / tally.faced) * 100);
}

function parse(stored: string | null): KeeperRecord {
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

export function useKeeperRecord() {
  const [record, setRecord] = useState<KeeperRecord>({});

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active) setRecord(parse(stored));
      })
      .catch(() => {
        // Storage unavailable — an empty record just reads as "never faced".
      });
    return () => {
      active = false;
    };
  }, []);

  const recordShot = useCallback((keeperId: KeeperId, kind: ShotResultKind) => {
    setRecord((previous) => {
      const current = previous[keeperId] ?? EMPTY;
      const next: KeeperRecord = {
        ...previous,
        [keeperId]: {
          faced: current.faced + 1,
          // Only a goal counts against him. A shot into row Z was not his doing,
          // and neither was one that hit someone's uncle.
          conceded: current.conceded + (kind === "goal" ? 1 : 0),
        },
      };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // Best effort; the tally still holds for this session.
      });
      return next;
    });
  }, []);

  return { record, recordShot };
}
