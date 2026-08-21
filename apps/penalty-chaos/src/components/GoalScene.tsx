import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { splitZone } from "../game/engine";
import { ZONE_COLS, ZONE_ROWS } from "../game/types";
import type { Aim, KeeperArchetype, RoundSetup, ShotResult, Zone } from "../game/types";
import { palette } from "../theme";

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

const GOAL_WIDTH_RATIO = 0.86;
const GOAL_HEIGHT_RATIO = 0.56;
const BALL_SIZE = 22;
const KEEPER_WIDTH = 44;
const KEEPER_HEIGHT = 58;
const FLIGHT_MS = 520;

/** Geometry shared by everything drawn in the scene. */
function useGeometry(width: number, height: number) {
  return useMemo(() => {
    const goalWidth = width * GOAL_WIDTH_RATIO;
    const goalHeight = height * GOAL_HEIGHT_RATIO;
    const goalLeft = (width - goalWidth) / 2;
    const goalTop = height * 0.06;
    return {
      goalWidth,
      goalHeight,
      goalLeft,
      goalTop,
      goalBottom: goalTop + goalHeight,
      spotX: width / 2,
      spotY: height - 34,
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
        const y = row === "high" ? goalTop + goalHeight * 0.3 : goalTop + goalHeight * 0.74;
        return { x, y };
      },
    };
  }, [width, height]);
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

  const restingKeeper = geo.zoneCentre("centre-low");

  // The tell: the keeper leans toward a zone *before* the player shoots. This is
  // the counterweight to pattern-reading — see docs/research/penalty-chaos.md §6b.
  useEffect(() => {
    if (phase !== "aiming") return;
    const tell = setup.keeperTell;
    const lean = tell ? geo.zoneCentre(tell) : restingKeeper;
    const strength = 0.28;
    Animated.timing(keeperMove, {
      toValue: {
        x: (lean.x - restingKeeper.x) * strength,
        y: (lean.y - restingKeeper.y) * strength,
      },
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [phase, setup, geo, keeperMove, restingKeeper.x, restingKeeper.y]);

  // Reset the ball to the spot whenever a new round starts.
  useEffect(() => {
    if (phase !== "aiming") return;
    ball.setValue({ x: 0, y: 0 });
    ballScale.setValue(1);
  }, [phase, setup, ball, ballScale]);

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
      // Shrinking sells distance without needing a perspective transform.
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
  const invaderCol = setup.effect.blockedCol;

  return (
    <View style={[styles.scene, { width, height }]}>
      <View
        style={[
          styles.grass,
          { top: geo.goalBottom - 8, height: height - geo.goalBottom + 8, width },
        ]}
      />

      {/* Goal mouth, drawn as its six zones so the keeper's read is legible. */}
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
        {ZONE_ROWS.map((row) => (
          <View key={row} style={styles.zoneRow}>
            {ZONE_COLS.map((col) => (
              <View key={col} style={styles.zoneCell} />
            ))}
          </View>
        ))}
      </View>

      {invaderCol ? (
        <View
          style={[
            styles.invader,
            {
              left:
                geo.goalLeft +
                geo.goalWidth * ((ZONE_COLS.indexOf(invaderCol) + 0.5) / ZONE_COLS.length) -
                18,
              top: geo.goalBottom - 46,
            },
          ]}
        >
          <Text style={styles.invaderIcon}>🏃</Text>
        </View>
      ) : null}

      {/* Aim line from the spot to the current target. */}
      {preview ? (
        <>
          <View
            style={[
              styles.aimDot,
              { left: preview.x - 9, top: preview.y - 9 },
            ]}
          />
          <View
            style={[
              styles.aimTrack,
              {
                left: geo.spotX,
                top: geo.spotY,
                width: Math.hypot(preview.x - geo.spotX, preview.y - geo.spotY),
                transform: [
                  {
                    rotate: `${Math.atan2(preview.y - geo.spotY, preview.x - geo.spotX)}rad`,
                  },
                ],
              },
            ]}
          />
        </>
      ) : null}

      <Animated.View
        style={[
          styles.keeper,
          {
            left: restingKeeper.x - KEEPER_WIDTH / 2,
            top: restingKeeper.y - KEEPER_HEIGHT / 2,
            backgroundColor: keeper.shirt,
            transform: keeperMove.getTranslateTransform(),
          },
        ]}
      >
        <Text style={styles.keeperMonogram}>{keeper.monogram}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.ball,
          {
            left: geo.spotX - BALL_SIZE / 2,
            top: geo.spotY - BALL_SIZE / 2,
            transform: [...ball.getTranslateTransform(), { scale: ballScale }],
          },
        ]}
      />

      <View style={[styles.spot, { left: geo.spotX - 3, top: geo.spotY + 16 }]} />

      <Text style={[styles.keeperName, { top: geo.goalTop - 2, width }]} numberOfLines={1}>
        {keeperName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: "relative", overflow: "hidden" },
  grass: { position: "absolute", left: 0, backgroundColor: palette.grass },
  goal: {
    position: "absolute",
    borderWidth: 4,
    borderColor: palette.chalk,
    borderRadius: 2,
    backgroundColor: "rgba(15,23,42,0.35)",
    overflow: "hidden",
  },
  zoneRow: { flex: 1, flexDirection: "row" },
  zoneCell: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(248,250,252,0.18)",
  },
  keeper: {
    position: "absolute",
    width: KEEPER_WIDTH,
    height: KEEPER_HEIGHT,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(15,23,42,0.55)",
  },
  keeperMonogram: { color: palette.chalk, fontWeight: "800", fontSize: 15 },
  keeperName: {
    position: "absolute",
    textAlign: "center",
    color: palette.chalkDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: palette.ball,
    borderWidth: 2,
    borderColor: "#334155",
  },
  spot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(248,250,252,0.6)",
  },
  aimDot: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.accent,
    backgroundColor: "rgba(56,189,248,0.25)",
  },
  aimTrack: {
    position: "absolute",
    height: 2,
    backgroundColor: "rgba(56,189,248,0.45)",
    transformOrigin: "left center",
  },
  invader: {
    position: "absolute",
    width: 36,
    alignItems: "center",
  },
  invaderIcon: { fontSize: 30 },
});
