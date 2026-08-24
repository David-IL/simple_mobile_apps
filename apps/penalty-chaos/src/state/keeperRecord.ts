import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KeeperId, ShotResultKind } from "../game/types";
import { applyShot, parseRecord, type KeeperRecord } from "./keeperTally";

export { savePercent, tallyFor, type KeeperRecord, type KeeperTally } from "./keeperTally";

/**
 * How every keeper has done against this phone, for good.
 *
 * The persistence here is deliberately more careful than the other stores in
 * this app, because the first version lost shots and it took a player counting
 * to notice. Two separate defects, both worth remembering:
 *
 * 1. **The write lived inside a `setState` updater.** On the final shot of a
 *    shootout the match screen unmounts in the same batch, and React is free to
 *    discard queued updates for a component that is going away — so the updater
 *    never ran and the last shot of every match was silently dropped. That is
 *    the "scored 4 of 4 after scoring 5 of 5" the player reported.
 * 2. **The write serialised in-memory state, which starts empty.** The record
 *    loads asynchronously, so a shot taken before the load resolved would write
 *    a record built from `{}` — wiping every other keeper's history. Nobody had
 *    hit it yet, but it was a data-loss bug waiting for a fast first tap.
 *
 * Both are fixed the same way: every write is a read-modify-write against
 * storage rather than against React state, and writes are queued behind each
 * other so two shots cannot interleave. Nothing here depends on a component
 * still being mounted.
 */
const STORAGE_KEY = "penalty-chaos/keeper-record";

/**
 * Serialises writes. Module-level on purpose — two mounted copies of this hook
 * (the match screen and the setup screen) must not interleave their
 * read-modify-write cycles.
 */
let writeQueue: Promise<KeeperRecord> = Promise.resolve({});

async function commitShot(keeperId: KeeperId, kind: ShotResultKind): Promise<KeeperRecord> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const next = applyShot(parseRecord(stored), keeperId, kind);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function useKeeperRecord() {
  const [record, setRecord] = useState<KeeperRecord>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active) setRecord(parseRecord(stored));
      })
      .catch(() => {
        // Storage unavailable — an empty record just reads as "never faced".
      });
    return () => {
      active = false;
    };
  }, []);

  const recordShot = useCallback((keeperId: KeeperId, kind: ShotResultKind) => {
    // The chain starts synchronously here, so the write is already in flight
    // before this screen can unmount.
    writeQueue = writeQueue
      .then(() => commitShot(keeperId, kind))
      .catch(() => {
        // Best effort. Losing bragging rights must never interrupt a match.
        return {} as KeeperRecord;
      });
    void writeQueue.then((next) => {
      if (mounted.current) setRecord(next);
    });
  }, []);

  return { record, recordShot };
}
