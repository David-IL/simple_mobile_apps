import { StyleSheet, Text, View } from "react-native";
import {
  REGULATION_SHOTS,
  currentPlayer,
  isSuddenDeath,
  scoreOf,
  type MatchState,
  type Player,
} from "../game/match";
import { useI18n } from "../i18n";
import { outcomeColour, palette, spacing, text } from "../theme";

function pipsFor(state: MatchState, player: Player) {
  const taken = state.shots.filter((shot) => shot.player === player);
  const slots = Math.max(REGULATION_SHOTS, taken.length);
  return Array.from({ length: slots }, (_, index) => taken[index] ?? null);
}

function Side({ state, player }: { state: MatchState; player: Player }) {
  const active = !state.shots.length || currentPlayer(state) === player;
  return (
    <View style={styles.side}>
      <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
        {state.names[player]}
      </Text>
      <Text style={styles.score}>{scoreOf(state, player)}</Text>
      <View style={styles.pips}>
        {pipsFor(state, player).map((shot, index) => (
          <View
            key={index}
            style={[
              styles.pip,
              shot ? { backgroundColor: outcomeColour[shot.kind], borderColor: "transparent" } : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function Scoreboard({ state }: { state: MatchState }) {
  const { t } = useI18n();
  const suddenDeath = isSuddenDeath(state);

  return (
    <View style={styles.wrap}>
      <Side state={state} player={0} />
      {state.mode === "duel" ? (
        <>
          <Text style={styles.dash}>–</Text>
          <Side state={state} player={1} />
        </>
      ) : (
        <View style={styles.side}>
          <Text style={text.label}>{t.match.outOf(REGULATION_SHOTS)}</Text>
        </View>
      )}
      {suddenDeath ? <Text style={styles.suddenDeath}>{t.match.suddenDeath}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: palette.nightSoft,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  side: { flex: 1, alignItems: "center", gap: 2 },
  name: { color: palette.chalkDim, fontSize: 12, fontWeight: "700" },
  nameActive: { color: palette.brand },
  score: { color: palette.chalk, fontSize: 28, fontWeight: "800" },
  dash: { color: palette.chalkDim, fontSize: 20, paddingHorizontal: spacing.sm },
  pips: { flexDirection: "row", gap: 4, marginTop: 2 },
  pip: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: palette.line,
  },
  suddenDeath: {
    position: "absolute",
    top: 2,
    alignSelf: "center",
    color: palette.save,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
