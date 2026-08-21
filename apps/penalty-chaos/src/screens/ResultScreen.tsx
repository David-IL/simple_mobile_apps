import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import { KeeperFigure } from "../components/art/KeeperFigure";
import { looksFor } from "../components/art/keeperLooks";
import { scoreOf, takenBy, winner, type MatchState, type Player } from "../game/match";
import type { KeeperArchetype } from "../game/types";
import { useI18n } from "../i18n";
import { outcomeColour, palette, spacing, text } from "../theme";

type Props = {
  state: MatchState;
  keeper: KeeperArchetype;
  onPlayAgain: () => void;
  onChangeKeeper: () => void;
};

function Recap({ state, player }: { state: MatchState; player: Player }) {
  const { t } = useI18n();
  const shots = state.shots.filter((shot) => shot.player === player);
  return (
    <View style={styles.recapRow}>
      <Text style={text.label} numberOfLines={1}>
        {state.names[player]}
      </Text>
      <View style={styles.recapShots}>
        {shots.map((shot, index) => (
          <View key={index} style={[styles.chip, { borderColor: outcomeColour[shot.kind] }]}>
            <Text style={[styles.chipText, { color: outcomeColour[shot.kind] }]}>
              {t.outcome[shot.kind]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ResultScreen({ state, keeper, onPlayAgain, onChangeKeeper }: Props) {
  const { t } = useI18n();
  const champion = winner(state);
  const solo = state.mode === "solo";
  const beaten = solo
    ? scoreOf(state, 0) > takenBy(state, 0) / 2
    : champion !== null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.copy}>
            <Text style={text.label}>{t.result.fullTime}</Text>
            {solo ? (
              <>
                <Text style={styles.bigScore}>
                  {scoreOf(state, 0)} / {takenBy(state, 0)}
                </Text>
                <Text style={text.heading}>
                  {t.result.soloVerdict(scoreOf(state, 0), takenBy(state, 0))}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.bigScore}>
                  {scoreOf(state, 0)} – {scoreOf(state, 1)}
                </Text>
                <Text style={text.heading}>
                  {champion === null ? t.result.allSquare : t.result.wins(state.names[champion])}
                </Text>
              </>
            )}
          </View>

          {/*
            Deliberately the keeper's *shipped* name, never the on-device custom
            one. A result card is shareable content; a name a kid typed in is not
            ours to publish. See ADR 8.
          */}
          <View style={styles.portrait}>
            <KeeperFigure
              width={64}
              height={96}
              looks={looksFor(keeper.id)}
              pose={beaten ? "beaten" : "celebrate"}
              direction={0}
            />
          </View>
        </View>

        <Text style={text.muted}>{t.result.versus(t.keepers[keeper.id].name)}</Text>

        <View style={styles.recap}>
          <Recap state={state} player={0} />
          {solo ? null : <Recap state={state} player={1} />}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t.result.again} onPress={onPlayAgain} />
        <Pressable onPress={onChangeKeeper} style={styles.link} accessibilityRole="button">
          <Text style={styles.linkLabel}>{t.result.differentKeeper}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night },
  scroll: { padding: spacing.xl, gap: spacing.sm, flexGrow: 1, justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  portrait: {
    width: 76,
    height: 104,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 12,
    backgroundColor: palette.nightSoft,
  },
  bigScore: { color: palette.chalk, fontSize: 56, fontWeight: "900", letterSpacing: -2 },
  recap: { marginTop: spacing.xl, gap: spacing.md },
  recapRow: { gap: spacing.xs },
  recapShots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3 },
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
