import { Pressable, StyleSheet, Text } from "react-native";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Background colour. Defaults to the neutral blue a new app starts with.
   *
   * Colour is a prop rather than baked in because branding belongs to the app,
   * not to the shared library — an app with an amber identity should not have to
   * fork this component to get an amber button, and the next app should not
   * inherit that amber.
   */
  color?: string;
  /** Label colour. Defaults to white; pass a dark ink for light backgrounds. */
  labelColor?: string;
};

const DEFAULT_COLOR = "#2563eb";
const DEFAULT_LABEL_COLOR = "#ffffff";

export function Button({
  label,
  onPress,
  disabled = false,
  color = DEFAULT_COLOR,
  labelColor = DEFAULT_LABEL_COLOR,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: color },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? DEFAULT_LABEL_COLOR : labelColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: "#94a3b8" },
  label: { fontSize: 16, fontWeight: "600" },
});
