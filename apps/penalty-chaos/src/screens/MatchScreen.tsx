import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useSfx } from "../audio/SfxProvider";
import { DisruptionBanner } from "../components/DisruptionBanner";
import { GoalScene, type ScenePhase } from "../components/GoalScene";
import { Scoreboard } from "../components/Scoreboard";
import { effectFor, rollDisruption } from "../game/disruptions";
import { aimFromDrag, resolveShot, setupRound, splitZone } from "../game/engine";
import { currentPlayer, isOver, recordShot, zoneHistory, type MatchState } from "../game/match";
import type { Aim, KeeperArchetype, RoundSetup, ShotResult } from "../game/types";
import { useI18n } from "../i18n";
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

/**
 * `tauntRoll` is stored rather than the taunt itself so that switching language
 * mid-match re-resolves the line instead of leaving English on screen.
 */
type Round = { setup: RoundSetup; tauntRoll: number | null };

function makeRound(keeper: KeeperArchetype, state: MatchState): Round {
  const disruption = rollDisruption(rng);
  const effect = effectFor(disruption, rng);
  const history = zoneHistory(state, currentPlayer(state));
  return {
    setup: setupRound(keeper, history, disruption, effect, rng),
    tauntRoll: rng() < keeper.tauntRate ? rng() : null,
  };
}

/** Which effect fires once the ball has landed. */
const OUTCOME_SFX = {
  goal: "goal",
  saved: "save",
  missed: "miss",
  blocked: "blocked",
} as const;

export function MatchScreen({ keeper, keeperName, initialState, onFinish, onQuit }: Props) {
  const { t } = useI18n();
  const { play } = useSfx();
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

  const maxDragRef = useRef(160);
  maxDragRef.current = Math.min(Math.max(scene.height * 0.42, 110), 190);

  const shoot = useCallback(
    (aim: Aim, power: number) => {
      setResult(resolveShot({ aim, power, keeper, setup: roundRef.current.setup, rng }));
      setDrag(null);
      setPhase("flying");
      play("kick");
    },
    [keeper, play],
  );

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

  // onFlightEnd is handed to an animation callback inside GoalScene, so it has
  // to stay referentially stable or the flight animation restarts mid-air. It
  // therefore reads the result through a ref rather than closing over it.
  const resultRef = useRef(result);
  resultRef.current = result;

  const onFlightEnd = useCallback(() => {
    setPhase("settled");
    const landed = resultRef.current;
    if (landed) play(OUTCOME_SFX[landed.kind]);
  }, [play]);

  // Round-opening flourishes: the keeper starting up, and the badger arriving.
  useEffect(() => {
    if (round.setup.disruption?.id === "mascot") play("mascot");
    else if (round.tauntRoll !== null) play("taunt");
  }, [round, play]);

  const advance = useCallback(() => {
    if (!result) return;
    const next = recordShot(state, result.kind, result.zone);
    setState(next);
    if (isOver(next)) {
      play("whistle");
      onFinish(next);
      return;
    }
    setRound(makeRound(keeper, next));
    setResult(null);
    setPhase("aiming");
  }, [result, state, keeper, onFinish, play]);

  const onSceneLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScene({ width, height });
  }, []);

  const takerName =
    state.mode === "solo" ? t.match.soloTaker : state.names[currentPlayer(state)];
  const blindAim = round.setup.effect.blindAim;
  const showPreview = drag && !blindAim ? drag.aim : null;

  const taunts = t.keepers[keeper.id].taunts;
  const taunt =
    round.tauntRoll === null ? null : (taunts[Math.floor(round.tauntRoll * taunts.length)] ?? null);

  const headline = result
    ? t.headlines[result.headline]({
        keeper: keeperName,
        side: result.zone ? t.sides[splitZone(result.zone).col] : t.sides.centre,
      })
    : "";

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
              {t.verdict[result.kind]}
            </Text>
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.tapHint}>{t.match.tapToContinue}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controls}>
        {phase === "aiming" ? (
          <>
            <Text style={text.label}>{t.match.toTake(takerName)}</Text>
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
            <Text style={styles.hint}>{blindAim ? t.match.hintBlind : t.match.hintNormal}</Text>
            {taunt ? <Text style={styles.taunt}>“{taunt}”</Text> : null}
          </>
        ) : (
          <Text style={styles.hint}> </Text>
        )}
      </View>

      <Pressable style={styles.quit} onPress={onQuit} accessibilityRole="button">
        <Text style={styles.quitLabel}>{t.match.giveUp}</Text>
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
  taunt: { color: palette.chalk, fontSize: 14, fontStyle: "italic", textAlign: "center" },
  quit: { alignSelf: "center", padding: spacing.sm, marginBottom: spacing.xs },
  quitLabel: { color: palette.chalkDim, fontSize: 12, textDecorationLine: "underline" },
});
