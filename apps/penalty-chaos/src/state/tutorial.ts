import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * How many shots someone has taken on this device, ever.
 *
 * Used for one thing: deciding whether to demonstrate the shooting gesture.
 *
 * Deliberately *not* a "don't show this again" checkbox. That asks a first-time
 * player to make a decision about something they have not understood yet, and
 * the players here are children — one of whom is younger than the eleven-year-old
 * this was built for. A hint that disappears once you have proved you can do the
 * thing needs no decision, no dialog and no reading.
 */
const STORAGE_KEY = "penalty-chaos/shots-taken";

/**
 * Three is enough. One shot could be an accident, two could be luck; by the
 * third the gesture is learned, and any more is the hint outstaying its welcome.
 */
const SHOTS_UNTIL_LEARNED = 3;

export function useShotTutorial() {
  const [taken, setTaken] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        const parsed = Number.parseInt(stored ?? "", 10);
        if (active) setTaken(Number.isFinite(parsed) ? parsed : 0);
      })
      .catch(() => {
        // Storage unavailable — showing the hint is the safer failure.
        if (active) setTaken(0);
      });
    return () => {
      active = false;
    };
  }, []);

  const recordShotTaken = useCallback(() => {
    setTaken((previous) => {
      // Stop counting once it no longer changes anything.
      if (previous === null || previous >= SHOTS_UNTIL_LEARNED) return previous;
      const next = previous + 1;
      void AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {
        // Best effort; the hint hides for this session either way.
      });
      return next;
    });
  }, []);

  return {
    // Null while loading: better a hint that appears a frame late than one that
    // flashes up for someone who has played a hundred rounds.
    showAimHint: taken !== null && taken < SHOTS_UNTIL_LEARNED,
    recordShotTaken,
  };
}
