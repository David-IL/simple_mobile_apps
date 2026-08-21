import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";
import type { KeeperPose } from "../../game/types";
import type { Beard, Brow, Hair, KeeperLooks, Mouth } from "./keeperLooks";

/**
 * The keeper, drawn as flat vector shapes.
 *
 * SVG rather than a canvas on purpose: ADR 7 says reach for Skia only when a
 * canvas is genuinely needed, and nothing here needs one. This is a handful of
 * primitives whose angles are driven by `pose` and whose proportions come from
 * `looks`, with all *movement* handled by the caller's `Animated` transforms.
 * Nothing in this file animates itself.
 */

export type Direction = -1 | 0 | 1;

type Props = {
  /**
   * Height in points. Width is derived, not passed — the canvas has to be a
   * fixed shape and letting a caller choose it is how the figure ends up
   * squashed or clipped.
   */
  height: number;
  looks: KeeperLooks;
  pose: KeeperPose;
  /** Which way the pose leans or dives. 0 stays central. */
  direction: Direction;
};

/**
 * The canvas, sized for the pose that needs the most room rather than for the
 * figure standing still.
 *
 * A diving keeper rotates 62° about his hips, which throws his head out to
 * x≈79 and his trailing glove to x≈-19 — both well outside the 0–60 box this
 * used to have, so on every dive to a side the head and one hand were silently
 * cut off at the edge of the SVG. It looked like the goal was drawn over him.
 *
 * `-22 0 104 96` spans -22..82, whose midpoint is 30 — the figure's own centre
 * line. That means a caller can still position it by centring the box, and the
 * extra width is pure headroom that costs nothing but layout space.
 */
const VIEW_BOX = "-22 0 104 96";
const VIEW_BOX_WIDTH = 104;
const VIEW_BOX_HEIGHT = 96;

/** Box width for a given height. Exported so callers can reserve the space. */
export function keeperBoxWidth(height: number): number {
  return (height * VIEW_BOX_WIDTH) / VIEW_BOX_HEIGHT;
}

const SKIN = "#d9a074";
const SKIN_SHADE = "#c08a5e";
const SHORTS = "#1e293b";
const SOCKS = "#0f172a";
const GLOVE = "#f8fafc";
const DARK_HAIR = "#3f2d20";
const GREY_HAIR = "#cbd5e1";

/** Arm angles in degrees, measured from straight down, per pose. */
function armAngles(pose: KeeperPose, direction: Direction): [number, number] {
  switch (pose) {
    case "ready":
      return [-38, 38];
    case "lean":
      // Both arms shift toward the side he is favouring — that is the tell.
      return [-38 + direction * 22, 38 + direction * 22];
    case "dive":
      return [-78, 78];
    case "beaten":
      return [-142, 142];
    case "celebrate":
      return [-158, 158];
  }
}

function bodyRotation(pose: KeeperPose, direction: Direction): number {
  switch (pose) {
    case "lean":
      return direction * 11;
    case "dive":
      // A centre "dive" is really a stand-tall, so it barely rotates.
      return direction === 0 ? -4 : direction * 62;
    case "beaten":
      return direction * 6;
    default:
      return 0;
  }
}

function HairPiece({ hair }: { hair: Hair }) {
  switch (hair) {
    case "full":
      return <Ellipse cx={30} cy={9} rx={11.2} ry={6.2} fill={DARK_HAIR} />;
    case "grey":
      return <Ellipse cx={30} cy={9} rx={11.2} ry={6.2} fill={GREY_HAIR} />;
    case "thin":
      return <Ellipse cx={30} cy={8} rx={9} ry={3.6} fill={DARK_HAIR} opacity={0.85} />;
    case "wild":
      return (
        <G fill={DARK_HAIR}>
          <Ellipse cx={30} cy={9} rx={11.5} ry={6.4} />
          <Circle cx={19} cy={12} r={4.2} />
          <Circle cx={41} cy={12} r={4.2} />
        </G>
      );
    case "bald":
      return <Ellipse cx={26} cy={11} rx={4} ry={2.4} fill="#ffffff" opacity={0.16} />;
  }
}

function BeardPiece({ beard }: { beard: Beard }) {
  if (beard === "none") return null;
  return (
    <Path
      d="M20 18 Q 21 29, 30 29 Q 39 29, 40 18 Q 36 25, 30 25 Q 24 25, 20 18 Z"
      fill={beard === "grey" ? GREY_HAIR : DARK_HAIR}
    />
  );
}

function BrowPiece({ brow }: { brow: Brow }) {
  const tilt = brow === "narrow" ? 12 : brow === "raised" ? -10 : 0;
  return (
    <G fill="#2b1d12">
      <Rect x={22.4} y={12.6} width={6.2} height={1.7} rx={0.85} transform={`rotate(${tilt} 25.5 13.4)`} />
      <Rect x={31.4} y={12.6} width={6.2} height={1.7} rx={0.85} transform={`rotate(${-tilt} 34.5 13.4)`} />
    </G>
  );
}

function MouthPiece({ mouth }: { mouth: Mouth }) {
  switch (mouth) {
    case "open":
      return <Ellipse cx={30} cy={22.4} rx={3.6} ry={2.4} fill="#7f1d1d" />;
    case "grin":
      return (
        <Path
          d="M25 21 Q 30 25.4, 35 21"
          stroke="#7f1d1d"
          strokeWidth={1.9}
          strokeLinecap="round"
          fill="none"
        />
      );
    case "flat":
      return <Rect x={26.6} y={21.6} width={6.8} height={1.7} rx={0.85} fill="#7f1d1d" />;
  }
}

export function KeeperFigure({ height, looks, pose, direction }: Props) {
  const [leftArm, rightArm] = armAngles(pose, direction);
  const rotation = bodyRotation(pose, direction);
  const crouch = pose === "beaten" ? 5 : 0;

  const { girth, stature } = looks;
  const torsoWidth = 26 * girth;
  const torsoX = 30 - torsoWidth / 2;
  const shortsWidth = 22 * girth;
  const shortsX = 30 - shortsWidth / 2;
  const limbWidth = 7 * (0.86 + 0.14 * girth);
  // Wide keepers get wider-set arms, or they read as pinned to the ribs.
  const armSpread = (girth - 1) * 5;

  const arm = (angle: number, side: -1 | 1) => (
    <G transform={`rotate(${angle} 30 34)`}>
      <Rect
        x={30 - limbWidth / 2 + side * armSpread}
        y={32}
        width={limbWidth}
        height={30}
        rx={limbWidth / 2}
        fill={looks.shirtTrim}
      />
      <Circle
        cx={30 + side * armSpread}
        cy={64}
        r={5.6}
        fill={GLOVE}
        stroke="#cbd5e1"
        strokeWidth={1}
      />
    </G>
  );

  return (
    <Svg width={keeperBoxWidth(height)} height={height} viewBox={VIEW_BOX}>
      {/* Stature scales from the feet so everyone stands on the same line. */}
      <G transform={`translate(30 93) scale(1 ${stature}) translate(-30 -93)`}>
        <G transform={`rotate(${rotation} 30 60) translate(0 ${crouch})`}>
          {/* Legs first so the shorts overlap them cleanly. */}
          <Rect x={22} y={66} width={7} height={26} rx={3} fill={SKIN} />
          <Rect x={31} y={66} width={7} height={26} rx={3} fill={SKIN} />
          <Rect x={21.5} y={84} width={8} height={9} rx={2} fill={SOCKS} />
          <Rect x={30.5} y={84} width={8} height={9} rx={2} fill={SOCKS} />

          <Rect x={shortsX} y={58} width={shortsWidth} height={13} rx={3} fill={SHORTS} />

          {arm(leftArm, -1)}
          {arm(rightArm, 1)}

          {/* Torso */}
          <Rect x={torsoX} y={28} width={torsoWidth} height={32} rx={7} fill={looks.shirt} />
          <Rect x={torsoX} y={28} width={torsoWidth} height={6} rx={3} fill={looks.shirtTrim} />
          <SvgText
            x={30}
            y={52}
            fontSize={15}
            fontWeight="bold"
            fill="#f8fafc"
            textAnchor="middle"
            opacity={0.92}
          >
            {looks.squadNumber}
          </SvgText>

          {/* Head */}
          <Circle cx={30} cy={17} r={11} fill={SKIN} />
          <Path d="M19.5 20 Q 30 27, 40.5 20 Q 39 28, 30 28 Q 21 28, 19.5 20 Z" fill={SKIN_SHADE} opacity={0.35} />
          <BeardPiece beard={looks.beard} />
          <HairPiece hair={looks.hair} />
          <BrowPiece brow={looks.brow} />
          <Circle cx={26} cy={17} r={1.7} fill="#1f2937" />
          <Circle cx={34} cy={17} r={1.7} fill="#1f2937" />
          <MouthPiece mouth={pose === "celebrate" ? "open" : looks.mouth} />
        </G>
      </G>
    </Svg>
  );
}
