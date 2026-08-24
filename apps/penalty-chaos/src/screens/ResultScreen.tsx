import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import { PlayerBadge } from "../components/PlayerBadge";
import { ChevronRight } from "../components/Icons";
import { VikingRow } from "../components/VikingRow";
import { ShotMap } from "../components/ShotMap";
import { KeeperFigure } from "../components/art/KeeperFigure";
import { looksFor } from "../components/art/keeperLooks";
import {
  scoreOf,
  shotsBy,
  takenBy,
  winner,
  type MatchState,
  type Player,
} from "../game/match";
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
      <View style={styles.recapName}>
        <PlayerBadge name={state.names[player]} player={player} size={20} />
        <Text style={text.label} numberOfLines={1}>
          {state.names[player]}
        </Text>
      </View>
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
  const [rowing, setRowing] = useState(false);
  const champion = winner(state);
  const solo = state.mode === "solo";
  const beaten = solo
    ? scoreOf(state, 0) > takenBy(state, 0) / 2
    : champion !== null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/*
          The same component as the in-play corner map, just bigger. At full
          time it is the most interesting thing on the screen: five dots is a
          picture of how you take penalties, and against a reading keeper it is
          also the evidence for why you were read.
        */}
        <View style={styles.maps}>
          {solo ? (
            <ShotMap shots={shotsBy(state, 0)} width={216} />
          ) : (
            ([0, 1] as const).map((player) => (
              <View key={player} style={styles.mapColumn}>
                <Text style={text.label} numberOfLines={1}>
                  {state.names[player]}
                </Text>
                <ShotMap shots={shotsBy(state, player)} width={150} />
              </View>
            ))
          )}
        </View>

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
              height={86}
              looks={looksFor(keeper.id)}
              pose={beaten ? "beaten" : "celebrate"}
              direction={0}
            />
          </View>
        </View>

        <Text style={text.muted}>{t.result.versus(t.keepers[keeper.id].name)}</Text>

        {/*
          The reward moment, offered only after a win — celebrating a 1 of 5 is
          absurd. It sits in the celebration content rather than in the footer
          on purpose: "Igjen" is the loop this whole app is built around, and
          nothing may end up between the player and it.

          It is deliberately **not** a `Button`. As an amber one it was the same
          component, colour and shape as "Igjen" directly below it, and the two
          competed — which they should never do, because they are different
          kinds of thing. The footer is navigation; this is a reward. So it
          wears the crowd's own red and the flag stripe off the supporters'
          shirts, a combination nothing else in the app uses, and reads as an
          invitation rather than as a third way out of this screen.
        */}
        {beaten ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.row.invite}
            onPress={() => setRowing(true)}
            style={({ pressed }) => [styles.ribbon, pressed && styles.ribbonPressed]}
          >
            <View style={styles.stripeWhite} />
            <View style={styles.stripeBlue} />
            <Text style={styles.ribbonLabel} numberOfLines={1}>
              {t.row.invite}
            </Text>
            <ChevronRight height={13} colour="#ffffff" />
          </Pressable>
        ) : null}

        <View style={styles.recap}>
          <Recap state={state} player={0} />
          {solo ? null : <Recap state={state} player={1} />}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t.result.again}
          onPress={onPlayAgain}
          color={palette.brand}
          labelColor={palette.brandInk}
        />
        <Button
          label={t.result.differentKeeper}
          onPress={onChangeKeeper}
          color={palette.line}
          labelColor={palette.chalk}
        />
      </View>

      {rowing ? <VikingRow onClose={() => setRowing(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night },
  scroll: { padding: spacing.xl, gap: spacing.sm, flexGrow: 1, justifyContent: "center" },
  maps: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  mapColumn: { alignItems: "center", gap: spacing.xs },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  portrait: {
    width: 96,
    height: 94,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 12,
    backgroundColor: palette.nightSoft,
  },
  bigScore: { color: palette.chalk, fontSize: 56, fontWeight: "900", letterSpacing: -2 },
  /**
   * The crowd's red, not the brand amber: amber is this app's chrome and every
   * control wears it, so an amber celebration reads as one more control. See
   * the note at the call site.
   */
  ribbon: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: "#ba0c2f",
    borderRadius: 14,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingVertical: 14,
    overflow: "hidden",
  },
  ribbonPressed: { opacity: 0.85 },
  // The flag stripe from the supporters' shirts, running down the leading edge.
  stripeWhite: { position: "absolute", left: 8, top: 0, bottom: 0, width: 10, backgroundColor: "#eef2f6" },
  stripeBlue: { position: "absolute", left: 11, top: 0, bottom: 0, width: 4, backgroundColor: "#00205b" },
  ribbonLabel: { flex: 1, color: "#ffffff", fontSize: 16, fontWeight: "800" },
  recap: { marginTop: spacing.xl, gap: spacing.md },
  recapRow: { gap: spacing.xs },
  recapName: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
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
});
