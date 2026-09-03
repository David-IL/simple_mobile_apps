import { useCallback, useState } from "react";
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
import { FormRow } from "../components/FormRow";
import { ChevronRight, FLAGS, SoundIcon } from "../components/Icons";
import { KeeperFigure } from "../components/art/KeeperFigure";
import { looksFor } from "../components/art/keeperLooks";
import type { MatchMode } from "../game/match";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { en } from "../i18n/en";
import { nb } from "../i18n/nb";
import { displayName, useKeeperNames } from "../state/keeperNames";
import {
  recentForm,
  recentScored,
  savePercent,
  tallyFor,
  useKeeperRecord,
} from "../state/keeperRecord";
import type { LastMatch } from "../state/lastMatch";
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

/**
 * The last opponent, his face, and one tap back into a match against him.
 *
 * This is the app opening onto a rivalry instead of onto a menu. Playtesting
 * found the keepers get talked about by name and across sessions, and yet the
 * setup screen reset to the first keeper in the roster on every launch — so the
 * app forgot the only thing the player was keeping track of.
 *
 * It also *shortens* the way to the ball: rematch skips setup entirely, one tap
 * instead of two, which is the constraint this screen is under.
 *
 * **The whole card is the button.** The first version had a caption row above it
 * and a full-width button below it — three stacked bands for one action — and it
 * cost enough height to shove the banner artwork up off its own wordmark. A
 * portrait, a name and a pill in one row say the same thing in half the space.
 *
 * The name shown is the player's own, not the shipped one — as on setup, the
 * scoreboard and the result screen. Every screen is his own phone, and the
 * custom name is the entire point of the feature. ADR 8's shipped-name rule
 * binds content that *leaves* the device, so the consequence here is a
 * store-listing rule rather than a code one — do not screenshot this screen
 * with a custom keeper name set.
 */
function RematchCard({ last, onPress }: { last: LastMatch; onPress: () => void }) {
  const { t } = useI18n();
  const { names } = useKeeperNames();
  const { record } = useKeeperRecord();

  const tally = tallyFor(record, last.keeperId);
  const name = displayName(last.keeperId, names, t.keepers[last.keeperId].name);
  // Not `tally.faced`: a record migrated from before form existed keeps its
  // career counters and starts `recent` empty, and sizing the line off the
  // career count reported "0 of your last 5" for a keeper with a long history.
  // See the note in SetupScreen.
  const form = recentForm(tally);
  const save = savePercent(tally);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.home.rematch}: ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.portrait}>
        <KeeperFigure height={50} looks={looksFor(last.keeperId)} pose="ready" direction={0} />
      </View>

      <View style={styles.cardCopy}>
        <Text style={styles.cardName} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.formLine}>
          {form.length > 0 ? <FormRow tally={tally} dot={8} /> : null}
          <Text style={text.muted} numberOfLines={1}>
            {save === null
              ? t.setup.neverFaced
              : form.length > 0
                ? t.form.recent(recentScored(tally), form.length)
                : t.setup.savePercent(save)}
          </Text>
        </View>
        <Text style={styles.cardMode} numberOfLines={1}>
          {last.mode === "duel" ? t.setup.modeDuel : t.setup.modeSolo}
        </Text>
      </View>

      <View style={styles.pill}>
        <Text style={styles.pillLabel}>{t.home.rematch}</Text>
        <ChevronRight height={10} colour={palette.brandInk} />
      </View>
    </Pressable>
  );
}

type Props = {
  onPick: (mode: MatchMode) => void;
  /** Null on a first run, and until storage has been read. */
  last: LastMatch | null;
  onRematch: (last: LastMatch) => void;
};

export function HomeScreen({ onPick, last, onRematch }: Props) {
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

        What it measures is deliberately narrow: the *buttons* block, and not the
        rematch card above it. Anything included here moves the picture, and the
        first version of the card was included — which dragged the artwork up far
        enough to crop its own wordmark off the top. The card now floats over the
        faded bottom of the image instead, so the banner lands in exactly the same
        place with a last opponent or without one.
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
        {/*
          The card sits *outside* the measured block on purpose.

          The artwork is anchored to the top of `actions` and overflows off the
          top of the screen, so anything that makes that block taller drags the
          picture up and crops its own wordmark away. Measuring only the buttons
          leaves the anchor fixed and lets the card float over the bottom of the
          art — the faded, near-solid part of it — so the banner sits in exactly
          the same place whether or not there is a last opponent.
        */}
        {last ? (
          <View style={styles.cardSlot}>
            <RematchCard last={last} onPress={() => onRematch(last)} />
          </View>
        ) : null}

        <View style={styles.actions} onLayout={onActionsLayout}>
          {/*
            Amber is always the primary action, so the two mode buttons step
            down a rank when the card is present rather than competing with it.
          */}
          <Button
            label={t.home.solo}
            onPress={() => onPick("solo")}
            color={last ? palette.brandDeep : palette.brand}
            labelColor={last ? palette.chalk : palette.brandInk}
          />
          <Button
            label={t.home.duel}
            onPress={() => onPick("duel")}
            color={last ? palette.line : palette.brandDeep}
            labelColor={palette.chalk}
          />

          {/*
            Two labelled rows of word-chips became one row of pictures. The
            labels were the expensive part and the least informative: a speaker
            with a cross through it, and a flag, are both faster to read than
            "Sound / Off" — and they stay readable to someone who cannot read
            the language currently selected, which was the original argument for
            showing language names in their own language. That property survives
            as the accessible name.
          */}
          <View style={styles.settings}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !muted }}
              accessibilityLabel={`${t.home.sound}: ${muted ? t.home.off : t.home.on}`}
              onPress={() => setMuted(!muted)}
              style={[styles.iconButton, !muted && styles.iconButtonOn]}
            >
              <SoundIcon height={17} muted={muted} />
            </Pressable>

            <View style={styles.flags} accessibilityLabel={t.home.language}>
              {LOCALES.map((option) => {
                const Flag = FLAGS[option];
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: option === locale }}
                    accessibilityLabel={LANGUAGE_NAMES[option]}
                    onPress={() => setLocale(option)}
                    style={[styles.iconButton, option === locale && styles.iconButtonOn]}
                  >
                    <Flag height={15} />
                  </Pressable>
                );
              })}
            </View>
          </View>

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
  cardSlot: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    // Nearly opaque: this sits on top of the artwork, and the keeper's name has
    // to stay readable over whatever happens to be behind it.
    backgroundColor: "rgba(30,24,41,0.94)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.brandDeep,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cardPressed: { opacity: 0.85 },
  portrait: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 10,
    backgroundColor: palette.night,
    overflow: "hidden",
  },
  cardCopy: { flex: 1, gap: 2 },
  cardName: { color: palette.chalk, fontSize: 18, fontWeight: "800" },
  cardMode: { ...text.muted, fontSize: 11 },
  formLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: palette.brand,
    borderRadius: 999,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: 7,
  },
  pillLabel: { color: palette.brandInk, fontSize: 13, fontWeight: "800" },
  settings: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  flags: { flexDirection: "row", gap: spacing.xs },
  iconButton: {
    width: 44,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(20,16,28,0.55)",
  },
  iconButtonOn: { borderColor: palette.brand, backgroundColor: palette.brandWash },
  footnote: { ...text.muted, textAlign: "center" },
});
