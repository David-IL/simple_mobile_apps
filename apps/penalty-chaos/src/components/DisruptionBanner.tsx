import { StyleSheet, Text, View } from "react-native";
import type { DisruptionId, RoundSetup } from "../game/types";
import { useI18n } from "../i18n";
import { palette, spacing, text } from "../theme";

/** Presentational only — the domain layer has no opinion about emoji. */
const ICONS: Record<DisruptionId, string> = {
  crosswind: "🚩",
  "pitch-invader": "🏃",
  "low-sun": "🌇",
  "muddy-spot": "🌧️",
  mascot: "🦡",
  "away-end": "📣",
};

/**
 * Always visible, always *before* the run-up. The player has to be able to read
 * this and plan around it — that is what separates a joke from a cheat.
 */
export function DisruptionBanner({ setup }: { setup: RoundSetup }) {
  const { t } = useI18n();
  const { disruption, effect } = setup;

  if (!disruption) {
    return (
      <View style={[styles.wrap, styles.calm]}>
        <Text style={styles.icon}>🌤️</Text>
        <View style={styles.copy}>
          <Text style={text.label}>{t.match.calmName}</Text>
          <Text style={styles.brief}>{t.match.calmBrief}</Text>
        </View>
      </View>
    );
  }

  const copy = t.disruptions[disruption.id];
  const detail =
    disruption.id === "crosswind"
      ? `${copy.brief} ${t.banner.windDirection(effect.windX < 0 ? "left" : "right")}`
      : disruption.id === "pitch-invader" && effect.blockedCol
        ? `${copy.brief} ${t.banner.invaderAt(t.sides[effect.blockedCol])}`
        : copy.brief;

  return (
    <View style={[styles.wrap, styles.active]}>
      <Text style={styles.icon}>{ICONS[disruption.id]}</Text>
      <View style={styles.copy}>
        <Text style={[text.label, styles.activeLabel]}>{copy.name}</Text>
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
