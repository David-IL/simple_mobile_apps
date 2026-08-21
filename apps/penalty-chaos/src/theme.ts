import { StyleSheet } from "react-native";

/**
 * Colour is split three ways on purpose, and the split is the important part.
 *
 * - **Surfaces** are dark and only mildly warm. The banner is a sunset, but a
 *   genuinely warm background would muddy the pitch green and cost contrast on
 *   the outcome colours, which have to stay unmistakable.
 * - **Outcome** colours are semantic traffic-light and never brand-coloured.
 * - **Brand** is the banner's amber, and it is chrome only: buttons, selection,
 *   whose turn it is.
 * - **Aim** is its own token, deliberately cool, and must never be brand.
 */
export const palette = {
  night: "#14101c",
  nightSoft: "#1e1829",
  line: "#372c47",

  grass: "#1f6f43",
  grassDark: "#195c38",

  chalk: "#f8fafc",
  chalkDim: "#a79bb3",
  ball: "#ffffff",

  goal: "#22c55e",
  save: "#f97316",
  miss: "#ef4444",

  /** The banner wordmark's amber. Chrome only — never a gameplay signal. */
  brand: "#f59e0b",
  brandDeep: "#d97706",
  /** Near-black, for text sitting on brand. Far better contrast than white. */
  brandInk: "#1c1207",
  /** A dim brand wash for selected surfaces. */
  brandWash: "#33240d",

  /**
   * The aim indicator, and nothing else.
   *
   * Kept cool deliberately. It is the one thing on the pitch a player has to
   * find instantly, and it already competes with an orange wind sock, an orange
   * "saved" colour and a yellow pitch invader. It reads because nothing else on
   * the pitch is blue. Theming it to match the banner would cost the most
   * important affordance in the game to gain nothing.
   */
  aim: "#38bdf8",
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
