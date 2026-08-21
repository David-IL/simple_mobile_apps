import { StyleSheet } from "react-native";

export const palette = {
  night: "#0b1220",
  nightSoft: "#131c2e",
  line: "#24314c",
  grass: "#1f6f43",
  grassDark: "#195c38",
  chalk: "#f8fafc",
  chalkDim: "#94a3b8",
  ball: "#ffffff",
  goal: "#22c55e",
  save: "#f97316",
  miss: "#ef4444",
  accent: "#38bdf8",
  accentDim: "#0ea5e9",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const text = StyleSheet.create({
  title: {
    color: palette.chalk,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heading: {
    color: palette.chalk,
    fontSize: 20,
    fontWeight: "700",
  },
  body: {
    color: palette.chalk,
    fontSize: 15,
  },
  muted: {
    color: palette.chalkDim,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: palette.chalkDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});

export const outcomeColour = {
  goal: palette.goal,
  saved: palette.save,
  missed: palette.miss,
  blocked: palette.save,
} as const;
