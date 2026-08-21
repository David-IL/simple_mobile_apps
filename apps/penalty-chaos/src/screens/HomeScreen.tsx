import { StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import type { MatchMode } from "../game/match";
import { palette, spacing, text } from "../theme";

export function HomeScreen({ onPick }: { onPick: (mode: MatchMode) => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>⚽</Text>
        <Text style={styles.title}>Penalty{"\n"}Chaos</Text>
        <Text style={text.muted}>
          Five penalties. One keeper who talks too much and remembers where you put the last
          one. Occasionally, someone&apos;s uncle runs onto the pitch.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Solo shootout" onPress={() => onPick("solo")} />
        <Button label="Two players, one phone" onPress={() => onPick("duel")} />
        <Text style={styles.footnote}>No ads. No accounts. Works on a coach with no signal.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night, justifyContent: "space-between" },
  hero: { flex: 1, justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  kicker: { fontSize: 44 },
  title: {
    color: palette.chalk,
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 52,
  },
  actions: {
    padding: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
  footnote: { ...text.muted, textAlign: "center", marginTop: spacing.xs },
});
