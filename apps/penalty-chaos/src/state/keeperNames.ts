import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KeeperId } from "../game/types";

/**
 * Player-chosen keeper names, stored on the device and nowhere else.
 *
 * This is the whole point of the rename feature, per ADR 8: shipping a real
 * goalkeeper's name in the binary is a personality-rights problem, but a name
 * typed on a phone and kept on that phone is the user's own business. It must
 * therefore never be transmitted, and must never appear on anything that leaves
 * the device. On-screen it is used everywhere, the result screen included; the
 * rule binds exported content — a share image, a store screenshot — which must
 * render the archetype's shipped name instead.
 */
const STORAGE_KEY = "penalty-chaos/keeper-names";
const MAX_NAME_LENGTH = 18;

export type KeeperNames = Readonly<Record<string, string>>;

/**
 * The custom name if there is one, otherwise the shipped name for the current
 * language. The caller passes the shipped name because it is translated copy
 * and this module has no business reaching into the locale bundles.
 */
export function displayName(
  keeperId: KeeperId,
  names: KeeperNames,
  shippedName: string,
): string {
  const custom = names[keeperId]?.trim();
  return custom && custom.length > 0 ? custom : shippedName;
}

/**
 * What to keep while someone is still typing.
 *
 * Deliberately does **not** trim. An earlier version ran the full sanitise on
 * every keystroke, which meant the trailing space was stripped the instant it
 * was typed and the field silently refused to accept a space at all — you could
 * not enter a two-word name. Trimming belongs at the point the name is used,
 * not while it is being written.
 */
export function limitName(raw: string, max = MAX_NAME_LENGTH): string {
  // Line breaks and tabs only arrive by paste, and a single-line field cannot
  // show them anyway. Spaces are left alone — that is the whole point.
  return raw.replace(/[\r\n\t]+/g, " ").slice(0, max);
}

/** What to keep once the name is actually being used. */
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
  // Mounted once for the app's lifetime, so this window is narrow in
  // practice — but the same "load clobbers an in-flight edit" bug as
  // playerNames.ts is possible in principle, so it gets the same guard.
  const dirty = useRef(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && !dirty.current) setNames(parse(stored));
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
    dirty.current = true;
    setNames((previous) => {
      const clean = limitName(raw);
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
