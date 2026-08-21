import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import {
  REGULATION_SHOTS,
  scoreOf,
  takenBy,
  winner,
  type MatchState,
  type Player,
} from "../game/match";
import type { KeeperArchetype } from "../game/types";
import { outcomeColour, palette, spacing, text } from "../theme";

type Props = {
  state: MatchState;
  keeper: KeeperArchetype;
  onPlayAgain: () => void;
  onChangeKeeper: () => void;
};

const kindLabel = {
  goal: "Scored",
  saved: "Saved",
  missed: "Missed",
  blocked: "Blocked",
} as const;

function soloVerdict(scored: number): string {
  if (scored === REGULATION_SHOTS) return "Perfect. Every one.";
  if (scored === 0) return "Not one. Not a single one.";
  if (scored >= 4) return "Nearly flawless.";
  if (scored >= 2) return "Respectable enough.";
  return "Room for improvement, let's say.";
}

function Recap({ state, player }: { state: MatchState; player: Player }) {
  const shots = state.shots.filter((shot) => shot.player === player);
  return (
    <View style={styles.recapRow}>
      <Text style={styles.recapName} numberOfLines={1}>
        {state.names[player]}
      </Text>
      <View style={styles.recapShots}>
        {shots.map((shot, index) => (
          <View key={index} style={[styles.chip, { borderColor: outcomeColour[shot.kind] }]}>
            <Text style={[styles.chipText, { color: outcomeColour[shot.kind] }]}>
              {kindLabel[shot.kind]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ResultScreen({ state, keeper, onPlayAgain, onChangeKeeper }: Props) {
  const champion = winner(state);
  const solo = state.mode === "solo";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={text.label}>Full time</Text>

        {solo ? (
          <>
            <Text style={styles.bigScore}>
              {scoreOf(state, 0)} / {takenBy(state, 0)}
            </Text>
            <Text style={text.heading}>{soloVerdict(scoreOf(state, 0))}</Text>
          </>
        ) : (
          <>
            <Text style={styles.bigScore}>
              {scoreOf(state, 0)} – {scoreOf(state, 1)}
            </Text>
            <Text style={text.heading}>
              {champion === null ? "All square." : `${state.names[champion]} wins it.`}
            </Text>
          </>
        )}

        {/*
          Deliberately the keeper's *shipped* name, never the on-device custom one.
          A result card is shareable content; a name a kid typed in is not ours to
          publish. See ADR 8.
        */}
        <Text style={styles.against}>versus {keeper.name}</Text>

        <View style={styles.recap}>
          <Recap state={state} player={0} />
          {solo ? null : <Recap state={state} player={1} />}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Again" onPress={onPlayAgain} />
        <Pressable onPress={onChangeKeeper} style={styles.link} accessibilityRole="button">
          <Text style={styles.linkLabel}>Different keeper</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night },
  scroll: { padding: spacing.xl, gap: spacing.sm, flexGrow: 1, justifyContent: "center" },
  bigScore: {
    color: palette.chalk,
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -2,
  },
  against: { ...text.muted, marginTop: spacing.xs },
  recap: { marginTop: spacing.xl, gap: spacing.md },
  recapRow: { gap: spacing.xs },
  recapName: { ...text.label },
  recapShots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: "700" },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
  link: { alignSelf: "center", padding: spacing.sm },
  linkLabel: { color: palette.chalkDim, fontSize: 13, textDecorationLine: "underline" },
});
