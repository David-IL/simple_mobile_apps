import type { KeeperId } from "../../game/types";

/**
 * How each keeper is drawn.
 *
 * This is presentation, so it lives in the art layer rather than in
 * `keepers.ts` — that file is the parameter set the engine reads, and it should
 * stay free of anything the player merely looks at. Same principle as ADR 10
 * moving copy out of the domain, applied to pixels.
 *
 * Build is not decoration: it should *say* what the parameters do. The Wall is
 * genuinely the widest figure on the roster because `reach` is his mechanic, so
 * a player who has never read a blurb can still see what he is up against.
 * Squad numbers rather than initials, because that is what is on a real shirt —
 * and a number reads the same in every language.
 */

export type Hair = "full" | "thin" | "bald" | "grey" | "wild";
export type Beard = "none" | "dark" | "grey";
export type Brow = "neutral" | "narrow" | "raised";
export type Mouth = "flat" | "open" | "grin";

export type KeeperLooks = {
  shirt: string;
  shirtTrim: string;
  squadNumber: number;
  /** Horizontal scale of torso, shorts and limbs. 1 is average. */
  girth: number;
  /** Overall height scale, measured from the feet so they stay on the line. */
  stature: number;
  hair: Hair;
  beard: Beard;
  brow: Brow;
  mouth: Mouth;
  /**
   * How the tell reads. "lean" is the default subtle shift; "point" throws
   * one arm out toward the tell side and leaves the other alone, for the one
   * keeper whose blurb specifically claims a pointing gesture rather than
   * just "shows you a bit".
   */
  tellStyle: "lean" | "point";
  /**
   * Restless idle movement while the player aims — independent of the tell,
   * which most of the roster has nothing to do while waiting for. Only the
   * keeper whose blurb is built entirely around constant motion gets this;
   * everyone else stands as still as their tell allows.
   */
  fidgets: boolean;
};

export const KEEPER_LOOKS: Record<KeeperId, KeeperLooks> = {
  sunday: {
    shirt: "#84cc16",
    shirtTrim: "#4d7c0f",
    squadNumber: 30,
    girth: 1.02,
    stature: 0.94,
    hair: "wild",
    beard: "dark",
    brow: "raised",
    mouth: "open",
    tellStyle: "lean",
    fidgets: false,
  },
  statue: {
    shirt: "#64748b",
    shirtTrim: "#334155",
    squadNumber: 13,
    girth: 1.18,
    stature: 1.06,
    hair: "bald",
    beard: "none",
    brow: "neutral",
    mouth: "flat",
    tellStyle: "lean",
    fidgets: false,
  },
  chatterbox: {
    shirt: "#f59e0b",
    shirtTrim: "#b45309",
    squadNumber: 12,
    girth: 0.96,
    stature: 1,
    hair: "full",
    beard: "none",
    brow: "raised",
    // Permanently mid-sentence.
    mouth: "open",
    tellStyle: "lean",
    fidgets: false,
  },
  "line-dancer": {
    shirt: "#ec4899",
    shirtTrim: "#9d174d",
    squadNumber: 24,
    girth: 0.86,
    stature: 1.03,
    hair: "wild",
    beard: "none",
    brow: "raised",
    mouth: "grin",
    tellStyle: "lean",
    // "Jigs about so much you cannot read him" was previously only true of
    // his (absent) tell — he stood as still as anyone while you aimed. This
    // is the actual jigging: a small continuous hop, aiming-phase only.
    fidgets: true,
  },
  showboat: {
    shirt: "#a855f7",
    shirtTrim: "#6b21a8",
    // The number a showboat would demand.
    squadNumber: 7,
    girth: 0.97,
    stature: 1.04,
    hair: "full",
    beard: "none",
    brow: "raised",
    mouth: "grin",
    // "Points at the corner he's going to save" — the roster's only literal
    // pointing claim, so he's the only one who gets an actual pointing arm
    // instead of the generic lean everyone else's tell uses.
    tellStyle: "point",
    fidgets: false,
  },
  veteran: {
    shirt: "#0ea5e9",
    shirtTrim: "#075985",
    // The keeper's number, and he has earned it.
    squadNumber: 1,
    girth: 1.06,
    stature: 0.97,
    hair: "grey",
    beard: "grey",
    brow: "neutral",
    mouth: "flat",
    tellStyle: "lean",
    fidgets: false,
  },
  wall: {
    shirt: "#ef4444",
    shirtTrim: "#991b1b",
    squadNumber: 33,
    // Widest on the roster on purpose — reach 0.65 is the highest too.
    girth: 1.34,
    stature: 1.12,
    hair: "thin",
    beard: "dark",
    brow: "narrow",
    mouth: "flat",
    tellStyle: "lean",
    fidgets: false,
  },
  "mind-reader": {
    shirt: "#1e293b",
    shirtTrim: "#0f172a",
    squadNumber: 88,
    girth: 0.93,
    stature: 1,
    hair: "bald",
    beard: "none",
    // Narrowed eyes. He has seen your last four shots.
    brow: "narrow",
    mouth: "flat",
    tellStyle: "lean",
    fidgets: false,
  },
};

export function looksFor(id: KeeperId): KeeperLooks {
  return KEEPER_LOOKS[id];
}
