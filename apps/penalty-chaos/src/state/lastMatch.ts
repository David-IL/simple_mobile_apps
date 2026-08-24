import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MatchMode } from "../game/match";
import { KEEPER_IDS, type KeeperId } from "../game/types";

/**
 * The last opponent faced on this phone, and in which mode.
 *
 * Everything else about a match was already remembered — keeper names, player
 * names, language, mute — but the *opponent* was not. The setup screen started
 * at `KEEPERS[0]` on every launch, so the app reset to the easiest keeper in
 * the roster each time, having faithfully preserved the things nobody cared
 * about.
 *
 * That is the wrong way round. Playtesting found the keepers are the product:
 * they get talked about by name, with opinions attached, across sessions. So
 * the app should open on the last rivalry rather than on a menu, and the home
 * screen's rematch card is what this store exists to feed.
 *
 * See docs/design/penalty-chaos-stickiness.md.
 */
const STORAGE_KEY = "penalty-chaos/last-match";

export type LastMatch = {
  mode: MatchMode;
  keeperId: KeeperId;
  /**
   * The names that match was played under, stored rather than looked up again.
   *
   * Re-resolving them at rematch time meant reading the player-name store from
   * a second place, and that copy went stale the moment setup wrote a new name
   * — you would rename yourself, play, come back, and be handed the old name.
   * Replaying what the last match actually used is both simpler and closer to
   * what the word "rematch" promises.
   */
  takers: readonly [string, string];
};

function isKeeperId(value: unknown): value is KeeperId {
  return typeof value === "string" && (KEEPER_IDS as readonly string[]).includes(value);
}

function isMode(value: unknown): value is MatchMode {
  return value === "solo" || value === "duel";
}

function isTakers(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((entry) => typeof entry === "string")
  );
}

/**
 * Exported for its own sake: a keeper id that no longer exists must read as
 * "no last match" rather than crash a home screen, and that is worth a test
 * without AsyncStorage in the way.
 */
export function parseLastMatch(stored: string | null): LastMatch | null {
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { mode, keeperId, takers } = parsed as Partial<LastMatch>;
    if (!isMode(mode) || !isKeeperId(keeperId) || !isTakers(takers)) return null;
    return { mode, keeperId, takers };
  } catch {
    return null;
  }
}

export function useLastMatch() {
  const [last, setLast] = useState<LastMatch | null>(null);
  // Distinguishes "nothing stored" from "not read yet", so the home screen can
  // hold the card back for a frame instead of flashing the no-history layout
  // and then pushing the buttons down under the reader's thumb.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        setLast(parseLastMatch(stored));
        setLoaded(true);
      })
      .catch(() => {
        // Storage unavailable just means no rematch card. Not worth a message.
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const remember = useCallback(
    (mode: MatchMode, keeperId: KeeperId, takers: readonly [string, string]) => {
      const next: LastMatch = { mode, keeperId, takers };
      setLast(next);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // Best effort, exactly as with the keeper record. Never interrupt a
        // match over a convenience.
      });
    },
    [],
  );

  return { last, loaded, remember };
}
