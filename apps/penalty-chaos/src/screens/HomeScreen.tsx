import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import { Ball } from "../components/art/Characters";
import type { MatchMode } from "../game/match";
import { LOCALES, useI18n } from "../i18n";
import { en } from "../i18n/en";
import { nb } from "../i18n/nb";
import { palette, spacing, text } from "../theme";

/**
 * Language names are shown in their own language, so the toggle is readable to
 * someone who cannot read the current one. That is the whole point of it.
 */
const LANGUAGE_NAMES = { nb: nb.languageName, en: en.languageName } as const;

export function HomeScreen({ onPick }: { onPick: (mode: MatchMode) => void }) {
  const { t, locale, setLocale } = useI18n();

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Ball width={52} height={52} />
        <Text style={styles.title}>
          {t.home.titleLine1}
          {"\n"}
          {t.home.titleLine2}
        </Text>
        <Text style={text.muted}>{t.home.blurb}</Text>
      </View>

      <View style={styles.actions}>
        <Button label={t.home.solo} onPress={() => onPick("solo")} />
        <Button label={t.home.duel} onPress={() => onPick("duel")} />

        <View style={styles.languageRow}>
          <Text style={text.label}>{t.home.language}</Text>
          <View style={styles.languageOptions}>
            {LOCALES.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: option === locale }}
                onPress={() => setLocale(option)}
                style={[styles.languageChip, option === locale && styles.languageChipOn]}
              >
                <Text
                  style={[styles.languageLabel, option === locale && styles.languageLabelOn]}
                >
                  {LANGUAGE_NAMES[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.footnote}>{t.home.footnote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night, justifyContent: "space-between" },
  hero: { flex: 1, justifyContent: "center", padding: spacing.xl, gap: spacing.md },
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
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  languageOptions: { flexDirection: "row", gap: spacing.xs },
  languageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
  },
  languageChipOn: { borderColor: palette.accent, backgroundColor: "#16233a" },
  languageLabel: { color: palette.chalkDim, fontSize: 13, fontWeight: "600" },
  languageLabelOn: { color: palette.accent },
  footnote: { ...text.muted, textAlign: "center" },
});
