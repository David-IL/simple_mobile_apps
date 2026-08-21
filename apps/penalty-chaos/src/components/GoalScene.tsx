import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { splitZone } from "../game/engine";
import { ZONE_COLS, type Aim, type KeeperArchetype, type KeeperPose } from "../game/types";
import type { RoundSetup, ShotResult, Zone, ZoneCol } from "../game/types";
import { palette } from "../theme";
import { Ball, Mascot, PitchInvader } from "./art/Characters";
import { KeeperFigure, type Direction } from "./art/KeeperFigure";
import { looksFor } from "./art/keeperLooks";
import { CrowdBank, MudPatch, NightSky, SunGlare, WindSock } from "./art/Scenery";

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
  onFlightEnd,
}: Props) {
  const geo = useGeometry(width, height);

  const ball = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const ballSpin = useRef(new Animated.Value(0)).current;
  const keeperMove = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const mascotWiggle = useRef(new Animated.Value(0)).current;

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

  // The badger never stops dancing. It is the only thing in the scene that
  // animates on its own, because that is the entire joke.
  useEffect(() => {
    if (disruption?.id !== "mascot") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotWiggle, {
          toValue: 1,
          duration: 340,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(mascotWiggle, {
          toValue: -1,
          duration: 340,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [disruption, mascotWiggle]);

  useEffect(() => {
    if (phase !== "flying" || !result) return;

    const target = geo.toPixels(result.landing);
    const dive = geo.zoneCentre(result.keeperDive);

    Animated.parallel([
      Animated.timing(ball, {
        toValue: { x: target.x - geo.spotX, y: target.y - geo.spotY },
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
        toValue: { x: dive.x - restingKeeper.x, y: dive.y - restingKeeper.y },
        duration: FLIGHT_MS * 0.8,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFlightEnd();
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
    onFlightEnd,
  ]);

  const preview = aimPreview ? geo.toPixels(aimPreview) : null;
  // Wide enough for the longest Norwegian taunt on two lines, never wider than
  // the scene.
  const bubbleWidth = Math.min(width - 32, 272);
  const keeperWidth = geo.keeperHeight * 0.62;

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
          { top: geo.goalBottom - 6, height: height - geo.goalBottom + 6, width },
        ]}
      />

      {disruption?.id === "mascot" ? (
        <Animated.View
          style={[
            styles.absolute,
            {
              left: geo.goalLeft + geo.goalWidth * 0.72,
              top: geo.goalTop - geo.goalHeight * 0.34,
              transform: [
                {
                  rotate: mascotWiggle.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ["-9deg", "9deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <Mascot width={geo.goalHeight * 0.52} height={geo.goalHeight * 0.58} />
        </Animated.View>
      ) : null}

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
          width={keeperWidth}
          height={geo.keeperHeight}
          looks={looksFor(keeper.id)}
          pose={pose}
          direction={direction}
        />
      </Animated.View>

      {effect.blockedCol ? (
        <View
          style={[
            styles.absolute,
            {
              left: geo.colCentre(effect.blockedCol) - geo.keeperHeight * 0.24,
              top: geo.goalBottom - geo.keeperHeight * 0.78,
            },
          ]}
        >
          <PitchInvader width={geo.keeperHeight * 0.48} height={geo.keeperHeight * 0.75} />
        </View>
      ) : null}

      {disruption?.id === "muddy-spot" ? (
        <View style={[styles.absolute, { left: geo.spotX - 45, top: geo.spotY - 4 }]}>
          <MudPatch width={90} height={34} />
        </View>
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
            { left: 0, top: geo.goalTop - 10, width, height: geo.goalHeight + 40 },
          ]}
          pointerEvents="none"
        >
          <SunGlare width={width} height={geo.goalHeight + 40} />
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
    borderColor: palette.accent,
    backgroundColor: "rgba(56,189,248,0.22)",
  },
  aimTrack: {
    position: "absolute",
    height: 2,
    backgroundColor: "rgba(56,189,248,0.5)",
    transformOrigin: "left center",
  },
});
