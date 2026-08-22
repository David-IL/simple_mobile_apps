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
import {
  AMBIENCE_SOURCE,
  AMBIENCE_VOLUME,
  MUSIC_SOURCE,
  MUSIC_VOLUME,
  SFX_SOURCES,
  SFX_VOLUME,
  type SfxId,
} from "./sounds";

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
  /**
   * Turn the menu loop on or off. Called with `true` on the menu screens and
   * `false` in a match — the caller decides what counts as "in play", because
   * this module has no idea what screens exist.
   */
  setMusicActive: (active: boolean) => void;
  /** Stadium ambience. The inverse of the music: on in a match, off in menus. */
  setAmbienceActive: (active: boolean) => void;
};

const SfxContext = createContext<SfxValue | null>(null);

export function SfxProvider({ children }: { children: ReactNode }) {
  const kick = useAudioPlayer(SFX_SOURCES.kick);
  const goal = useAudioPlayer(SFX_SOURCES.goal);
  const save = useAudioPlayer(SFX_SOURCES.save);
  const miss = useAudioPlayer(SFX_SOURCES.miss);
  const blocked = useAudioPlayer(SFX_SOURCES.blocked);
  const chant = useAudioPlayer(SFX_SOURCES.chant);
  const whistle = useAudioPlayer(SFX_SOURCES.whistle);
  const tauntSunday = useAudioPlayer(SFX_SOURCES["taunt-sunday"]);
  const tauntStatue = useAudioPlayer(SFX_SOURCES["taunt-statue"]);
  const tauntChatterbox = useAudioPlayer(SFX_SOURCES["taunt-chatterbox"]);
  const tauntLineDancer = useAudioPlayer(SFX_SOURCES["taunt-line-dancer"]);
  const tauntShowboat = useAudioPlayer(SFX_SOURCES["taunt-showboat"]);
  const tauntVeteran = useAudioPlayer(SFX_SOURCES["taunt-veteran"]);
  const tauntWall = useAudioPlayer(SFX_SOURCES["taunt-wall"]);
  const tauntMindReader = useAudioPlayer(SFX_SOURCES["taunt-mind-reader"]);
  const music = useAudioPlayer(MUSIC_SOURCE);
  const ambience = useAudioPlayer(AMBIENCE_SOURCE);

  const [muted, setMutedState] = useState(false);
  const [musicActive, setMusicActive] = useState(false);
  const [ambienceActive, setAmbienceActive] = useState(false);

  const players = useMemo<Record<SfxId, AudioPlayer>>(
    () => ({
      kick,
      goal,
      save,
      miss,
      blocked,
      chant,
      whistle,
      "taunt-sunday": tauntSunday,
      "taunt-statue": tauntStatue,
      "taunt-chatterbox": tauntChatterbox,
      "taunt-line-dancer": tauntLineDancer,
      "taunt-showboat": tauntShowboat,
      "taunt-veteran": tauntVeteran,
      "taunt-wall": tauntWall,
      "taunt-mind-reader": tauntMindReader,
    }),
    [
      kick,
      goal,
      save,
      miss,
      blocked,
      chant,
      whistle,
      tauntSunday,
      tauntStatue,
      tauntChatterbox,
      tauntLineDancer,
      tauntShowboat,
      tauntVeteran,
      tauntWall,
      tauntMindReader,
    ],
  );

  useEffect(() => {
    // `playsInSilentMode: true` on purpose, after getting this wrong once.
    //
    // The first version set it to false so the app would respect the phone's
    // ringer switch. That sounds polite and is actually a bug: a player who has
    // explicitly set Sound → On in the app gets silence with no explanation,
    // and no way to work out why from inside the game. The in-app toggle is the
    // consent mechanism; the OS switch should not silently override it.
    void setAudioModeAsync({ playsInSilentMode: true }).catch((error: unknown) => {
      if (__DEV__) console.warn("[sfx] setAudioModeAsync failed", error);
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

  // Volume is applied at play time rather than only here. Setting it in an
  // effect at mount can land before the player has finished loading, in which
  // case the native side may never pick it up — which looks exactly like
  // "sound is broken".
  useEffect(() => {
    for (const id of Object.keys(players) as SfxId[]) {
      players[id].volume = muted ? 0 : SFX_VOLUME[id];
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
        // Re-apply volume here, not just in the mount effect — see above.
        player.volume = SFX_VOLUME[id];
        // seekTo is async, but the docs' own quick-replay pattern does not await
        // it — waiting a frame for a 150ms effect would be worse than the seek
        // occasionally landing late.
        void player.seekTo(0);
        player.play();
        if (__DEV__) {
          console.log(`[sfx] ${id} loaded=${player.isLoaded} vol=${player.volume}`);
        }
      } catch (error) {
        // A sound failing is never worth interrupting a game for, but it should
        // not vanish either — silent catches are how "no sound" became hard to
        // diagnose the first time.
        if (__DEV__) console.warn(`[sfx] ${id} failed`, error);
      }
    },
    [players, muted],
  );

  // Two long files on repeat, each gated by a screen and by the mute toggle.
  // `loop` has to be set on the player itself; there is no per-play option.
  useEffect(() => {
    music.loop = true;
    music.volume = MUSIC_VOLUME;
    ambience.loop = true;
    ambience.volume = AMBIENCE_VOLUME;
  }, [music, ambience]);

  useEffect(() => {
    const toggle = (player: AudioPlayer, active: boolean, label: string) => {
      try {
        if (active && !muted) player.play();
        else player.pause();
      } catch (error) {
        if (__DEV__) console.warn(`[${label}] toggle failed`, error);
      }
    };
    toggle(music, musicActive, "music");
    toggle(ambience, ambienceActive, "ambience");
  }, [music, ambience, musicActive, ambienceActive, muted]);

  const value = useMemo<SfxValue>(
    () => ({ play, muted, setMuted, setMusicActive, setAmbienceActive }),
    [play, muted, setMuted],
  );

  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}

export function useSfx(): SfxValue {
  const value = useContext(SfxContext);
  if (!value) throw new Error("useSfx must be used inside an SfxProvider");
  return value;
}
