import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { limitName } from "./keeperNames";

/**
 * The two takers' names in pass-the-phone mode, remembered on the device.
 *
 * Kept because retyping them was the friction that showed up first in real
 * play: "Different keeper" and "Give up" both dropped you back to an empty
 * setup screen, and the same two people were entering the same two names every
 * few minutes.
 *
 * Persisted rather than merely lifted into app state on purpose. The within-a-
 * session case is the loud one, but the same two people play again tomorrow,
 * and blank fields on every launch is the same tedium at a slower rate. Storage
 * is already how this app remembers keeper names, language and mute, so this
 * costs nothing new — and, like those, it never leaves the phone.
 */
const STORAGE_KEY = "penalty-chaos/player-names";
const MAX_PLAYER_NAME = 14;

export type PlayerNames = readonly [string, string];

const EMPTY: PlayerNames = ["", ""];

function parse(stored: string | null): PlayerNames {
  if (!stored) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return EMPTY;
    const first = typeof parsed[0] === "string" ? limitName(parsed[0], MAX_PLAYER_NAME) : "";
    const second = typeof parsed[1] === "string" ? limitName(parsed[1], MAX_PLAYER_NAME) : "";
    return [first, second];
  } catch {
    // Corrupt or hand-edited storage should not stop a match starting.
    return EMPTY;
  }
}

export function usePlayerNames() {
  const [names, setNames] = useState<PlayerNames>(EMPTY);
  // SetupScreen remounts this hook every time a match ends ("Give up",
  // "Different keeper"), so the load below races a player who starts typing
  // straight away. `dirty` remembers that a real edit already happened, so
  // the load never clobbers it once it finally resolves.
  const dirty = useRef(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && !dirty.current) setNames(parse(stored));
      })
      .catch(() => {
        // Storage unavailable — empty fields are a workable fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  const setPlayerName = useCallback((index: 0 | 1, raw: string) => {
    dirty.current = true;
    setNames((previous) => {
      const next: [string, string] = [previous[0], previous[1]];
      next[index] = limitName(raw, MAX_PLAYER_NAME);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // Best effort; the name still applies for this session.
      });
      return next;
    });
  }, []);

  return { names, setPlayerName, maxLength: MAX_PLAYER_NAME };
}
