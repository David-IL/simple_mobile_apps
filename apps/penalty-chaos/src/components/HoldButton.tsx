import { useCallback, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { palette, spacing } from "../theme";

/**
 * A button you have to hold down.
 *
 * This exists to break a false trade-off. "Gi opp" was tiny and easy to miss,
 * and the reason it was tiny was to stop it being pressed by accident — so
 * making it discoverable would have made it dangerous, and making it safe kept
 * it hidden.
 *
 * Holding separates the two. Activation needs sustained, deliberate intent, so
 * the control itself can be as large and obvious as anything else on screen.
 * It also teaches itself: the first press starts the bar filling and releasing
 * resets it, which explains the rule without a word of instruction — the same
 * principle as replacing the shooting hint with a demonstration.
 *
 * No confirmation dialog on purpose. A dialog is more reading, in a game whose
 * players include someone who would rather not read anything.
 */
const HOLD_MS = 800;

type Props = {
  label: string;
  onHoldComplete: () => void;
  accessibilityHint?: string;
};

export function HoldButton({ label, onHoldComplete, accessibilityHint }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    animation.current?.stop();
    progress.setValue(0);
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.current.start(({ finished }) => {
      if (finished) onHoldComplete();
    });
  }, [progress, onHoldComplete]);

  const cancel = useCallback(() => {
    animation.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={styles.wrap}
    >
      <View style={styles.fillClip}>
        {/* scaleX rather than width so this can run on the native driver. */}
        <Animated.View
          style={[
            styles.fill,
            { transform: [{ scaleX: progress }] },
          ]}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    minWidth: 132,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fillClip: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  fill: {
    width: "100%",
    height: "100%",
    backgroundColor: palette.miss,
    opacity: 0.55,
    transformOrigin: "left center",
  },
  label: { color: palette.chalk, fontSize: 13, fontWeight: "600" },
});
