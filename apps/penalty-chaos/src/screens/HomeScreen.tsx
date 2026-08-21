import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
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
 * The title art, per language — a full-screen background rather than a banner.
 *
 * TEMPORARY: `nb` points at the English artwork. Only the English vertical
 * version exists so far, and the old Norwegian art is landscape, which cannot be
 * used full-screen without cropping the wordmark away. So a Norwegian player
 * currently sees an English title. **This must not ship** — swap the line below
 * the moment `app-banner-vertical-no.jpg` exists.
 *
 * That the wordmark is baked into the image is exactly why this is awkward; see
 * assets/README.md. Typing the map as `Record<Locale, …>` still means adding a
 * third language fails the build rather than silently falling back.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const BANNERS: Record<Locale, number> = {
  nb: require("../../assets/app-banner-vertical-en.jpg"),
  en: require("../../assets/app-banner-vertical-en.jpg"),
};
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * Where the darkening starts, as a percentage of screen height.
 *
 * The controls sit directly on artwork, so they need something to sit *on*.
 * Starting below the wordmark keeps the title in clear air while giving the
 * buttons a readable ground — and it doubles as the soft transition that a hard
 * panel edge used to do badly.
 */
const SCRIM_START = 46;

function Scrim() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={styles.fill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.night} stopOpacity="0" />
          <Stop offset="0.55" stopColor={palette.night} stopOpacity="0.72" />
          <Stop offset="1" stopColor={palette.night} stopOpacity="0.97" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y={SCRIM_START} width="100" height={100 - SCRIM_START} fill="url(#scrim)" />
    </Svg>
  );
}

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
      {/*
        `cover` here, unlike the framed banner it replaces: the art is meant to
        fill the screen, and the composition is centred, so the crop lands on sky
        and crowd rather than on the wordmark.
      */}
      <Image
        source={BANNERS[locale]}
        style={styles.fill}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={`${t.home.titleLine1} ${t.home.titleLine2}`}
      />
      <Scrim />

      <View style={styles.content}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  // Controls hug the bottom; the artwork owns everything above them.
  content: { flex: 1, justifyContent: "flex-end" },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
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
    // Slightly opaque so a chip stays legible over whatever it lands on.
    backgroundColor: "rgba(20,16,28,0.55)",
  },
  chipOn: { borderColor: palette.brand, backgroundColor: palette.brandWash },
  chipLabel: { color: palette.chalkDim, fontSize: 13, fontWeight: "600" },
  chipLabelOn: { color: palette.brand },
  footnote: { ...text.muted, textAlign: "center" },
});
