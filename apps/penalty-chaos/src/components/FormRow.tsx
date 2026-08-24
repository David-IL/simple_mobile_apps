import { StyleSheet, View } from "react-native";
import { FORM_SHOWN, recentForm, type KeeperTally } from "../state/keeperRecord";
import { outcomeColour, palette } from "../theme";

/**
 * The last few shots against one keeper, oldest on the left.
 *
 * A form guide rather than a career average on purpose. A lifetime save
 * percentage stops moving once enough shots are in — after a hundred, one more
 * goal shifts it half a point — so the number gets *less* interesting the more
 * the game is played. Five dots change every single match, and "how have the
 * last few gone" is already how the keepers get talked about out loud.
 *
 * Unplayed slots are drawn as empty rings rather than omitted, so the row does
 * not change width as a rivalry builds up and shove the text beside it around.
 *
 * See docs/design/penalty-chaos-stickiness.md.
 */

type Props = { tally: KeeperTally; dot?: number };

export function FormRow({ tally, dot = 9 }: Props) {
  const form = recentForm(tally);
  const blanks = Math.max(0, FORM_SHOWN - form.length);

  return (
    <View style={styles.row} accessibilityRole="image">
      {Array.from({ length: blanks }, (_, index) => (
        <View
          key={`blank-${index}`}
          style={[
            styles.dot,
            { width: dot, height: dot, borderRadius: dot / 2, borderColor: palette.line },
          ]}
        />
      ))}
      {form.map((kind, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              borderColor: outcomeColour[kind],
              backgroundColor: outcomeColour[kind],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { borderWidth: 1.5 },
});
