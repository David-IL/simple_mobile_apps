import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
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
 *
 * Redrawn for bolder ink outlines and cel-shaded gradients — the "Showman"
 * direction picked from the character-design canvas. Every shape carries an
 * outline and a light-to-dark fill instead of a flat colour; heads, eyes and
 * hair are a size up from the original for more presence at a glance. Kept
 * deliberately short of that canvas's full head-to-body ratio: this head
 * still has to share a fixed viewBox with a dive that rotates it 62° about
 * the hips, and pushing further risked clipping the hair against the top
 * edge on exactly the pose that matters most.
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

const INK = "#181026";
const SKIN_LIGHT = "#f0c093";
const SKIN_DARK = "#b9824f";
const SHORTS_LIGHT = "#3b4a63";
const SHORTS_DARK = "#0f172a";
const SOCKS_LIGHT = "#3f4d63";
const SOCKS_DARK = "#0b1220";
const GLOVE_LIGHT = "#ffffff";
const GLOVE_DARK = "#cbd5e1";
const DARK_HAIR = "#3f2d20";
const GREY_HAIR = "#cbd5e1";

/** Lightens (positive) or darkens (negative) a #rrggbb colour toward white or black. */
function shade(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const target = amount > 0 ? 255 : 0;
  const t = Math.min(1, Math.abs(amount));
  const mix = (channel: number) => Math.round(channel + (target - channel) * t);
  const toHex = (channel: number) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

/** Arm angles in degrees, measured from straight down, per pose. */
function armAngles(pose: KeeperPose, direction: Direction, pointing: boolean): [number, number] {
  switch (pose) {
    case "ready":
      return [-38, 38];
    case "lean":
      if (pointing && direction !== 0) {
        // One arm thrown out toward the tell, the other left alone — an
        // actual pointing gesture, distinct from every other keeper's tell,
        // which shifts both arms together (see below).
        return direction === 1 ? [-15, 100] : [-100, 15];
      }
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

function HairPiece({ hair, fill, shadow }: { hair: Hair; fill: string; shadow: string }) {
  switch (hair) {
    case "full":
      return (
        <G>
          <Ellipse cx={30} cy={9} rx={12} ry={6.8} fill={fill} />
          <Path d="M18 10 Q 30 2, 42 10 Q 38 12, 30 11 Q 22 12, 18 10 Z" fill={shadow} opacity={0.5} />
        </G>
      );
    case "grey":
      return <Ellipse cx={30} cy={9} rx={12} ry={6.8} fill={fill} />;
    case "thin":
      return <Ellipse cx={30} cy={8} rx={9.4} ry={3.8} fill={fill} opacity={0.88} />;
    case "wild":
      return (
        <G fill={fill}>
          <Path
            d="M15 12 Q 12 -2, 24 4 Q 26 -6, 34 3 Q 40 -6, 45 5 Q 50 -1, 46 12 Q 38 6, 30 8 Q 22 6, 15 12 Z"
            stroke={INK}
            strokeWidth={1.2}
          />
          <Circle cx={17.5} cy={13} r={4.6} />
          <Circle cx={42.5} cy={13} r={4.6} />
        </G>
      );
    case "bald":
      return <Ellipse cx={25} cy={11.5} rx={4.4} ry={2.6} fill="#ffffff" opacity={0.2} />;
  }
}

function BeardPiece({ beard, fill }: { beard: Beard; fill: string }) {
  if (beard === "none") return null;
  return (
    <Path
      d="M19 18 Q 20 30, 30 30 Q 40 30, 41 18 Q 36 26, 30 26 Q 24 26, 19 18 Z"
      fill={fill}
    />
  );
}

function BrowPiece({ brow }: { brow: Brow }) {
  const tilt = brow === "narrow" ? 13 : brow === "raised" ? -11 : 0;
  return (
    <G fill={INK}>
      <Rect x={21.8} y={11.9} width={6.8} height={2.1} rx={1.05} transform={`rotate(${tilt} 25.2 12.9)`} />
      <Rect x={31.4} y={11.9} width={6.8} height={2.1} rx={1.05} transform={`rotate(${-tilt} 34.8 12.9)`} />
    </G>
  );
}

/** Big cel-shaded eyes with a catchlight — the single biggest lever on expression at this size. */
function EyePair({ mouth }: { mouth: Mouth }) {
  const squint = mouth === "flat" ? 0.8 : 1;
  return (
    <G>
      <Ellipse cx={25.2} cy={16.4} rx={2.6} ry={2.9 * squint} fill="#fdfdfd" />
      <Ellipse cx={34.8} cy={16.4} rx={2.6} ry={2.9 * squint} fill="#fdfdfd" />
      <Circle cx={25.6} cy={16.8} r={1.55} fill={INK} />
      <Circle cx={35.2} cy={16.8} r={1.55} fill={INK} />
      <Circle cx={24.9} cy={15.9} r={0.55} fill="#fdfdfd" />
      <Circle cx={34.5} cy={15.9} r={0.55} fill="#fdfdfd" />
    </G>
  );
}

function MouthPiece({ mouth }: { mouth: Mouth }) {
  switch (mouth) {
    case "open":
      return (
        <G>
          <Path d="M25 20.6 Q 30 26.4, 35 20.6 Q 32.5 24.4, 30 24.4 Q 27.5 24.4, 25 20.6 Z" fill="#7f1d1d" />
          <Path d="M26.3 21 L 33.7 21 L 32.6 22.6 L 27.4 22.6 Z" fill="#fdfdfd" />
        </G>
      );
    case "grin":
      return (
        <G>
          <Path
            d="M24 20.4 Q 30 26.8, 36 20.4 Q 33 25.2, 30 25.2 Q 27 25.2, 24 20.4 Z"
            fill="#7f1d1d"
          />
          <Path d="M25.6 20.9 L 34.4 20.9 L 33 22.6 L 27 22.6 Z" fill="#fdfdfd" />
        </G>
      );
    case "flat":
      return <Rect x={26.4} y={20.7} width={7.2} height={2} rx={1} fill="#7f1d1d" />;
  }
}

export function KeeperFigure({ height, looks, pose, direction }: Props) {
  const [leftArm, rightArm] = armAngles(pose, direction, looks.tellStyle === "point");
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

  // Squad numbers are unique per archetype (see keeperLooks.ts), which makes
  // them a free, stable id — needed because SetupScreen mounts all seven
  // keepers' <Svg> at once, and gradient ids must not collide across them.
  const id = `k${looks.squadNumber}`;
  const jerseyLight = shade(looks.shirt, 0.3);
  const jerseyDark = shade(looks.shirt, -0.24);
  const hairFill = looks.hair === "grey" ? GREY_HAIR : DARK_HAIR;
  const hairShadow = looks.hair === "grey" ? shade(GREY_HAIR, -0.15) : shade(DARK_HAIR, -0.2);
  const beardFill = looks.beard === "grey" ? GREY_HAIR : DARK_HAIR;
  // A blush only suits the archetypes already built to be expressive — a
  // stoic keeper (flat mouth) getting rosy cheeks would undercut him.
  const blush = looks.mouth !== "flat";

  const arm = (angle: number, side: -1 | 1) => (
    <G transform={`rotate(${angle} 30 34)`}>
      <Rect
        x={30 - limbWidth / 2 + side * armSpread}
        y={32}
        width={limbWidth}
        height={30}
        rx={limbWidth / 2}
        fill={looks.shirtTrim}
        stroke={INK}
        strokeWidth={1.3}
      />
      <Circle
        cx={30 + side * armSpread}
        cy={64}
        r={5.8}
        fill={`url(#${id}-glove)`}
        stroke={INK}
        strokeWidth={1.3}
      />
    </G>
  );

  return (
    <Svg width={keeperBoxWidth(height)} height={height} viewBox={VIEW_BOX}>
      <Defs>
        <LinearGradient id={`${id}-skin`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SKIN_LIGHT} />
          <Stop offset="1" stopColor={SKIN_DARK} />
        </LinearGradient>
        <LinearGradient id={`${id}-jersey`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={jerseyLight} />
          <Stop offset="1" stopColor={jerseyDark} />
        </LinearGradient>
        <LinearGradient id={`${id}-shorts`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SHORTS_LIGHT} />
          <Stop offset="1" stopColor={SHORTS_DARK} />
        </LinearGradient>
        <LinearGradient id={`${id}-socks`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SOCKS_LIGHT} />
          <Stop offset="1" stopColor={SOCKS_DARK} />
        </LinearGradient>
        <LinearGradient id={`${id}-glove`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={GLOVE_LIGHT} />
          <Stop offset="1" stopColor={GLOVE_DARK} />
        </LinearGradient>
      </Defs>

      {/* Stature scales from the feet so everyone stands on the same line. */}
      <G transform={`translate(30 93) scale(1 ${stature}) translate(-30 -93)`}>
        {/* A shadow that stays put while he dives away from it, not one that dives with him. */}
        <Ellipse cx={30} cy={93} rx={22 * girth} ry={3.4} fill="#000000" opacity={0.22} />

        <G transform={`rotate(${rotation} 30 60) translate(0 ${crouch})`}>
          {/* Legs first so the shorts overlap them cleanly. */}
          <Rect x={22} y={66} width={7} height={26} rx={3} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={1.3} />
          <Rect x={31} y={66} width={7} height={26} rx={3} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={1.3} />
          <Rect x={21.5} y={84} width={8} height={9} rx={2} fill={`url(#${id}-socks)`} stroke={INK} strokeWidth={1.2} />
          <Rect x={30.5} y={84} width={8} height={9} rx={2} fill={`url(#${id}-socks)`} stroke={INK} strokeWidth={1.2} />

          <Rect
            x={shortsX}
            y={58}
            width={shortsWidth}
            height={13}
            rx={3}
            fill={`url(#${id}-shorts)`}
            stroke={INK}
            strokeWidth={1.3}
          />

          {arm(leftArm, -1)}
          {arm(rightArm, 1)}

          {/* Torso */}
          <Rect
            x={torsoX}
            y={28}
            width={torsoWidth}
            height={32}
            rx={7}
            fill={`url(#${id}-jersey)`}
            stroke={INK}
            strokeWidth={1.4}
          />
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
          <Circle cx={30} cy={16.5} r={12.5} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={1.4} />
          <Path
            d="M18.5 20 Q 30 27.5, 41.5 20 Q 39.5 28.5, 30 28.5 Q 20.5 28.5, 18.5 20 Z"
            fill={SKIN_DARK}
            opacity={0.4}
          />
          <BeardPiece beard={looks.beard} fill={beardFill} />
          <HairPiece hair={looks.hair} fill={hairFill} shadow={hairShadow} />
          <BrowPiece brow={looks.brow} />
          <EyePair mouth={looks.mouth} />
          {blush ? (
            <G opacity={0.55} fill="#fb7185">
              <Circle cx={20.6} cy={19.5} r={2.4} />
              <Circle cx={39.4} cy={19.5} r={2.4} />
            </G>
          ) : null}
          <MouthPiece mouth={pose === "celebrate" ? "open" : looks.mouth} />
        </G>
      </G>
    </Svg>
  );
}
