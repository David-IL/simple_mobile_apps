import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KeeperArchetype } from "../game/types";

/**
 * Player-chosen keeper names, stored on the device and nowhere else.
 *
 * This is the whole point of the rename feature, per ADR 8: shipping a real
 * goalkeeper's name in the binary is a personality-rights problem, but a name
 * typed on a phone and kept on that phone is the user's own business. It must
 * therefore never be transmitted, and must never appear on anything shareable —
 * result cards render the archetype's shipped name instead.
 */
const STORAGE_KEY = "penalty-chaos/keeper-names";
const MAX_NAME_LENGTH = 18;

export type KeeperNames = Readonly<Record<string, string>>;

export function displayName(keeper: KeeperArchetype, names: KeeperNames): string {
  const custom = names[keeper.id]?.trim();
  return custom && custom.length > 0 ? custom : keeper.name;
}

export function sanitiseName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

function parse(stored: string | null): KeeperNames {
  if (!stored) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    );
    return Object.fromEntries(entries);
  } catch {
    // Corrupt or hand-edited storage shouldn't stop the game launching.
    return {};
  }
}

export function useKeeperNames() {
  const [names, setNames] = useState<KeeperNames>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active) setNames(parse(stored));
      })
      .catch(() => {
        // Storage unavailable — fall back to shipped names rather than failing.
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const rename = useCallback((keeperId: string, raw: string) => {
    setNames((previous) => {
      const clean = sanitiseName(raw);
      const next = { ...previous };
      if (clean.length === 0) delete next[keeperId];
      else next[keeperId] = clean;
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // Best effort. The rename still applies for this session.
      });
      return next;
    });
  }, []);

  return { names, rename, ready };
}
