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
  TAUNT_SFX_IDS,
  isTauntSfx,
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
 *
 * ## Rewinding happens on finish, not on trigger
 *
 * The first version seeked to zero and called `play()` in the same breath,
 * without awaiting the seek — a shortcut taken from the docs' own example. It
 * caused two bugs that took real playtesting to pin down: sounds arriving late,
 * and the row's RO shout **sometimes not arriving at all**, because an async
 * seek landing after `play()` can rewind or stall what just started.
 *
 * So the rewind moved to the other end. Each player seeks itself back to zero
 * when it finishes, which leaves it armed at the start, and the ordinary
 * trigger path becomes a single synchronous `play()` with nothing to race.
 *
 * ## Two voices for the sounds that overlap
 *
 * Rewinding a clip that is still sounding costs a round trip however carefully
 * it is done, and that round trip is audible — scoring twice inside two seconds
 * made the second roar arrive late no matter how short the clip got.
 *
 * The fix is the one the expo-audio docs give for overlapping sounds: **more
 * players.** `goal` and `miss` each own two, and a trigger takes whichever is
 * idle. There is then nothing to rewind and nothing to wait for; the outgoing
 * roar is faded down over a few hundred milliseconds while the new one starts
 * clean, so a quick double reads as the crowd going again rather than as a
 * sound being cut off and restarted late.
 *
 * `ro-shout` has two for a different reason: at the fast end of the row a
 * shout can still be sounding when the next cycle comes round, and a tap that
 * has to wait for a rewind is exactly the lag the row is trying not to have.
 *
 * Every other effect keeps a single voice. Polyphony costs a decoder each and
 * only earns its place where a sound can genuinely be asked to overlap itself:
 * those three can, the rest cannot.
 *
 * A retrigger that still finds every voice busy falls back to a chained rewind
 * — `seekTo().then(play)`, never raced. Both of those were learned from real
 * symptoms: racing the seek made the second of two quick goals arrive late, and
 * seeking a player that still thought it was playing made every one-shot loop
 * forever.
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

/** How long an outgoing voice takes to get out of the way, and in how many steps. */
const FADE_MS = 320;
const FADE_STEPS = 8;

/**
 * Duck a voice that is being replaced, then park it.
 *
 * Cutting the outgoing roar dead is what a single-player restart did, and it is
 * the thing that sounded wrong. Riding it down instead means a quick second
 * goal reads as the crowd going again over the top of itself.
 *
 * Stepped with timers rather than an animation: `expo-audio` has no volume
 * ramp, and eight writes spread over a third of a second is not worth a
 * dependency.
 */
function duck(player: AudioPlayer, from: number): void {
  let step = 0;
  const tick = () => {
    step += 1;
    const next = from * (1 - step / FADE_STEPS);
    try {
      player.volume = Math.max(0, next);
      if (step >= FADE_STEPS) {
        player.pause();
        void player.seekTo(0);
        return;
      }
    } catch {
      return; // player went away mid-fade; nothing to clean up
    }
    setTimeout(tick, FADE_MS / FADE_STEPS);
  };
  setTimeout(tick, FADE_MS / FADE_STEPS);
}

const SfxContext = createContext<SfxValue | null>(null);

export function SfxProvider({ children }: { children: ReactNode }) {
  const kick = useAudioPlayer(SFX_SOURCES.kick);
  const goal = useAudioPlayer(SFX_SOURCES.goal);
  const save = useAudioPlayer(SFX_SOURCES.save);
  const miss = useAudioPlayer(SFX_SOURCES.miss);
  const blocked = useAudioPlayer(SFX_SOURCES.blocked);
  const chant = useAudioPlayer(SFX_SOURCES.chant);
  const whistle = useAudioPlayer(SFX_SOURCES.whistle);
  const rowDrums = useAudioPlayer(SFX_SOURCES["row-drums"]);
  const roShout = useAudioPlayer(SFX_SOURCES["ro-shout"]);
  const roShoutB = useAudioPlayer(SFX_SOURCES["ro-shout"]);
  // Second voices. See "Two voices" above; only these two can overlap.
  const goalB = useAudioPlayer(SFX_SOURCES.goal);
  const missB = useAudioPlayer(SFX_SOURCES.miss);
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

  /** One entry per sound; most hold a single voice, two hold a pair. */
  const voices = useMemo<Record<SfxId, readonly AudioPlayer[]>>(
    () => ({
      kick: [kick],
      goal: [goal, goalB],
      save: [save],
      miss: [miss, missB],
      blocked: [blocked],
      chant: [chant],
      whistle: [whistle],
      "row-drums": [rowDrums],
      "ro-shout": [roShout, roShoutB],
      "taunt-sunday": [tauntSunday],
      "taunt-statue": [tauntStatue],
      "taunt-chatterbox": [tauntChatterbox],
      "taunt-line-dancer": [tauntLineDancer],
      "taunt-showboat": [tauntShowboat],
      "taunt-veteran": [tauntVeteran],
      "taunt-wall": [tauntWall],
      "taunt-mind-reader": [tauntMindReader],
    }),
    [
      kick,
      goal,
      save,
      miss,
      blocked,
      chant,
      whistle,
      rowDrums,
      roShout,
      roShoutB,
      goalB,
      missB,
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
    for (const id of Object.keys(voices) as SfxId[]) {
      for (const voice of voices[id]) voice.volume = muted ? 0 : SFX_VOLUME[id];
    }
  }, [voices, muted]);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    void AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {
      // Best effort; the choice still applies for this session.
    });
  }, []);

  const play = useCallback(
    (id: SfxId) => {
      if (muted) return;
      const pool = voices[id];
      const level = SFX_VOLUME[id];
      try {
        // Only one keeper talks at a time. Flicking through the roster fires a
        // taunt per tap, and without this they pile on top of each other into
        // noise — every clip has its own player, so nothing stops them
        // overlapping by default.
        if (isTauntSfx(id)) {
          for (const other of TAUNT_SFX_IDS) {
            if (other === id) continue;
            // Rewound as well as stopped, so an interrupted taunt is left armed
            // at zero like a finished one and its next trigger needs no seek.
            for (const voice of voices[other]) {
              voice.pause();
              void voice.seekTo(0);
            }
          }
        }

        // The fast path, and the one nearly every trigger takes: a voice parked
        // at zero — either never used or rewound when it last finished — plays
        // with one synchronous call, nothing to wait for and nothing to race.
        const idle = pool.find((voice) => voice.currentTime === 0);
        if (idle) {
          // Anything still sounding is on its way out; ride it down rather than
          // cutting it. With a single voice this is a no-op.
          for (const voice of pool) {
            if (voice !== idle && voice.playing) duck(voice, level);
          }
          idle.volume = level;
          idle.play();
          return;
        }

        // Every voice busy. Rare — it needs two triggers inside one clip on a
        // sound that only has one voice. A rewind is genuinely needed and **it
        // has to complete before playback starts**: firing `seekTo` and `play`
        // together without waiting lets the seek land mid-playback and drag the
        // position back under it, which is exactly how the second of two quick
        // goals used to arrive late.
        const player = pool[0];
        if (!player) return;
        player.pause();
        void player
          .seekTo(0)
          .then(() => {
            player.volume = level;
            player.play();
          })
          .catch((error: unknown) => {
            if (__DEV__) console.warn(`[sfx] ${id} retrigger failed`, error);
          });
      } catch (error) {
        // A sound failing is never worth interrupting a game for, but it should
        // not vanish either — silent catches are how "no sound" became hard to
        // diagnose the first time. Only failures are logged: a line per play
        // ran on every beat of the row, and in dev each one is serialised to
        // Metro.
        if (__DEV__) console.warn(`[sfx] ${id} failed`, error);
      }
    },
    [voices, muted],
  );

  /**
   * Put every effect back to the start the moment it finishes, so the next
   * trigger is a bare `play()` with no seek to race against. See the note at
   * the top of this file for the bugs this replaced.
   */
  useEffect(() => {
    const subscriptions = (Object.keys(voices) as SfxId[]).flatMap((id) =>
      voices[id].map((player) =>
        player.addListener("playbackStatusUpdate", (status) => {
          if (!status.didJustFinish) return;
          // **Pause before rewinding.** Seeking a player that still considers
          // itself playing makes it start again from the new position, so the
          // first version of this turned every one-shot into an endless loop -
          // finish, seek, play, finish. Pausing first ends playback for good
          // and leaves the clip armed at zero, which is the whole point.
          player.pause();
          void player.seekTo(0);
        }),
      ),
    );
    return () => {
      for (const subscription of subscriptions) subscription.remove();
    };
  }, [voices]);

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
