/**
 * The three places the row can happen, and where the crowd stands in each.
 *
 * Shared so the backdrop and the supporters cannot disagree about which scene
 * is playing — picking independently in two components would eventually put a
 * street crowd in a stadium.
 */

export const ROW_SCENES = ["square", "palace", "stadium"] as const;
export type RowScene = (typeof ROW_SCENES)[number];

/* eslint-disable @typescript-eslint/no-require-imports */
export const SCENE_VIDEO: Record<RowScene, number> = {
  square: require("../../../assets/row-bg-square.mp4"),
  palace: require("../../../assets/row-bg-palace.mp4"),
  stadium: require("../../../assets/row-bg-stadium.mp4"),
};
/**
 * Frame one of each clip, shown while the player warms up. See RowBackground.
 */
export const SCENE_POSTER: Record<RowScene, number> = {
  square: require("../../../assets/row-bg-square.jpg"),
  palace: require("../../../assets/row-bg-palace.jpg"),
  stadium: require("../../../assets/row-bg-stadium.jpg"),
};
/* eslint-enable @typescript-eslint/no-require-imports */

export type CrowdBank = {
  /**
   * Where the front row's feet land, as a fraction of screen height.
   *
   * Measured off the clips with a 10% grid rather than guessed.
   */
  feet: number;
  rows: number;
  /**
   * Size multiplier on the figures, which also stretches the gap between rows —
   * bigger people stand further apart, so the whole bank grows together.
   */
  scale: number;
  /**
   * How much of the width the back row and the front row occupy, 0..1.
   *
   * **This is what keeps the crowd on the road.** Both streets recede to a
   * vanishing point, so the surface is a wedge: nearly full width at the bottom
   * of the frame, a fraction of it near the horizon. A crowd drawn at constant
   * width had its back rows standing on the buildings. Seating has no wedge, so
   * the stadium's two numbers are nearly equal.
   */
  spread: readonly [back: number, front: number];
};

/**
 * A note on why fractions of *screen* height work at all.
 *
 * The clips are 9:16 and the video is drawn with `contentFit="cover"`. The app
 * is portrait-locked and every phone is taller than 9:16, so cover scales to
 * match height and crops the sides — the full vertical composition is always on
 * screen, and a fraction of the video's height is the same fraction of the
 * screen's. On a squat display (a tablet nearer 3:4) it would crop vertically
 * instead and these would drift; Android phones are the target, so that is
 * noted rather than handled.
 */
export const SCENE_LAYOUT: Record<RowScene, readonly CrowdBank[]> = {
  // Road from about 0.66 down, roughly half the width up at the far end. The
  // skyscrapers are what make the people look small, so no size boost here.
  square: [{ feet: 0.95, rows: 5, scale: 1, spread: [0.5, 0.96] }],
  // The avenue is narrower and its buildings are closer, so the same figures
  // read as too small — hence the larger scale — and the wedge is tighter:
  // barely a third of the width where the cobbles meet the palace.
  palace: [{ feet: 0.95, rows: 5, scale: 1.25, spread: [0.34, 0.96] }],
  // Two banks, because a tier of seats with nobody in it above a packed one
  // looks like the ground half-emptied. The upper bank is smaller and dimmer:
  // it is further away, and it must not compete with the RO button.
  stadium: [
    { feet: 0.88, rows: 6, scale: 1, spread: [0.94, 1] },
    { feet: 0.45, rows: 3, scale: 0.6, spread: [0.9, 0.96] },
  ],
};

export function pickScene(random: () => number = Math.random): RowScene {
  return ROW_SCENES[Math.floor(random() * ROW_SCENES.length)] ?? "stadium";
}
