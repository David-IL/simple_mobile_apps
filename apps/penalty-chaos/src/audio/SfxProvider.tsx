import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from "expo-audio";
import { SFX_SOURCES, SFX_VOLUME, type SfxId } from "./sounds";

/**
 * Sound effects.
 *
 * Two constraints shape this. First, `useAudioPlayer` is a hook, so there has
 * to be one literal call per sound at the top level of a component — you cannot
 * loop over the roster. That is why the players are spelled out below rather
 * than built from `SFX_IDS`. Adding a sound means adding a line here, and the
 * `Record<SfxId, AudioPlayer>` type makes forgetting one a compile error.
 *
 * Second, each player owns one buffer, so replaying means seeking back to zero
 * first. Two rapid hits on the same sound therefore restart it rather than
 * overlapping; that is fine for this game, where no two identical effects fire
 * within a few hundred milliseconds.
 */

const STORAGE_KEY = "penalty-chaos/muted";

type SfxValue = {
  play: (id: SfxId) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
};

const SfxContext = createContext<SfxValue | null>(null);

export function SfxProvider({ children }: { children: ReactNode }) {
  const kick = useAudioPlayer(SFX_SOURCES.kick);
  const goal = useAudioPlayer(SFX_SOURCES.goal);
  const save = useAudioPlayer(SFX_SOURCES.save);
  const miss = useAudioPlayer(SFX_SOURCES.miss);
  const blocked = useAudioPlayer(SFX_SOURCES.blocked);
  const taunt = useAudioPlayer(SFX_SOURCES.taunt);
  const mascot = useAudioPlayer(SFX_SOURCES.mascot);
  const whistle = useAudioPlayer(SFX_SOURCES.whistle);

  const [muted, setMutedState] = useState(false);

  const players = useMemo<Record<SfxId, AudioPlayer>>(
    () => ({ kick, goal, save, miss, blocked, taunt, mascot, whistle }),
    [kick, goal, save, miss, blocked, taunt, mascot, whistle],
  );

  useEffect(() => {
    // Respect the phone's ringer switch. A football crowd erupting from a
    // silenced phone in a classroom is exactly the wrong first impression, and
    // this app's whole audience is children with phones in their pockets.
    void setAudioModeAsync({ playsInSilentMode: false }).catch(() => {
      // Non-fatal: worst case the platform default applies.
    });
  }, []);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && stored !== null) setMutedState(stored === "true");
      })
      .catch(() => {
        // Storage unavailable — unmuted is a fine default.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    for (const id of Object.keys(players) as SfxId[]) {
      const player = players[id];
      player.volume = muted ? 0 : SFX_VOLUME[id];
    }
  }, [players, muted]);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    void AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {
      // Best effort; the choice still applies for this session.
    });
  }, []);

  const play = useCallback(
    (id: SfxId) => {
      if (muted) return;
      const player = players[id];
      try {
        // seekTo is async, but the docs' own quick-replay pattern does not await
        // it — waiting a frame for a 150ms effect would be worse than the seek
        // occasionally landing late.
        void player.seekTo(0);
        player.play();
      } catch {
        // A sound failing is never worth interrupting a game for.
      }
    },
    [players, muted],
  );

  const value = useMemo<SfxValue>(() => ({ play, muted, setMuted }), [play, muted, setMuted]);

  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}

export function useSfx(): SfxValue {
  const value = useContext(SfxContext);
  if (!value) throw new Error("useSfx must be used inside an SfxProvider");
  return value;
}
