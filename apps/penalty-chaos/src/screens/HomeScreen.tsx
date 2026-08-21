import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@repo/ui";
import { useSfx } from "../audio/SfxProvider";
import type { MatchMode } from "../game/match";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { en } from "../i18n/en";
import { nb } from "../i18n/nb";
import { palette, spacing, text } from "../theme";

/**
 * Language names are shown in their own language, so the toggle is readable to
 * someone who cannot read the current one. That is the whole point of it.
 */
const LANGUAGE_NAMES = { nb: nb.languageName, en: en.languageName } as const;

/**
 * The title art, per language.
 *
 * The wordmark is baked into these images, which is a real trade-off: the title
 * no longer comes from src/i18n, so a third language means a third picture
 * rather than a third string. Typing this as `Record<Locale, …>` is what keeps
 * ADR 10's guarantee intact — add a locale and this fails to compile until the
 * artwork exists, rather than silently showing Norwegian to a Swede.
 *
 * The screen reader still gets translated text via accessibilityLabel below,
 * because a picture of a word is not a word.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const BANNERS: Record<Locale, number> = {
  nb: require("../../assets/app-banner-no.jpg"),
  en: require("../../assets/app-banner-en.jpg"),
};
/* eslint-enable @typescript-eslint/no-require-imports */

/** The artwork's own aspect ratio, so nothing is ever cropped. */
const BANNER_ASPECT = 1280 / 698;

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
        {/*
          The frame owns the layout and the image just fills it. Giving the
          Image itself a width plus an aspectRatio left it free to resolve its
          own intrinsic size and overflow the screen, which showed as the art
          being cropped at the right-hand edge.

          `contain` rather than `cover` on purpose: the frame's aspect ratio
          already matches the artwork, so the two are equivalent when correct —
          but if that ever drifts, `contain` letterboxes and `cover` silently
          eats the wordmark.
        */}
        <View style={styles.bannerFrame}>
          <Image
            source={BANNERS[locale]}
            style={styles.banner}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={`${t.home.titleLine1} ${t.home.titleLine2}`}
          />
        </View>
        <Text style={[text.muted, styles.blurb]}>{t.home.blurb}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={t.home.solo}
          onPress={() => onPick("solo")}
          color={palette.brand}
          labelColor={palette.brandInk}
        />
        <Button
          label={t.home.duel}
          onPress={() => onPick("duel")}
          color={palette.brandDeep}
          labelColor={palette.chalk}
        />

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
  // No horizontal padding: the banner runs edge to edge, and the blurb pads
  // itself instead.
  hero: { flex: 1, justifyContent: "center", paddingVertical: spacing.lg, gap: spacing.lg },
  bannerFrame: {
    alignSelf: "stretch",
    width: "100%",
    aspectRatio: BANNER_ASPECT,
    overflow: "hidden",
  },
  banner: { width: "100%", height: "100%" },
  blurb: { paddingHorizontal: spacing.lg },
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
  chipOn: { borderColor: palette.brand, backgroundColor: palette.brandWash },
  chipLabel: { color: palette.chalkDim, fontSize: 13, fontWeight: "600" },
  chipLabelOn: { color: palette.brand },
  footnote: { ...text.muted, textAlign: "center" },
});
