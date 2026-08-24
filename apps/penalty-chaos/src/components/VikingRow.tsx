import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import { HoldButton } from "./HoldButton";
import { useSfx } from "../audio/SfxProvider";
import {
  answer,
  answerOpensMs,
  armDurationMs,
  cycleMs,
  endCycle,
  startRow,
  type RowState,
} from "../game/row";
import { useI18n } from "../i18n";
import { palette, spacing, text } from "../theme";
import { RowBackground } from "./art/RowBackground";
import { RowCrowd } from "./art/RowCrowd";
import { SCENE_LAYOUT, pickScene } from "./art/rowScenes";

/**
 * The row, played.
 *
 * The crowd beats twice; you answer with RO before the next cycle starts. The
 * shout fires **on the tap**, never on a scheduled beat — you cannot be late
 * against a sound you trigger yourself, which is what makes this survive the
 * 266ms of tap scatter measured on the phone. Nothing here scores accuracy; see
 * the reasoning in [`src/game/row.ts`](../game/row.ts).
 *
 * The difficulty is entirely in the shrinking window: the rest between cycles
 * collapses from 1.5s to 0.4s, the same shape the real recording has.
 *
 * Leaving is a **hold**, not a tap, for the reason the shootout's give-up
 * button is: a control that is easy to hit by accident has to be hidden, and a
 * hidden control is no use. Holding lets it be as obvious as everything else.
 */

/**
 * The crowd only moves on the shout.
 *
 * They used to pull on both drum beats as well, which was wrong twice over: the
 * drum is a count-in, not a stroke, and moving on it dragged the eye onto the
 * wrong beat — the same mistake the button's highlight was making. It also gave
 * the movement away for free. Now the stand pulls **only when the player
 * answers**, so a miss is visible as a stand that does not move.
 */
const SHOUT_LEAN = 1;

/**
 * How close together two shouts may be.
 *
 * The button answers *every* press now, so a child hammering it gets a shout
 * per hammer — which is the right answer right up to the point where the
 * shouts stop being separable. This is a floor on that, not a gate on scoring.
 */
const SHOUT_COOLDOWN_MS = 200;

export function VikingRow({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { play, setMusicActive } = useSfx();

  const [state, setState] = useState<RowState>(startRow);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Picked once per row, in a lazy initialiser: choosing during render would
  // reshuffle the whole scene on every beat.
  const [scene] = useState(pickScene);

  const cycleStart = useRef(0);
  /** When the last shout went out, so hammering cannot outrun the clip. */
  const lastShout = useRef(0);
  const lean = useRef(new Animated.Value(0)).current;
  /** 0 at the top of a cycle, 1 when the answer is due. Drives the whole cue. */
  const arm = useRef(new Animated.Value(0)).current;

  // The menu loop would be playing under this otherwise — a drum needs the
  // room to itself. App restores it by screen, so the cleanup is enough.
  useEffect(() => {
    setMusicActive(false);
    return () => setMusicActive(true);
  }, [setMusicActive]);

  const pull = useCallback(
    (strength: number) => {
      lean.stopAnimation();
      Animated.sequence([
        Animated.timing(lean, { toValue: strength, duration: 90, useNativeDriver: false }),
        Animated.timing(lean, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    },
    [lean],
  );

  // One cycle: beat, beat, then the window stays open until the next begins.
  useEffect(() => {
    if (state.over) return;

    // One call, two hits. The gap lives in the audio file rather than in a
    // timer — see the note on `row-drums` in src/audio/sounds.ts.
    //
    // Dispatched *before* the clock starts, deliberately. `play()` still makes
    // one blocking call into the Android main thread, and taking `t0` ahead of
    // it meant the gate counted from one instant while the ring started from a
    // later one — the two drifting apart by however long that call happened to
    // block. Everything the player is timed and cued against now shares a
    // single origin, taken the moment the drum goes out.
    play("row-drums");
    cycleStart.current = Date.now();

    // The button fills across both drums and completes as the answer falls due,
    // so the player watches the beat arrive instead of being flashed at once it
    // already has.
    arm.setValue(0);
    Animated.timing(arm, {
      toValue: 1,
      duration: armDurationMs(),
      // Linear on purpose: the fill *is* the clock, so easing it would make the
      // ring lie about where the beat is.
      easing: Easing.linear,
      // Native, which is the whole reason the ring stopped animating its own
      // border colour — see the note on the ring styles below.
      useNativeDriver: true,
    }).start();

    const closes = setTimeout(() => setState(endCycle), cycleMs(state.cycle));

    return () => clearTimeout(closes);
  }, [state.cycle, state.over, play, arm]);

  // The crowd roars once at the end, but only if there was something to roar
  // about. A roar for nought strokes reads as sarcasm.
  useEffect(() => {
    if (state.over && state.strokes > 0) play("goal");
  }, [state.over, state.strokes, play]);

  const onRo = useCallback(() => {
    if (state.over) return;
    const now = Date.now();

    // **The shout comes first, and unconditionally.**
    //
    // This used to sit *below* the timing gate, so a tap before the window
    // opened produced nothing whatsoever — no shout, no movement, no score. The
    // comment there claimed an early answer "is never punished". Silence is the
    // harshest punishment a button has, and it is indistinguishable from the
    // button being broken.
    //
    // It also bit hardest exactly where it was least affordable. The gate opens
    // at a fixed 740ms while the cycle collapses to 1300ms, so a player holding
    // the tempo of the previous, longer cycle drifts later until a tap crosses
    // the boundary and lands early in the *next* one. That tap made no sound,
    // so they tapped again — also early, also silent — and two unanswered
    // cycles is the end of the row. Answering every press breaks that loop.
    if (!state.answeredThisCycle && now - lastShout.current >= SHOUT_COOLDOWN_MS) {
      lastShout.current = now;
      play("ro-shout");
      pull(SHOUT_LEAN);
    }

    // Scoring is unchanged — too early does not count, and a second answer in
    // the same cycle does not count twice. The only difference is that both of
    // those now make a noise on the way past.
    if (state.answeredThisCycle) return;
    if (now - cycleStart.current < answerOpensMs()) return;

    // Discharge the ring the moment it is spent, so the next fill reads as a
    // fresh approach rather than a bar that was already sitting full.
    Animated.timing(arm, {
      toValue: 0,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setState(answer);
  }, [state.over, state.answeredThisCycle, play, pull, arm]);

  const armed = arm.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  /**
   * The ring closing in, with a small kick as it lands.
   *
   * The close is the anticipation; the kick at the very end is what turns the
   * arrival into an event rather than an asymptote. It fires on the beat now
   * that `armDurationMs` fills to the beat rather than to the gate.
   */
  const ringScale = arm.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [1.18, 1, 1.06],
  });
  /**
   * Three rings cross-fading, rather than one ring interpolating its colour.
   *
   * `borderColor` cannot be driven natively, and animating it forced the whole
   * `arm` value onto the JS thread — the same thread that has to service
   * expo-audio's blocking calls into the Android main thread. The ring and the
   * sound were competing for it, which is a poor trade for a colour.
   *
   * Opacity can be driven natively, and stacked rings at fixed colours fade
   * between exactly the same three shades. The player sees no difference; the
   * animation no longer touches JS after the frame it starts on.
   */
  const ringIdle = arm.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 1] });
  const ringDeep = arm.interpolate({ inputRange: [0, 0.1, 0.65], outputRange: [0, 0, 1] });
  const ringFull = arm.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0, 0, 1] });
  const rings = [
    { key: "idle", style: styles.ringIdle, opacity: ringIdle },
    { key: "deep", style: styles.ringDeep, opacity: ringDeep },
    { key: "full", style: styles.ringFull, opacity: ringFull },
  ];

  return (
    <View
      style={styles.screen}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      <RowBackground scene={scene} />

      {/*
        The crowd stands on the backdrop rather than on a panel of its own: its
        feet are pinned to the surface in the video — road, cobbles or seating —
        by a fraction measured off the clips. See rowScenes.ts.
      */}
      {size.width > 0
        ? SCENE_LAYOUT[scene].map((bank) => (
            <View
              key={bank.feet}
              style={[styles.crowdLayer, { bottom: size.height * (1 - bank.feet) }]}
              pointerEvents="none"
            >
              <RowCrowd lean={lean} bank={bank} width={size.width} />
            </View>
          ))
        : null}

      <View style={styles.controls} pointerEvents="box-none">
        <Text style={styles.count}>{state.strokes}</Text>
        <Text style={styles.strokes}>{t.row.strokes(state.strokes)}</Text>

      {state.over ? (
        <View style={styles.done}>
          <Text style={text.heading}>{t.row.finished(state.strokes)}</Text>
          <Button
            label={t.row.close}
            onPress={onClose}
            color={palette.brand}
            labelColor={palette.brandInk}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.row.ro}
          onPress={onRo}
          style={({ pressed }) => [styles.ro, pressed && styles.roPressed]}
        >
          {rings.map((ring) => (
            <Animated.View
              key={ring.key}
              pointerEvents="none"
              style={[
                styles.ring,
                ring.style,
                { opacity: ring.opacity, transform: [{ scale: ringScale }] },
              ]}
            />
          ))}
          <Animated.Text style={[styles.roLabel, { opacity: armed }]}>{t.row.ro}</Animated.Text>
        </Pressable>
      )}
      </View>

      {/*
        Only while it is running. Once the row is over the Done button is the
        way out, and two ways to leave the same screen is one too many.
      */}
      {state.over ? null : (
        <View style={styles.abort}>
          <HoldButton
            label={t.row.abort}
            accessibilityHint={t.row.abortHint}
            onHoldComplete={onClose}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.night,
  },
  crowdLayer: { position: "absolute", left: 0, right: 0 },
  // Laid over the scene rather than in flow with it, so the crowd can sit
  // wherever its backdrop puts it. box-none lets taps through everywhere except
  // the controls themselves.
  controls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  // A shadow, because these now sit over a lit street rather than over navy.
  count: {
    color: palette.chalk,
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -2,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  strokes: {
    ...text.muted,
    color: palette.chalk,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowRadius: 6,
  },
  done: { alignItems: "center", gap: spacing.md, alignSelf: "stretch" },
  abort: { position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.lg },
  ro: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
  roPressed: { backgroundColor: palette.brandDeep },
  // The ring closes in as the answer falls due. A continuous approach rather
  // than a flash: see armDurationMs in src/game/row.ts for why.
  //
  // Three of them, stacked and cross-faded on opacity, because colour cannot be
  // animated on the native driver. Same three shades, none of the JS-thread
  // cost — see the interpolations above.
  ring: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 105,
    borderWidth: 5,
  },
  ringIdle: { borderColor: palette.line },
  ringDeep: { borderColor: palette.brandDeep },
  ringFull: { borderColor: palette.brand },
  roLabel: { color: palette.brand, fontSize: 54, fontWeight: "900", letterSpacing: 4 },
});
