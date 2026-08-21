import { useCallback, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DisruptionBanner } from "../components/DisruptionBanner";
import { GoalScene, type ScenePhase } from "../components/GoalScene";
import { Scoreboard } from "../components/Scoreboard";
import { effectFor, rollDisruption } from "../game/disruptions";
import { aimFromDrag, resolveShot, setupRound } from "../game/engine";
import {
  currentPlayer,
  isOver,
  recordShot,
  zoneHistory,
  type MatchState,
} from "../game/match";
import type { Aim, KeeperArchetype, RoundSetup, ShotResult } from "../game/types";
import { outcomeColour, palette, spacing, text } from "../theme";

type Props = {
  keeper: KeeperArchetype;
  keeperName: string;
  initialState: MatchState;
  onFinish: (final: MatchState) => void;
  onQuit: () => void;
};

/** Below this the drag reads as a fumble rather than a shot. */
const MIN_POWER = 0.12;

const rng = Math.random;

type Round = { setup: RoundSetup; taunt: string | null };

function pickTaunt(keeper: KeeperArchetype): string | null {
  if (rng() >= keeper.tauntRate) return null;
  return keeper.taunts[Math.floor(rng() * keeper.taunts.length)] ?? null;
}

function makeRound(keeper: KeeperArchetype, state: MatchState): Round {
  const disruption = rollDisruption(rng);
  const effect = effectFor(disruption, rng);
  const history = zoneHistory(state, currentPlayer(state));
  return {
    setup: setupRound(keeper, history, disruption, effect, rng),
    taunt: pickTaunt(keeper),
  };
}

const outcomeVerdict = {
  goal: "GOAL",
  saved: "SAVED",
  missed: "MISSED",
  blocked: "BLOCKED",
} as const;

export function MatchScreen({ keeper, keeperName, initialState, onFinish, onQuit }: Props) {
  const [state, setState] = useState(initialState);
  const [round, setRound] = useState<Round>(() => makeRound(keeper, initialState));
  const [phase, setPhase] = useState<ScenePhase>("aiming");
  const [drag, setDrag] = useState<{ aim: Aim; power: number } | null>(null);
  const [result, setResult] = useState<ShotResult | null>(null);
  const [scene, setScene] = useState({ width: 0, height: 0 });

  // PanResponder is created once, so its handlers read live values through refs
  // rather than closing over stale state.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const roundRef = useRef(round);
  roundRef.current = round;
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const stateRef = useRef(state);
  stateRef.current = state;

  const maxDragRef = useRef(160);
  maxDragRef.current = Math.min(Math.max(scene.height * 0.42, 110), 190);

  const shoot = useCallback((aim: Aim, power: number) => {
    const shot = resolveShot({
      aim,
      power,
      keeper,
      setup: roundRef.current.setup,
      rng,
    });
    setResult(shot);
    setDrag(null);
    setPhase("flying");
  }, [keeper]);

  // shoot() closes over props, so the once-created responder reaches it via a ref.
  const shootRef = useRef(shoot);
  shootRef.current = shoot;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => phaseRef.current === "aiming",
      onMoveShouldSetPanResponder: () => phaseRef.current === "aiming",
      onPanResponderMove: (_event, gesture) => {
        if (phaseRef.current !== "aiming") return;
        // Dragging downward is not a shot — it's how you back out of one.
        if (gesture.dy >= 0) {
          setDrag(null);
          return;
        }
        setDrag(
          aimFromDrag(
            gesture.dx,
            gesture.dy,
            maxDragRef.current,
            roundRef.current.setup.effect.powerCap,
          ),
        );
      },
      onPanResponderRelease: (_event, gesture) => {
        if (phaseRef.current !== "aiming") return;
        if (gesture.dy >= 0) {
          setDrag(null);
          return;
        }
        const shotInput = aimFromDrag(
          gesture.dx,
          gesture.dy,
          maxDragRef.current,
          roundRef.current.setup.effect.powerCap,
        );
        if (shotInput.power < MIN_POWER) {
          setDrag(null);
          return;
        }
        shootRef.current(shotInput.aim, shotInput.power);
      },
      onPanResponderTerminate: () => setDrag(null),
    }),
  ).current;

  const onFlightEnd = useCallback(() => setPhase("settled"), []);

  const advance = useCallback(() => {
    if (!result) return;
    const next = recordShot(state, result.kind, result.zone);
    setState(next);
    if (isOver(next)) {
      onFinish(next);
      return;
    }
    setRound(makeRound(keeper, next));
    setResult(null);
    setPhase("aiming");
  }, [result, state, keeper, onFinish]);

  const onSceneLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScene({ width, height });
  }, []);

  const takerName = state.names[currentPlayer(state)];
  const blindAim = round.setup.effect.blindAim;
  const showPreview = drag && !blindAim ? drag.aim : null;

  return (
    <View style={styles.screen}>
      <Scoreboard state={state} />
      <DisruptionBanner setup={round.setup} />

      <View style={styles.stage} onLayout={onSceneLayout} {...responder.panHandlers}>
        {scene.width > 0 ? (
          <GoalScene
            width={scene.width}
            height={scene.height}
            keeper={keeper}
            keeperName={keeperName}
            setup={round.setup}
            phase={phase}
            aimPreview={showPreview}
            result={result}
            onFlightEnd={onFlightEnd}
          />
        ) : null}

        {phase === "settled" && result ? (
          <Pressable style={styles.overlay} onPress={advance}>
            <Text style={[styles.verdict, { color: outcomeColour[result.kind] }]}>
              {outcomeVerdict[result.kind]}
            </Text>
            <Text style={styles.headline}>{result.headline}</Text>
            <Text style={styles.tapHint}>Tap to continue</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controls}>
        {phase === "aiming" ? (
          <>
            <Text style={text.label}>{takerName} to take it</Text>
            <View style={styles.powerTrack}>
              <View
                style={[
                  styles.powerFill,
                  {
                    width: `${Math.round((drag?.power ?? 0) * 100)}%`,
                    backgroundColor: (drag?.power ?? 0) > 0.8 ? palette.save : palette.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.hint}>
              {blindAim
                ? "Drag up and release — no aim line this time."
                : "Drag up from anywhere and release. Further = more power, less accuracy."}
            </Text>
            {round.taunt ? <Text style={styles.taunt}>“{round.taunt}”</Text> : null}
          </>
        ) : (
          <Text style={styles.hint}>{phase === "flying" ? "…" : " "}</Text>
        )}
      </View>

      <Pressable style={styles.quit} onPress={onQuit} accessibilityRole="button">
        <Text style={styles.quitLabel}>Give up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night },
  stage: { flex: 1, position: "relative" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,18,32,0.82)",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  verdict: { fontSize: 44, fontWeight: "900", letterSpacing: 2 },
  headline: { ...text.body, textAlign: "center" },
  tapHint: { ...text.muted, marginTop: spacing.lg },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    minHeight: 132,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
  powerTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.line,
    overflow: "hidden",
  },
  powerFill: { height: "100%", borderRadius: 4 },
  hint: { ...text.muted, textAlign: "center" },
  taunt: {
    color: palette.chalk,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  quit: { alignSelf: "center", padding: spacing.sm, marginBottom: spacing.xs },
  quitLabel: { color: palette.chalkDim, fontSize: 12, textDecorationLine: "underline" },
});
