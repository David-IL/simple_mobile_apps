import { Platform, StyleSheet, Text, View } from "react-native";
import type { RoundSetup } from "../game/types";
import { useI18n } from "../i18n";
import { spacing } from "../theme";

/**
 * Same free Android "casual" face the keeper's taunt bubble uses — one comic
 * font for every piece of in-scene lettering, rather than a second one
 * invented just for this. Falls back to the platform default elsewhere.
 */
const DISRUPTION_FONT = Platform.select({ android: "casual", default: undefined });

/**
 * Always visible, always *before* the run-up — the player has to be able to
 * tell what's different this round before committing to a shot, or a comedic
 * disruption reads as a cheat instead of a puzzle.
 *
 * "Tell" no longer means "read a sentence." Playtest 1 found the pitch
 * invader's effect was legible only in text, and "the text was a paragraph
 * two children were not going to read mid-game" — while the disruptions that
 * *did* land (the sun, the mud, the away-end chant) all had a visible tell in
 * the scene itself. The fix that actually worked, confirmed unprompted in
 * playtest 2 ("the muddy field looks much better now"), was making the effect
 * visible in the picture — not writing a better paragraph about it.
 *
 * So the picture carries the telegraph now (wind sock, invader, mud, glare,
 * crowd), and this banner's job shrinks to the one thing that still can't be
 * read off the scene at a glance: naming what round this is, big enough to
 * register before the run-up. The full sentence still exists — see `detail`
 * below — for a screen-reader user who cannot see the pitch at all.
 */
export function DisruptionBanner({ setup }: { setup: RoundSetup }) {
  const { t } = useI18n();
  const { disruption, effect } = setup;

  if (!disruption) {
    // Silent now, not just quieter — a calm round used to say so in words
    // every single time, which is exactly the kind of text this component
    // exists to cut. The absence of a banner *is* the signal. Kept as an
    // accessible-only landmark rather than nothing at all, so a
    // screen-reader user still hears that the round is clear.
    //
    // It still occupies the same height as a banner, though. Returning an
    // empty view made this component 58px tall on a disruption round and 0px
    // on a calm one, and the pitch below is `flex: 1` — so every round that
    // changed disruption state resized the pitch, and tapping to continue
    // made the whole field visibly jump. Holding the space keeps the absence
    // as the signal without moving anything.
    return (
      <View
        style={[styles.wrap, styles.calm]}
        accessible
        accessibilityLabel={`${t.match.calmName}. ${t.match.calmBrief}`}
      />
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
    <View
      style={[styles.wrap, styles.active]}
      accessible
      accessibilityLabel={`${copy.name}. ${detail}`}
    >
      <Text style={styles.activeName}>{copy.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 58,
    justifyContent: "center",
  },
  /** Same footprint as a banner, drawing nothing. See the note above. */
  calm: { borderBottomColor: "transparent" },
  active: {
    alignItems: "center",
    backgroundColor: "#2a1f0b",
    borderBottomColor: "#4a3410",
  },
  activeName: {
    color: "#fbbf24",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: DISRUPTION_FONT,
    textAlign: "center",
  },
});
