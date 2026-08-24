import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  SFX_LENGTH_MS,
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
 * ## Nothing here asks the player anything
 *
 * On Android every one of `currentTime`, `playing`, `play()` and `pause()` is
 * `runBlocking(mainQueue)` inside expo-audio — reading a property **blocks the
 * JS thread until the Android main thread is free.** The voice picker used to
 * read `currentTime` per voice and `playing` once more, so a single trigger
 * made three or four blocking hops, inside a touch handler, on the one screen
 * whose main thread is also decoding a looping video. That is why a shout did
 * not reliably follow the finger.
 *
 * We started every sound, so we already know which voice is busy and until
 * when. `VoiceState` holds that, `SFX_LENGTH_MS` supplies the durations, and
 * the hot path is down to one blocking call: `play()` itself.
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
 * **That handler must not believe a late event.** Status updates reach JS
 * asynchronously, so a `didJustFinish` emitted for one playback can arrive
 * after the next has begun — and the handler's whole job is to pause. A stale
 * one therefore silences the sound now playing. It is guarded by elapsed time
 * against the clip's own length, and that guard is load-bearing: without it a
 * pause landing in the 400ms between the row's two drums delivers the call as
 * one hit instead of two.
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
 * How early a `didJustFinish` may arrive and still be believed.
 *
 * `SFX_LENGTH_MS` is the file's own duration and the event fires when playback
 * truly ends, so it is never genuinely earlier. This only covers rounding and
 * decoder trimming; it is not slack for a late event, which is the whole point.
 */
const FINISH_TOLERANCE_MS = 60;

/**
 * What the provider remembers about one voice, so it never has to ask.
 *
 * See "Nothing here asks the player anything" above: every question put to the
 * native side blocks the JS thread. We started the sound, so we already know.
 */
type VoiceState = {
  /** When `play()` was last called on it. `-Infinity` when it never has been. */
  startedAt: number;
  /** How long that clip runs, from `SFX_LENGTH_MS`. */
  lengthMs: number;
  /**
   * True when the voice is known to be sitting at zero, ready for a bare
   * `play()`. A fresh player is; so is one the finish listener has rewound.
   *
   * Tracked rather than inferred from elapsed time, because a status event can
   * go missing — and a voice whose clip *should* have ended but was never
   * rewound is parked at the end, where `play()` on an ended ExoPlayer does
   * nothing at all. Anything not known to be parked takes the rewind path.
   */
  parked: boolean;
  /** Cancels a fade in progress. See `duck`. */
  cancelFade: (() => void) | null;
};

/** A player nobody has touched yet is loaded and sitting at zero. */
function freshVoice(): VoiceState {
  return { startedAt: -Infinity, lengthMs: 0, parked: true, cancelFade: null };
}

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
 *
 * **The fade is cancellable, and that is not optional.** Its last act is to set
 * the volume to zero and pause. If the voice is restarted while those timers
 * are still pending they land on the *new* playback and silence it — and a
 * sound that plays at volume zero is indistinguishable from one that never
 * played at all.
 */
function duck(player: AudioPlayer, state: VoiceState, from: number): void {
  state.cancelFade?.();

  let step = 0;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    timer = null;
    state.cancelFade = null;
  };

  const tick = () => {
    if (cancelled) return;
    step += 1;
    try {
      player.volume = Math.max(0, from * (1 - step / FADE_STEPS));
      if (step >= FADE_STEPS) {
        player.pause();
        void player.seekTo(0);
        state.parked = true;
        stop();
        return;
      }
    } catch {
      stop(); // player went away mid-fade; nothing to clean up
      return;
    }
    timer = setTimeout(tick, FADE_MS / FADE_STEPS);
  };

  state.cancelFade = stop;
  timer = setTimeout(tick, FADE_MS / FADE_STEPS);
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

  /**
   * What we know about each voice, keyed by the player itself.
   *
   * A ref rather than state: none of it should ever cause a render, and it has
   * to be readable and writable synchronously from inside a touch handler.
   */
  const voiceState = useRef(new Map<AudioPlayer, VoiceState>());
  const stateOf = useCallback((voice: AudioPlayer): VoiceState => {
    let state = voiceState.current.get(voice);
    if (!state) {
      state = freshVoice();
      voiceState.current.set(voice, state);
    }
    return state;
  }, []);

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
      const lengthMs = SFX_LENGTH_MS[id];
      const now = Date.now();
      /** Still audible, by the clock rather than by asking. */
      const sounding = (state: VoiceState) => now - state.startedAt < state.lengthMs;
      /** About to be the voice that plays: cancel any fade, and claim it. */
      const claim = (state: VoiceState) => {
        state.cancelFade?.();
        state.cancelFade = null;
        state.startedAt = now;
        state.lengthMs = lengthMs;
        state.parked = false;
      };

      try {
        // Only one keeper talks at a time. Flicking through the roster fires a
        // taunt per tap, and without this they pile on top of each other into
        // an unreadable mush — expo-audio gives each sound its own player, so
        // overlapping by default.
        if (isTauntSfx(id)) {
          for (const other of TAUNT_SFX_IDS) {
            if (other === id) continue;
            for (const voice of voices[other]) {
              // Only the ones actually talking. This used to pause and rewind
              // all eight on every taunt: eight blocking calls to the main
              // thread to stop seven sounds that were not playing.
              const state = stateOf(voice);
              if (state.parked) continue;
              state.cancelFade?.();
              state.cancelFade = null;
              state.parked = true;
              voice.pause();
              // Rewound as well as stopped, so an interrupted taunt is left
              // armed at zero like a finished one and its next trigger needs
              // no seek.
              void voice.seekTo(0);
            }
          }
        }

        // The fast path, and the one nearly every trigger takes: a voice known
        // to be parked at zero plays with one call — nothing to wait for and
        // nothing to race.
        const ready = pool.find((voice) => stateOf(voice).parked);
        if (ready) {
          // Anything still sounding is on its way out; ride it down rather than
          // cutting it. With a single voice this loop does nothing.
          for (const voice of pool) {
            const state = stateOf(voice);
            if (voice !== ready && sounding(state)) duck(voice, state, level);
          }
          claim(stateOf(ready));
          ready.volume = level;
          ready.play();
          return;
        }

        // Nothing parked. Either every voice is genuinely still sounding — rare,
        // it needs two triggers inside one clip on a sound with one voice — or a
        // finish event went missing and left one stranded at the end. Either way
        // the least recently started is the one to take.
        let stolen = pool[0];
        if (!stolen) return;
        for (const voice of pool) {
          if (stateOf(voice).startedAt < stateOf(stolen).startedAt) stolen = voice;
        }
        const taken = stolen;

        for (const voice of pool) {
          const state = stateOf(voice);
          if (voice !== taken && sounding(state)) duck(voice, state, level);
        }
        claim(stateOf(taken));

        // A rewind is genuinely needed and **it has to complete before playback
        // starts**: firing `seekTo` and `play` together without waiting lets the
        // seek land mid-playback and drag the position back under it, which is
        // exactly how the second of two quick goals used to arrive late.
        taken.pause();
        void taken
          .seekTo(0)
          .then(() => {
            taken.volume = level;
            taken.play();
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
    [voices, muted, stateOf],
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
          const state = stateOf(player);
          if (state.parked) return;

          // **A finish cannot arrive before the clip has had time to run.**
          //
          // Status updates reach JS asynchronously, so one emitted for the
          // *previous* playback can turn up after the next has already started —
          // and this handler's entire job is to pause. Believing a stale event
          // therefore silences the sound that is currently playing.
          //
          // That is not theoretical: it is how an RO shout went missing, and how
          // a two-beat drum arrived as one hit. The row leaves only 540ms
          // between a drum finishing and the next cycle starting, and the pause
          // landing anywhere in the 400ms between the two beats eats the second
          // one. Anything that shortens the gap between triggers makes the
          // window this guard covers wider, not narrower.
          if (Date.now() - state.startedAt < state.lengthMs - FINISH_TOLERANCE_MS) return;

          state.parked = true;
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
  }, [voices, stateOf]);

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
