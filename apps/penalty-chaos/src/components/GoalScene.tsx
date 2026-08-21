import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { splitZone } from "../game/engine";
import { ZONE_COLS, type Aim, type KeeperArchetype, type KeeperPose } from "../game/types";
import type { RoundSetup, ShotResult, Zone, ZoneCol } from "../game/types";
import { palette } from "../theme";
import { Ball, Mascot, PitchInvader } from "./art/Characters";
import { KeeperFigure, type Direction } from "./art/KeeperFigure";
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
  onFlightEnd: () => void;
};

const GOAL_WIDTH_RATIO = 0.88;
const GOAL_HEIGHT_RATIO = 0.5;
const BALL_SIZE = 24;
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
    const goalTop = height * 0.14;
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
  onFlightEnd,
}: Props) {
  const geo = useGeometry(width, height);

  const ball = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballScale = useRef(new Animated.Value(1)).current;
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

  useEffect(() => {
    if (phase !== "aiming") return;
    ball.setValue({ x: 0, y: 0 });
    ballScale.setValue(1);
  }, [phase, setup, ball, ballScale]);

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
    keeperMove,
    restingKeeper.x,
    restingKeeper.y,
    onFlightEnd,
  ]);

  const preview = aimPreview ? geo.toPixels(aimPreview) : null;
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
          shirt={keeper.shirt}
          shirtTrim={keeper.shirtTrim}
          monogram={keeper.monogram}
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
            transform: [...ball.getTranslateTransform(), { scale: ballScale }],
          },
        ]}
      >
        <Ball width={BALL_SIZE} height={BALL_SIZE} />
      </Animated.View>

      <Text style={[styles.keeperName, { top: geo.goalTop - 22, width }]} numberOfLines={1}>
        {keeperName}
      </Text>
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
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
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
