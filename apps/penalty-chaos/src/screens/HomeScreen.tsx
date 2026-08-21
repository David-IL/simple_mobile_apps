import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import { useSfx } from "../audio/SfxProvider";
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

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <Text style={text.label}>{label}</Text>
      <View style={styles.settingOptions}>{children}</View>
    </View>
  );
}

export function HomeScreen({ onPick }: { onPick: (mode: MatchMode) => void }) {
  const { t, locale, setLocale } = useI18n();
  const { muted, setMuted } = useSfx();

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

        <SettingRow label={t.home.language}>
          {LOCALES.map((option) => (
            <Chip
              key={option}
              label={LANGUAGE_NAMES[option]}
              selected={option === locale}
              onPress={() => setLocale(option)}
            />
          ))}
        </SettingRow>

        <SettingRow label={t.home.sound}>
          <Chip label={t.home.on} selected={!muted} onPress={() => setMuted(false)} />
          <Chip label={t.home.off} selected={muted} onPress={() => setMuted(true)} />
        </SettingRow>

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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  settingOptions: { flexDirection: "row", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    minWidth: 62,
    alignItems: "center",
  },
  chipOn: { borderColor: palette.accent, backgroundColor: "#16233a" },
  chipLabel: { color: palette.chalkDim, fontSize: 13, fontWeight: "600" },
  chipLabelOn: { color: palette.accent },
  footnote: { ...text.muted, textAlign: "center" },
});
