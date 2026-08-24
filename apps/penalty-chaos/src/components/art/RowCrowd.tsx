import { Animated } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import type { CrowdBank } from "./rowScenes";

/**
 * A bank of supporters doing the row, standing on whatever the backdrop shows.
 *
 * **There is deliberately no drummer figure.** A drummer leading the Viking row
 * is not a generic archetype — it is a role one identifiable person occupies in
 * public consciousness, which is precisely why
 * [viking-row.md](../../../../../docs/research/viking-row.md) ruled the idea out
 * as a standalone app and why
 * [ADR 8](../../../../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md)
 * would rule out drawing one here. The crowd *is* the joke; the drum is a sound,
 * not a character. Do not add a figure with sticks.
 *
 * **What the shirts may and may not be.** Red with a simplified flag stripe:
 * national colours, which are nobody's property. Not a national-team kit
 * replica, no federation crest or lion, no sponsor, no squad numbers — those
 * are the things ADR 8 actually forbids.
 *
 * ## The wedge
 *
 * Rows narrow toward the back, following `bank.spread`. Both street scenes
 * recede to a vanishing point, so their surface is a wedge and a crowd of
 * constant width put its back rows on the pavement and into shop fronts. How
 * many people are in a row falls out of how wide that row is and how big its
 * figures are, rather than being a number of its own — so a narrow far row is
 * sparse and a wide near one is packed, which is what perspective does anyway.
 *
 * ## No ground of its own
 *
 * There used to be a dark gradient panel behind the supporters. The backdrop
 * supplies the road, the cobbles or the seats; a slab of navy floating over them
 * announced that the crowd was pasted on.
 *
 * ## Why nothing rotates
 *
 * The first version rotated the whole stand as one group about a single origin,
 * and it read exactly as the playtest said: a stick tipping up and down. Fans
 * near the pivot barely moved while fans at the edges swung through a huge arc.
 *
 * There is no rotation anywhere now. The lean comes from **heads moving further
 * than bodies** — a puppeteer's trick — so every supporter pulls on the spot.
 * Two animated groups per row, all driven by one `Animated.Value`; animating
 * each supporter would be dozens of nodes crossing the bridge every frame,
 * which is not a bill worth paying for a celebration.
 */

const AnimatedG = Animated.createAnimatedComponent(G);

const VIEW_W = 300;
const ROW_GAP = 24;
const TOP_PAD = 26;
const BOTTOM_PAD = 24;
/** Shoulder-to-shoulder spacing for a figure drawn at scale 1. */
const SHOULDER = 13;
/**
 * Ceiling on how many people a single row may hold.
 *
 * Density is derived from row width divided by figure size, which is right
 * until the figures get small: the stadium upper tier asked for 47 across, and
 * the two banks together came to 265 people — over 1300 SVG nodes for a
 * twenty-second celebration. A stand reads as full long before that.
 */
const MAX_PER_ROW = 18;
/** Below this, a figure is a few pixels tall and its detail is wasted. */
const DETAIL_SCALE = 0.8;

const RED = "#ba0c2f";
const WHITE = "#eef2f6";
const BLUE = "#00205b";
const SKIN = ["#e8b48c", "#c98a5f", "#f0c9a6", "#a96f45"] as const;

export function bankViewHeight(bank: CrowdBank): number {
  return (TOP_PAD + (bank.rows - 1) * ROW_GAP + BOTTOM_PAD) * bank.scale;
}

type PlacedRow = {
  y: number;
  scale: number;
  xs: number[];
  opacity: number;
  pull: number;
};

function placeRows(bank: CrowdBank): PlacedRow[] {
  const [back, front] = bank.spread;

  return Array.from({ length: bank.rows }, (_, index) => {
    const depth = bank.rows === 1 ? 1 : index / (bank.rows - 1);
    const figure = (0.72 + depth * 0.4) * bank.scale;
    const span = (VIEW_W - 16) * (back + (front - back) * depth);
    const left = (VIEW_W - span) / 2;

    // Density from geometry: how many shoulders fit across this row.
    const count = Math.min(MAX_PER_ROW, Math.max(3, Math.round(span / (SHOULDER * figure)) + 1));
    const step = count > 1 ? span / (count - 1) : 0;
    // Alternate rows nudge sideways so columns do not line up into a grid.
    const nudge = index % 2 === 0 ? 0 : step / 3;

    return {
      y: (TOP_PAD + index * ROW_GAP) * bank.scale,
      scale: figure,
      xs: Array.from({ length: count }, (_, i) => left + i * step + nudge),
      opacity: 0.5 + depth * 0.5,
      pull: 0.5 + depth * 0.5,
    };
  });
}

/**
 * Torso, arms out on the oar, and a flag stripe. No crest, no number.
 *
 * Distant figures collapse to a single ellipse. The arm and the two stripe
 * rects are three of the five nodes a supporter costs, and none of them are
 * legible at a few pixels tall — paying for them across a whole back tier is
 * waste.
 */
function Body({ x, y, scale }: { x: number; y: number; scale: number }) {
  if (scale < DETAIL_SCALE) {
    return <Ellipse cx={x} cy={y} rx={6 * scale} ry={7.4 * scale} fill={RED} />;
  }
  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      <Path d="M -7 -6 L 9 -9" stroke={RED} strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <Ellipse cx={0} cy={0} rx={6} ry={7.4} fill={RED} />
      <Rect x={-1.9} y={-6.4} width={3.8} height={12.8} fill={WHITE} />
      <Rect x={-0.8} y={-6.4} width={1.6} height={12.8} fill={BLUE} />
    </G>
  );
}

function Head({ x, y, scale, seed }: { x: number; y: number; scale: number; seed: number }) {
  return <Circle cx={x} cy={y - 11 * scale} r={3.9 * scale} fill={SKIN[seed % SKIN.length]} />;
}

type Props = {
  /** 0 = upright between strokes, 1 = pulled all the way back on the stroke. */
  lean: Animated.Value;
  bank: CrowdBank;
  width: number;
};

export function RowCrowd({ lean, bank, width }: Props) {
  const rows = placeRows(bank);
  const height = bankViewHeight(bank);

  return (
    <Svg width={width} height={(width * height) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${height}`}>
      {rows.map((row, rowIndex) => {
        // Heads travel about three times as far as torsos. That difference is
        // the entire lean — see the note at the top about why nothing rotates.
        const bodyShift = lean.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2.4 * row.pull * bank.scale],
        });
        const headShift = lean.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 7.2 * row.pull * bank.scale],
        });

        return (
          <G key={row.y} opacity={row.opacity}>
            <AnimatedG translateY={bodyShift}>
              {row.xs.map((x) => (
                <Body key={x} x={x} y={row.y} scale={row.scale} />
              ))}
            </AnimatedG>
            <AnimatedG translateY={headShift}>
              {row.xs.map((x, i) => (
                <Head key={x} x={x} y={row.y} scale={row.scale} seed={rowIndex * 7 + i} />
              ))}
            </AnimatedG>
          </G>
        );
      })}
    </Svg>
  );
}
