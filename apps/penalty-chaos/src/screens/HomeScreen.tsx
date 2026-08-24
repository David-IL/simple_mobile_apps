import { useCallback, useState, type ReactNode } from "react";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
 * The title art, per language.
 *
 * The wordmark is baked into these images, so the title does not come from
 * src/i18n and a third language needs a third picture rather than a third
 * string. Typing this as `Record<Locale, …>` is what keeps ADR 10's guarantee:
 * add a locale and this fails to compile until the artwork exists.
 *
 * Note the limit of that guarantee, learned the hard way while only the English
 * version existed — pointing two locales at the *same* real file compiles fine.
 * The type stops a missing entry, not a wrong one.
 *
 * Both files must keep the same composition, because the layout crops from the
 * top: the wordmark sits in the middle band and the players in the lower half,
 * and only sky is spare.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const BANNERS: Record<Locale, number> = {
  nb: require("../../assets/app-banner-vertical-no.jpg"),
  en: require("../../assets/app-banner-vertical-en.jpg"),
};
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * The artwork's own aspect ratio, read from the file rather than hardcoded, so
 * a replacement of any shape drops straight in.
 */
function aspectOf(source: number): number {
  const meta = Image.resolveAssetSource(source) as { width?: number; height?: number } | null;
  if (!meta?.width || !meta?.height) return 1080 / 1935;
  return meta.width / meta.height;
}

/** How far the art dissolves into the page at its bottom edge, in points. */
const FADE_HEIGHT = 150;

function BottomFade() {
  return (
    <Svg
      width="100%"
      height={FADE_HEIGHT}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={styles.bottomFade}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="artFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.night} stopOpacity="0" />
          <Stop offset="0.6" stopColor={palette.night} stopOpacity="0.7" />
          <Stop offset="1" stopColor={palette.night} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#artFade)" />
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
  const [actionsHeight, setActionsHeight] = useState(0);

  const onActionsLayout = useCallback((event: LayoutChangeEvent) => {
    setActionsHeight(event.nativeEvent.layout.height);
  }, []);

  const banner = BANNERS[locale];

  return (
    <View style={styles.screen}>
      {/*
        The art is anchored to the *top of the controls*, not to the screen, and
        overflows off the top of the screen instead of the bottom.

        Letting it fill the whole screen put the three things that matter — the
        taker, the keeper and the pitch invader — in the bottom third, which is
        exactly where the buttons are. They live in the lower half of the
        composition, so the only spare material is sky, and that is what gets
        cropped. Measuring the controls rather than guessing an offset keeps this
        right on any screen size and for any replacement artwork.
      */}
      <View style={[styles.artLayer, { bottom: actionsHeight, aspectRatio: aspectOf(banner) }]}>
        <Image
          source={banner}
          style={styles.art}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${t.home.titleLine1} ${t.home.titleLine2}`}
        />
        <BottomFade />
      </View>

      <View style={styles.content}>
        <View style={styles.actions} onLayout={onActionsLayout}>
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
  // overflow hidden so the art can run off the top of the screen and be clipped.
  screen: { flex: 1, backgroundColor: palette.night, overflow: "hidden" },
  artLayer: { position: "absolute", left: 0, right: 0, width: "100%" },
  art: { width: "100%", height: "100%" },
  bottomFade: { position: "absolute", left: 0, right: 0, bottom: 0 },
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
