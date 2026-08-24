import { View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import type { ShotRecord } from "../game/match";
import { outcomeColour, palette } from "../theme";

/**
 * A thumbnail of the goal with a player's shots on it.
 *
 * Plots the *landing point*, not the zone. Six coloured buckets would tell you
 * where you aimed; the scattered dots tell you what your power did to it, which
 * is the half of the mechanic that is otherwise invisible.
 *
 * It is also the keeper's reading material made visible. If three dots cluster
 * in one corner, that is exactly what `readablePattern()` is about to punish.
 *
 * Everything is derived from `width` so the same component works as a glance in
 * the corner of the pitch and as the centrepiece of the full-time screen.
 */

const DEFAULT_WIDTH = 78;
const ASPECT = 50 / 78;
/** Room around the frame so a shot that went wide still has somewhere to sit. */
const MARGIN_RATIO = 7 / 78;

type Props = { shots: readonly ShotRecord[]; width?: number };

export function ShotMap({ shots, width = DEFAULT_WIDTH }: Props) {
  const height = width * ASPECT;
  const margin = width * MARGIN_RATIO;
  const frameWidth = width - margin * 2;
  const frameHeight = height - margin * 2;
  const scale = width / DEFAULT_WIDTH;

  const toPixels = (aim: { x: number; y: number }) => {
    // Clamp a little beyond the posts so wild misses stay on the map instead of
    // vanishing — a miss you cannot see teaches nothing.
    const x = Math.max(-1.35, Math.min(1.35, aim.x));
    const y = Math.max(-0.25, Math.min(1.3, aim.y));
    return {
      cx: margin + ((x + 1) / 2) * frameWidth,
      cy: margin + (1 - y) * frameHeight,
    };
  };

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Rect
          x={margin}
          y={margin}
          width={frameWidth}
          height={frameHeight}
          fill="rgba(12,9,17,0.55)"
          stroke={palette.chalkDim}
          strokeWidth={1.5 * scale}
        />
        {[1, 2].map((index) => (
          <Line
            key={index}
            x1={margin + (frameWidth * index) / 3}
            y1={margin}
            x2={margin + (frameWidth * index) / 3}
            y2={margin + frameHeight}
            stroke={palette.chalkDim}
            strokeWidth={0.5 * scale}
            opacity={0.4}
          />
        ))}
        <Line
          x1={margin}
          y1={margin + frameHeight / 2}
          x2={margin + frameWidth}
          y2={margin + frameHeight / 2}
          stroke={palette.chalkDim}
          strokeWidth={0.5 * scale}
          opacity={0.4}
        />
        {shots.map((shot, index) => {
          const { cx, cy } = toPixels(shot.landing);
          // The most recent shot is the one you are about to repeat, so it is
          // the one worth picking out.
          const latest = index === shots.length - 1;
          return (
            <Circle
              key={index}
              cx={cx}
              cy={cy}
              r={(latest ? 4 : 3) * scale}
              fill={outcomeColour[shot.kind]}
              stroke={latest ? palette.chalk : "transparent"}
              strokeWidth={latest ? 1.2 * scale : 0}
              opacity={latest ? 1 : 0.65}
            />
          );
        })}
      </Svg>
    </View>
  );
}
