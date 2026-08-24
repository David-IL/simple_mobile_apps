import { StyleSheet, Text, View } from "react-native";
import type { Player } from "../game/match";

/**
 * A shooter's identity badge: initials in a colour, everywhere a player's
 * name is shown.
 *
 * Deliberately not a posable character like `KeeperFigure` — that mechanic
 * is proven for the keeper (renaming produced real "ownership" in playtest,
 * see docs/adr/0009 and testing/2026-08-22-day-two.md) but a shooter avatar
 * is untested. This is the cheap version, same move ADR 9 describes the
 * keeper itself having made first: initials on a coloured shape, and only
 * worth becoming an illustrated figure if that turns out to matter.
 *
 * Colour is fixed per player slot, not derived from the name. It used to be
 * a hash of the typed name, which had two real problems rather than one:
 * it recomputed on every keystroke (the badge visibly changed colour while
 * still typing), and it was reported, correctly, as "random" — a name could
 * land on a colour the player never chose and might actively dislike. A
 * fixed pair sidesteps both without a colour-picker UI: nothing to compute,
 * nothing to land on badly, player 1 (and the solo taker, always slot 0) is
 * always teal and player 2 is always purple.
 */
const SLOT_COLOURS: Record<Player, string> = {
  0: "#14b8a6",
  1: "#a855f7",
};

function initialsFor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? (words[1]?.[0] ?? "") : (words[0]?.[1] ?? "");
  return (first + second).toUpperCase();
}

export function PlayerBadge({ name, player, size = 28 }: { name: string; player: Player; size?: number }) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: SLOT_COLOURS[player] },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.42 }]} numberOfLines={1}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
  initials: { color: "#1c1207", fontWeight: "800" },
});
