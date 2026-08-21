import { StyleSheet, Text, View } from "react-native";
import { blockedColLabel } from "../game/disruptions";
import type { RoundSetup } from "../game/types";
import { palette, spacing, text } from "../theme";

/**
 * Always visible, always *before* the run-up. The player has to be able to read
 * this and plan around it — that is what separates a joke from a cheat.
 */
export function DisruptionBanner({ setup }: { setup: RoundSetup }) {
  const { disruption, effect } = setup;

  if (!disruption) {
    return (
      <View style={[styles.wrap, styles.calm]}>
        <Text style={styles.icon}>🌤️</Text>
        <View style={styles.copy}>
          <Text style={text.label}>Still night</Text>
          <Text style={styles.brief}>Nothing in your way. No excuses.</Text>
        </View>
      </View>
    );
  }

  const detail =
    disruption.id === "crosswind"
      ? `${disruption.brief} Blowing ${effect.windX < 0 ? "left" : "right"}.`
      : disruption.id === "pitch-invader" && effect.blockedCol
        ? `${disruption.brief} He's in ${blockedColLabel(effect.blockedCol)}.`
        : disruption.brief;

  return (
    <View style={[styles.wrap, styles.active]}>
      <Text style={styles.icon}>{disruption.icon}</Text>
      <View style={styles.copy}>
        <Text style={[text.label, styles.activeLabel]}>{disruption.name}</Text>
        <Text style={styles.brief}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 58,
  },
  calm: { backgroundColor: palette.night, borderBottomColor: palette.line },
  active: { backgroundColor: "#2a1f0b", borderBottomColor: "#4a3410" },
  activeLabel: { color: "#fbbf24" },
  icon: { fontSize: 24 },
  copy: { flex: 1, gap: 1 },
  brief: { color: palette.chalk, fontSize: 13, lineHeight: 17 },
});
