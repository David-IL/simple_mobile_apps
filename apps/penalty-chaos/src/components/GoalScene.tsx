import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { splitZone } from "../game/engine";
import { ZONE_COLS, type Aim, type KeeperArchetype, type KeeperPose } from "../game/types";
import type { RoundSetup, ShotResult, Zone, ZoneCol } from "../game/types";
import { palette } from "../theme";
import { Ball, PitchInvader, Steward } from "./art/Characters";
import { KeeperFigure, keeperBoxWidth, type Direction } from "./art/KeeperFigure";
import { looksFor } from "./art/keeperLooks";
import { CrowdBank, MudPatch, NightSky, Rain, SunGlare, WindSock } from "./art/Scenery";

export type ScenePhase = "aiming" | "flying" | "settled";

type Props = {
  width: number;
  height: number;
  keeper: KeeperArchetype;
  keeperName: string;
  setup: RoundSetup;
  phase: ScenePhase;
  /** Live drag preview. Null while not dragging, or when the sun is in your eyes. */
  aimPreview: Aim | null;
  result: ShotResult | null;
  /** The keeper's line this round, or null if he has nothing to say. */
  taunt: string | null;
  /** Demonstrate the shooting gesture — only until the player has learned it. */
  showAimHint: boolean;
  /** Spoken description of that gesture, for anyone who cannot see it. */
  aimHintLabel: string;
  /** Ball meets glove, post or uncle. Fires before any deflection. */
  onContact: () => void;
  onFlightEnd: () => void;
};

const GOAL_WIDTH_RATIO = 0.88;
const GOAL_HEIGHT_RATIO = 0.45;
/**
 * Headroom above the crossbar, as a fraction of scene height. The keeper's name
 * and his taunt bubble both live up here, in the crowd and sky that were being
 * drawn behind them anyway.
 *
 * It is reserved permanently rather than made room for when a taunt appears:
 * a goal that shifts position the moment the keeper says something would be
 * far worse than a slightly smaller goal.
 */
const HEADROOM_RATIO = 0.26;
const BALL_SIZE = 24;
/**
 * Android ships a "casual" family (a Comic-Sans-ish face) that is free, needs no
 * asset and no licence check. It simply falls back to the default elsewhere,
 * which is fine for an Android-first repo. The cross-platform version of this is
 * expo-font plus an OFL face — worth doing if the look matters on iOS.
 */
const TAUNT_FONT = Platform.select({ android: "casual", default: undefined });

/** Churned-up pitch colour for the muddy round. */
const MUD = "#4a3a20";
const FLIGHT_MS = 520;

function directionOf(col: ZoneCol): Direction {
  if (col === "left") return -1;
  if (col === "right") return 1;
  return 0;
}

function useGeometry(width: number, height: number) {
  return useMemo(() => {
    const goalWidth = width * GOAL_WIDTH_RATIO;
    const goalHeight = height * GOAL_HEIGHT_RATIO;
    const goalLeft = (width - goalWidth) / 2;
    const goalTop = height * HEADROOM_RATIO;
    return {
      goalWidth,
      goalHeight,
      goalLeft,
      goalTop,
      goalBottom: goalTop + goalHeight,
      spotX: width / 2,
      spotY: height - 30,
      keeperHeight: goalHeight * 0.72,
      /** Aim coords (x: -1..1, y: 0..1) to scene pixels. */
      toPixels(aim: Aim) {
        return {
          x: goalLeft + goalWidth / 2 + (aim.x * goalWidth) / 2,
          y: goalTop + goalHeight - aim.y * goalHeight,
        };
      },
      /** Centre of a zone, for placing the keeper and the tell. */
      zoneCentre(zone: Zone) {
        const { col, row } = splitZone(zone);
        const colIndex = ZONE_COLS.indexOf(col);
        const x = goalLeft + goalWidth * ((colIndex + 0.5) / ZONE_COLS.length);
        const y = row === "high" ? goalTop + goalHeight * 0.34 : goalTop + goalHeight * 0.72;
        return { x, y };
      },
      colCentre(col: ZoneCol) {
        const colIndex = ZONE_COLS.indexOf(col);
        return goalLeft + goalWidth * ((colIndex + 0.5) / ZONE_COLS.length);
      },
    };
  }, [width, height]);
}

/** A fingertip and the trail it leaves, for the shooting demonstration. */
function AimHintFinger() {
  return (
    <Svg width={26} height={34} viewBox="0 0 26 34">
      <Circle cx={13} cy={26} r={9} fill="#f8fafc" opacity={0.22} />
      <Circle cx={13} cy={26} r={5} fill="#f8fafc" opacity={0.9} />
      <Line
        x1={13}
        y1={20}
        x2={13}
        y2={4}
        stroke="#f8fafc"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.75}
      />
      <Line x1={13} y1={3} x2={8} y2={10} stroke="#f8fafc" strokeWidth={2} strokeLinecap="round" opacity={0.75} />
      <Line x1={13} y1={3} x2={18} y2={10} stroke="#f8fafc" strokeWidth={2} strokeLinecap="round" opacity={0.75} />
    </Svg>
  );
}

/** Net mesh plus slightly stronger zone dividers, so the six zones stay legible. */
function GoalNet({ width, height }: { width: number; height: number }) {
  const columns = 12;
  const rows = 8;
  return (
    <Svg width={width} height={height}>
      {Array.from({ length: columns - 1 }, (_, index) => {
        const x = (width * (index + 1)) / columns;
        return (
          <Line
            key={`v${index}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke="#f8fafc"
            strokeWidth={0.5}
            opacity={0.18}
          />
        );
      })}
      {Array.from({ length: rows - 1 }, (_, index) => {
        const y = (height * (index + 1)) / rows;
        return (
          <Line
            key={`h${index}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="#f8fafc"
            strokeWidth={0.5}
            opacity={0.18}
          />
        );
      })}
      {[1, 2].map((index) => (
        <Line
          key={`zx${index}`}
          x1={(width * index) / 3}
          y1={0}
          x2={(width * index) / 3}
          y2={height}
          stroke="#f8fafc"
          strokeWidth={1}
          opacity={0.3}
        />
      ))}
      <Line
        x1={0}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="#f8fafc"
        strokeWidth={1}
        opacity={0.3}
      />
    </Svg>
  );
}

export function GoalScene({
  width,
  height,
  keeper,
  keeperName,
  setup,
  phase,
  aimPreview,
  result,
  taunt,
  showAimHint,
  aimHintLabel,
  onContact,
  onFlightEnd,
}: Props) {
  const geo = useGeometry(width, height);

  const ball = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const ballSpin = useRef(new Animated.Value(0)).current;
  const keeperMove = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const invaderPace = useRef(new Animated.Value(0)).current;
  const stewardRun = useRef(new Animated.Value(0)).current;
  const rainFall = useRef(new Animated.Value(0)).current;
  const hintSweep = useRef(new Animated.Value(0)).current;

  const restingKeeper = geo.zoneCentre("centre-low");
  const { effect, disruption, keeperTell, keeperDive } = setup;

  // Pose is derived, never stored: the keeper leans at the tell while you aim,
  // dives when you shoot, then gloats or slumps once the ball has landed.
  const { pose, direction }: { pose: KeeperPose; direction: Direction } = (() => {
    if (phase === "aiming") {
      if (!keeperTell) return { pose: "ready", direction: 0 };
      return { pose: "lean", direction: directionOf(splitZone(keeperTell).col) };
    }
    const diveDirection = directionOf(splitZone(keeperDive).col);
    if (phase === "settled" && result) {
      if (result.kind === "saved" || result.kind === "blocked") {
        return { pose: "celebrate", direction: diveDirection };
      }
      if (result.kind === "goal") return { pose: "beaten", direction: diveDirection };
    }
    return { pose: "dive", direction: diveDirection };
  })();

  // Only while nobody is touching the screen: the moment a drag starts, the
  // player is already doing the thing and the demonstration is in the way.
  const demonstrating = showAimHint && phase === "aiming" && !aimPreview;

  /**
   * Everything returns to its starting mark the instant a new round exists.
   *
   * Three things make this fiddly, and the first attempt only handled one:
   * - `useLayoutEffect`, not `useEffect`, so the reset lands before paint. A
   *   plain effect leaves one frame showing the keeper still at his last dive.
   * - Keyed on `setup` rather than `phase`, so it fires once per round no
   *   matter how the phases happened to transition.
   * - `stopAnimation()` first, or a dive tween still settling will keep writing
   *   to the value after the reset and drag him back off-centre.
   *
   * It matters because a keeper who starts off-centre reads as a tell, and it
   * is really just residue from the previous shot — false information, which
   * breaks the rule the whole design rests on.
   */
  useLayoutEffect(() => {
    keeperMove.stopAnimation(() => keeperMove.setValue({ x: 0, y: 0 }));
    keeperMove.setValue({ x: 0, y: 0 });
    ball.stopAnimation();
    ball.setValue({ x: 0, y: 0 });
    ballScale.setValue(1);
    ballSpin.setValue(0);
  }, [setup, keeperMove, ball, ballScale, ballSpin]);

  useEffect(() => {
    if (phase !== "aiming") return;

    const lean = keeperTell ? geo.zoneCentre(keeperTell) : restingKeeper;
    const strength = 0.3;
    Animated.timing(keeperMove, {
      toValue: {
        x: (lean.x - restingKeeper.x) * strength,
        y: (lean.y - restingKeeper.y) * strength,
      },
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [phase, keeperTell, geo, keeperMove, restingKeeper.x, restingKeeper.y]);

  /**
   * The invader paces on the spot while you aim.
   *
   * Deliberately *within* his own column, and only while aiming. He was reported
   * as merely annoying when he stood still, so he needed to move — but a target
   * that wandered across columns during the drag would change the safe zone
   * after the player had chosen it, and sprung-after-commit is the one thing
   * this design refuses to do. Local movement makes him alive; the blocked
   * column never changes.
   */
  useEffect(() => {
    if (!effect.blockedCol || phase !== "aiming") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(invaderPace, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(invaderPace, {
          toValue: -1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [effect.blockedCol, phase, invaderPace]);

  /**
   * The steward arrives only once the shot has been taken, so he can never
   * affect it — he is the payoff, not a mechanic. What people actually enjoy
   * about a pitch invasion is the tackle.
   */
  useEffect(() => {
    if (!effect.blockedCol) return;
    if (phase !== "settled") {
      stewardRun.setValue(0);
      return;
    }
    // Two beats rather than one sweep: the steward arrives, *then* both leave.
    // At 900ms it read as a single blur rather than a catch, which threw away
    // the only bit of a pitch invasion anyone actually enjoys.
    const run = Animated.timing(stewardRun, {
      toValue: 1,
      duration: 2200,
      delay: 420,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [effect.blockedCol, phase, stewardRun]);

  /**
   * A finger dragging up off the ball, on repeat.
   *
   * This replaced a line of instructions under the pitch. Showing the gesture
   * costs no reading, works in any language, and — unlike the text — stops
   * existing once it is no longer needed.
   */
  useEffect(() => {
    if (!demonstrating) {
      hintSweep.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hintSweep, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [demonstrating, hintSweep]);

  // One looping value drives the whole rain tile.
  useEffect(() => {
    if (disruption?.id !== "muddy-spot") return;
    const loop = Animated.loop(
      Animated.timing(rainFall, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [disruption, rainFall]);

  useEffect(() => {
    if (phase !== "flying" || !result) return;

    const landing = geo.toPixels(result.landing);
    const dive = geo.zoneCentre(result.keeperDive);

    /**
     * Where the keeper actually finishes.
     *
     * Reported from a real playtest: a fingertip save looked broken, because
     * the ball landed in one zone while the keeper was drawn in the zone he
     * dived to — visibly nowhere near it — and the game still said SAVED.
     *
     * The engine was right; the picture was lying. `reach` means exactly "got a
     * hand to a shot in the next zone along", so on that outcome the keeper has
     * to be seen *stretching* out of his dive toward the ball. Anything else
     * reads as the game cheating, which is the single loudest complaint in this
     * whole genre.
     */
    const keeperEnd =
      result.headline === "saveFingertips"
        ? {
            x: dive.x + (landing.x - dive.x) * 0.82,
            y: dive.y + (landing.y - dive.y) * 0.62,
          }
        : dive;

    // The pitch invader stops the ball with his body, at his height, not
    // wherever it was aimed.
    const contact =
      result.kind === "blocked" && effect.blockedCol
        ? { x: geo.colCentre(effect.blockedCol), y: geo.goalBottom - geo.keeperHeight * 0.34 }
        : landing;

    const flight = Animated.parallel([
      Animated.timing(ball, {
        toValue: { x: contact.x - geo.spotX, y: contact.y - geo.spotY },
        duration: FLIGHT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ballScale, {
        toValue: 0.55,
        duration: FLIGHT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Spin sells the strike far better than panel detail does at this size.
      Animated.timing(ballSpin, {
        toValue: 1,
        duration: FLIGHT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(keeperMove, {
        toValue: { x: keeperEnd.x - restingKeeper.x, y: keeperEnd.y - restingKeeper.y },
        duration: FLIGHT_MS * 0.8,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]);

    // A stopped ball has to go somewhere. Without this it simply halts in the
    // net, which reads as a goal that was scored and then denied.
    const stopped = result.kind === "saved" || result.kind === "blocked";
    const outward = contact.x >= width / 2 ? 1 : -1;
    const deflection = Animated.parallel([
      Animated.timing(ball, {
        toValue: {
          x: contact.x + outward * geo.goalWidth * 0.34 - geo.spotX,
          y: contact.y - geo.goalHeight * 0.22 - geo.spotY,
        },
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ballSpin, {
        toValue: 1.6,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    flight.start(({ finished }) => {
      if (!finished) return;
      // Sound and the verdict fire on contact, not after the ball has finished
      // bouncing away — a glove noise arriving late feels wrong.
      onContact();
      if (!stopped) {
        onFlightEnd();
        return;
      }
      deflection.start(({ finished: settled }) => {
        if (settled) onFlightEnd();
      });
    });
  }, [
    phase,
    result,
    geo,
    ball,
    ballScale,
    ballSpin,
    keeperMove,
    restingKeeper.x,
    restingKeeper.y,
    effect.blockedCol,
    width,
    onContact,
    onFlightEnd,
  ]);

  const preview = aimPreview ? geo.toPixels(aimPreview) : null;
  // Wide enough for the longest Norwegian taunt on two lines, never wider than
  // the scene.
  const bubbleWidth = Math.min(width - 32, 272);
  const keeperWidth = keeperBoxWidth(geo.keeperHeight);

  return (
    <View style={[styles.scene, { width, height }]}>
      <NightSky width={width} height={geo.goalTop + 4} />

      <View style={[styles.layer, { top: geo.goalTop - 30, height: geo.goalHeight + 30 }]}>
        <CrowdBank
          width={width}
          height={geo.goalHeight + 30}
          roaring={disruption?.id === "away-end"}
        />
      </View>

      <View
        style={[
          styles.grass,
          {
            top: geo.goalBottom - 6,
            height: height - geo.goalBottom + 6,
            width,
            // The muddy round churns the whole pitch, not one patch by the spot.
            // A local splat was too small to read as "the conditions are against
            // you"; the surface itself has to change.
            backgroundColor: disruption?.id === "muddy-spot" ? MUD : palette.grass,
          },
        ]}
      />

      {/* Goal frame, with the net and zone dividers drawn inside it. */}
      <View
        style={[
          styles.goal,
          {
            left: geo.goalLeft,
            top: geo.goalTop,
            width: geo.goalWidth,
            height: geo.goalHeight,
          },
        ]}
      >
        <GoalNet width={geo.goalWidth - 8} height={geo.goalHeight - 8} />
      </View>

      <Animated.View
        style={[
          styles.absolute,
          {
            left: restingKeeper.x - keeperWidth / 2,
            top: restingKeeper.y - geo.keeperHeight / 2,
            transform: keeperMove.getTranslateTransform(),
          },
        ]}
      >
        <KeeperFigure
          height={geo.keeperHeight}
          looks={looksFor(keeper.id)}
          pose={pose}
          direction={direction}
        />
      </Animated.View>

      {effect.blockedCol ? (
        <>
          <Animated.View
            style={[
              styles.absolute,
              {
                left: geo.colCentre(effect.blockedCol) - geo.keeperHeight * 0.44,
                top: geo.goalBottom - geo.keeperHeight * 1.02,
                transform: [
                  {
                    translateX: Animated.add(
                      invaderPace.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-geo.goalWidth * 0.05, geo.goalWidth * 0.05],
                      }),
                      stewardRun.interpolate({
                        inputRange: [0, 0.45, 1],
                        outputRange: [0, 0, geo.goalWidth * 0.8],
                      }),
                    ),
                  },
                ],
              },
            ]}
          >
            <PitchInvader width={geo.keeperHeight * 0.88} height={geo.keeperHeight} />
          </Animated.View>

          <Animated.View
            style={[
              styles.absolute,
              {
                left: geo.colCentre(effect.blockedCol) - geo.keeperHeight * 0.44,
                top: geo.goalBottom - geo.keeperHeight * 1.02,
                opacity: stewardRun.interpolate({
                  inputRange: [0, 0.06, 1],
                  outputRange: [0, 1, 1],
                }),
                transform: [
                  {
                    translateX: stewardRun.interpolate({
                      inputRange: [0, 0.45, 1],
                      outputRange: [-geo.goalWidth * 0.75, -geo.goalWidth * 0.02, geo.goalWidth * 0.78],
                    }),
                  },
                ],
              },
            ]}
          >
            <Steward width={geo.keeperHeight * 0.88} height={geo.keeperHeight} />
          </Animated.View>
        </>
      ) : null}

      {disruption?.id === "muddy-spot" ? (
        <>
          <Animated.View
            style={[
              styles.absolute,
              {
                left: 0,
                top: 0,
                width,
                height,
                transform: [
                  {
                    translateY: rainFall.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-height, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Rain width={width} height={height * 2} />
          </Animated.View>
          <View style={[styles.absolute, { left: geo.spotX - 52, top: geo.spotY - 6 }]}>
            <MudPatch width={104} height={38} />
          </View>
        </>
      ) : null}

      {disruption?.id === "crosswind" ? (
        <View style={[styles.absolute, { left: width - 52, top: geo.goalTop - 34 }]}>
          <WindSock width={44} height={60} strength={effect.windX} />
        </View>
      ) : null}

      {disruption?.id === "low-sun" ? (
        <View
          style={[
            styles.absolute,
            // Anchored above the goal rather than across it. A sun hanging in
            // front of the keeper reads as a bug; a sun low over the corner of
            // the stand reads as an evening kick-off. The effect is unchanged —
            // it is the aim line that disappears, not the view.
            { left: 0, top: geo.goalTop - geo.goalHeight * 0.34, width, height: geo.goalHeight },
          ]}
          pointerEvents="none"
        >
          <SunGlare width={width} height={geo.goalHeight} />
        </View>
      ) : null}

      {preview ? (
        <>
          <View
            style={[
              styles.aimTrack,
              {
                left: geo.spotX,
                top: geo.spotY,
                width: Math.hypot(preview.x - geo.spotX, preview.y - geo.spotY),
                transform: [
                  { rotate: `${Math.atan2(preview.y - geo.spotY, preview.x - geo.spotX)}rad` },
                ],
              },
            ]}
          />
          <View style={[styles.aimDot, { left: preview.x - 11, top: preview.y - 11 }]} />
        </>
      ) : null}

      {demonstrating ? (
        <Animated.View
          style={[
            styles.absolute,
            {
              left: geo.spotX - 13,
              top: geo.spotY - 14,
              opacity: hintSweep.interpolate({
                inputRange: [0, 0.15, 0.75, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: hintSweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -geo.goalHeight * 0.62],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
          accessibilityRole="image"
          accessibilityLabel={aimHintLabel}
        >
          <AimHintFinger />
        </Animated.View>
      ) : null}

      <View style={[styles.spot, { left: geo.spotX - 4, top: geo.spotY + 15 }]} />

      <Animated.View
        style={[
          styles.absolute,
          {
            left: geo.spotX - BALL_SIZE / 2,
            top: geo.spotY - BALL_SIZE / 2,
            transform: [
              ...ball.getTranslateTransform(),
              { scale: ballScale },
              {
                rotate: ballSpin.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "540deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Ball width={BALL_SIZE} height={BALL_SIZE} />
      </Animated.View>

      <Text style={[styles.keeperName, { top: geo.goalTop - 24, width }]} numberOfLines={1}>
        {keeperName}
      </Text>

      {/*
        Anchored to the keeper's *resting* position, never his lean.
        Deliberate: rule 2 makes the lean the only honest signal, and a bubble
        that tracked him would be a second, larger, easier-to-read tell. Hidden
        once the shot is away, so it never competes with the ball.
      */}
      {taunt && phase === "aiming" ? (
        <View
          style={[
            styles.bubble,
            {
              width: bubbleWidth,
              left: Math.max(
                8,
                Math.min(width - 8 - bubbleWidth, restingKeeper.x - bubbleWidth / 2),
              ),
              // Clears the keeper's name, which sits just above the crossbar.
              bottom: height - geo.goalTop + 30,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.bubbleText} numberOfLines={2}>
            {taunt}
          </Text>
          <View style={styles.bubbleTail} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: "relative", overflow: "hidden", backgroundColor: palette.night },
  absolute: { position: "absolute" },
  layer: { position: "absolute", left: 0, right: 0 },
  grass: { position: "absolute", left: 0, backgroundColor: palette.grass },
  goal: {
    position: "absolute",
    borderWidth: 4,
    borderColor: palette.chalk,
    borderRadius: 2,
    overflow: "hidden",
  },
  keeperName: {
    position: "absolute",
    textAlign: "center",
    color: palette.chalk,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  bubble: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(248,250,252,0.96)",
  },
  bubbleText: {
    color: "#0f172a",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "600",
    fontFamily: TAUNT_FONT,
    textAlign: "center",
  },
  bubbleTail: {
    position: "absolute",
    bottom: -5,
    alignSelf: "center",
    width: 12,
    height: 12,
    backgroundColor: "rgba(248,250,252,0.94)",
    transform: [{ rotate: "45deg" }],
    borderRadius: 2,
  },
  spot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(248,250,252,0.75)",
  },
  aimDot: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: palette.aim,
    backgroundColor: "rgba(56,189,248,0.22)",
  },
  aimTrack: {
    position: "absolute",
    height: 2,
    backgroundColor: "rgba(56,189,248,0.5)",
    transformOrigin: "left center",
  },
});
