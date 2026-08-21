import Svg, { Circle, Ellipse, G, Rect, Text as SvgText } from "react-native-svg";
import type { KeeperPose } from "../../game/types";

/**
 * The keeper, drawn as flat vector shapes.
 *
 * SVG rather than a canvas on purpose: ADR 7 says reach for Skia only when a
 * canvas is genuinely needed, and nothing here needs one. This is a handful of
 * primitives whose angles are driven by `pose`, with all *movement* handled by
 * the caller's `Animated` transforms. Nothing in this file animates itself.
 */

export type Direction = -1 | 0 | 1;

type Props = {
  width: number;
  height: number;
  shirt: string;
  shirtTrim: string;
  monogram: string;
  pose: KeeperPose;
  /** Which way the pose leans or dives. 0 stays central. */
  direction: Direction;
};

const SKIN = "#d9a074";
const SHORTS = "#1e293b";
const SOCKS = "#0f172a";
const GLOVE = "#f8fafc";

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

function Arm({ angle, shirtTrim }: { angle: number; shirtTrim: string }) {
  return (
    <G transform={`rotate(${angle} 30 34)`}>
      <Rect x={26.5} y={32} width={7} height={30} rx={3.5} fill={shirtTrim} />
      <Circle cx={30} cy={64} r={5.5} fill={GLOVE} stroke="#cbd5e1" strokeWidth={1} />
    </G>
  );
}

export function KeeperFigure({
  width,
  height,
  shirt,
  shirtTrim,
  monogram,
  pose,
  direction,
}: Props) {
  const [leftArm, rightArm] = armAngles(pose, direction);
  const rotation = bodyRotation(pose, direction);
  const crouch = pose === "beaten" ? 5 : 0;

  return (
    <Svg width={width} height={height} viewBox="0 0 60 96">
      <G transform={`rotate(${rotation} 30 60) translate(0 ${crouch})`}>
        {/* Legs first so the shorts overlap them cleanly. */}
        <Rect x={22} y={66} width={7} height={26} rx={3} fill={SKIN} />
        <Rect x={31} y={66} width={7} height={26} rx={3} fill={SKIN} />
        <Rect x={21.5} y={84} width={8} height={9} rx={2} fill={SOCKS} />
        <Rect x={30.5} y={84} width={8} height={9} rx={2} fill={SOCKS} />

        <Rect x={19} y={58} width={22} height={13} rx={3} fill={SHORTS} />

        <Arm angle={leftArm} shirtTrim={shirtTrim} />
        <Arm angle={rightArm} shirtTrim={shirtTrim} />

        {/* Torso */}
        <Rect x={17} y={28} width={26} height={32} rx={7} fill={shirt} />
        <Rect x={17} y={28} width={26} height={6} rx={3} fill={shirtTrim} />
        <SvgText
          x={30}
          y={51}
          fontSize={13}
          fontWeight="bold"
          fill="#f8fafc"
          textAnchor="middle"
          opacity={0.9}
        >
          {monogram}
        </SvgText>

        {/* Head */}
        <Circle cx={30} cy={17} r={11} fill={SKIN} />
        <Ellipse cx={30} cy={9} rx={11} ry={6} fill="#3f2d20" />
        <Circle cx={26} cy={17} r={1.6} fill="#1f2937" />
        <Circle cx={34} cy={17} r={1.6} fill="#1f2937" />
        {pose === "celebrate" || pose === "ready" ? (
          <Ellipse cx={30} cy={22.5} rx={3.5} ry={2} fill="#7f1d1d" />
        ) : (
          <Rect x={26.5} y={21.5} width={7} height={1.8} rx={0.9} fill="#7f1d1d" />
        )}
      </G>
    </Svg>
  );
}
