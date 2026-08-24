import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useSfx } from "../audio/SfxProvider";
import { tauntSfxId, type SfxId } from "../audio/sounds";
import { DisruptionBanner } from "../components/DisruptionBanner";
import { GoalScene, type ScenePhase } from "../components/GoalScene";
import { HoldButton } from "../components/HoldButton";
import { Scoreboard } from "../components/Scoreboard";
import { ShotMap } from "../components/ShotMap";
import { effectFor, rollDisruption } from "../game/disruptions";
import { aimFromDrag, resolveShot, setupRound, splitZone } from "../game/engine";
import {
  currentPlayer,
  isOver,
  recordShot,
  shotsBy,
  zoneHistory,
  type MatchState,
} from "../game/match";
import type {
  Aim,
  DisruptionId,
  KeeperArchetype,
  RoundSetup,
  ShotResult,
  ShotResultKind,
} from "../game/types";
import { useI18n } from "../i18n";
import { useKeeperRecord } from "../state/keeperRecord";
import { useShotTutorial } from "../state/tutorial";
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

/**
 * What each outcome sounds like, as layers rather than one clip.
 *
 * `miss` is really the crowd's reaction — an "ooooh" of disappointment — so it
 * belongs on every outcome that is not a goal, not just on a shot that went
 * wide. A save is two events: the ball hitting the gloves, and the crowd
 * groaning about it. Playing only the glove thud made a save sound like it
 * happened in an empty ground.
 *
 * Each id has its own player, so these genuinely overlap rather than cutting
 * each other off.
 */
const OUTCOME_SFX: Record<ShotResultKind, readonly SfxId[]> = {
  goal: ["goal"],
  saved: ["save", "miss"],
  missed: ["miss"],
  blocked: ["blocked", "miss"],
};

/**
 * Disruptions that announce themselves. Only the ones whose joke is audible —
 * a crosswind and a low sun are things you see, not hear, and a sound for every
 * gag would turn the start of every other round into a noise.
 */
const DISRUPTION_SFX: Partial<Record<DisruptionId, SfxId>> = {
  "away-end": "chant",
};

export function MatchScreen({ keeper, keeperName, initialState, onFinish, onQuit }: Props) {
  const { t } = useI18n();
  const { play } = useSfx();
  const { showAimHint, recordShotTaken } = useShotTutorial();
  const { recordShot: recordAgainstKeeper } = useKeeperRecord();
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
      recordShotTaken();
    },
    [keeper, play, recordShotTaken],
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

  // Split in two: the glove noise belongs at the moment the ball is stopped,
  // not after it has finished bouncing away from the save.
  const onContact = useCallback(() => {
    const landed = resultRef.current;
    if (landed) for (const id of OUTCOME_SFX[landed.kind]) play(id);
  }, [play]);

  const onFlightEnd = useCallback(() => setPhase("settled"), []);

  // Round-opening flourishes. A disruption that has its own sound takes
  // precedence over the taunt, so the two never talk over each other.
  useEffect(() => {
    const disruptionId = round.setup.disruption?.id;
    const disruptionSfx = disruptionId ? DISRUPTION_SFX[disruptionId] : undefined;
    if (disruptionSfx) play(disruptionSfx);
    else if (round.tauntRoll !== null) play(tauntSfxId(keeper.id));
  }, [round, play, keeper.id]);

  const advance = useCallback(() => {
    if (!result) return;
    const next = recordShot(state, result.kind, result.zone, result.landing);
    // Per shot, not per match, so an abandoned shootout still counts against him.
    recordAgainstKeeper(keeper.id, result.kind);
    setState(next);
    if (isOver(next)) {
      play("whistle");
      onFinish(next);
      return;
    }
    setRound(makeRound(keeper, next));
    setResult(null);
    setPhase("aiming");
  }, [result, state, keeper, onFinish, play, recordAgainstKeeper]);

  const onSceneLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScene({ width, height });
  }, []);

  // Solo now stores a real (or "You"-defaulted) name at the same slot duel
  // uses, set once at SetupScreen — no mode split needed here any more.
  const takerName = state.names[currentPlayer(state)];
  const showPreview = drag && !round.setup.effect.blindAim ? drag.aim : null;

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
      <Scoreboard state={state} keeperName={keeperName} />
      <DisruptionBanner setup={round.setup} />

      <View style={styles.stage} onLayout={onSceneLayout} {...responder.panHandlers}>
        {scene.width > 0 ? (
          <GoalScene
            width={scene.width}
            height={scene.height}
            keeper={keeper}
            setup={round.setup}
            phase={phase}
            aimPreview={showPreview}
            result={result}
            taunt={taunt}
            showAimHint={showAimHint}
            aimHintLabel={t.match.hintNormal}
            onContact={onContact}
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
                    // Red for the danger zone, not orange — orange is the
                    // brand now, and a warning has to mean only one thing.
                    backgroundColor: (drag?.power ?? 0) > 0.8 ? palette.miss : palette.aim,
                  },
                ]}
              />
            </View>
            {/*
              The shot map sits where the taunt used to. It is the player's own
              pattern shown back to them — which is the same data the keeper is
              reading, so it is the counterplay to being read, not a spoiler.
            */}
            <View style={styles.readout}>
              <ShotMap shots={shotsBy(state, currentPlayer(state))} />
            </View>
          </>
        ) : (
          <Text style={styles.hint}> </Text>
        )}
      </View>

      <View style={styles.quit}>
        <HoldButton
          label={t.match.giveUp}
          accessibilityHint={t.match.giveUpHint}
          onHoldComplete={onQuit}
        />
      </View>
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
    backgroundColor: "rgba(20,16,28,0.86)",
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
  readout: { alignItems: "center", width: "100%" },
  hint: { ...text.muted, flex: 1 },
  quit: { paddingBottom: spacing.md, paddingTop: spacing.xs },
});
