import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import type { ShotRecord } from "../game/match";
import { outcomeColour, palette } from "../theme";

/**
 * A thumbnail of the goal with this player's shots on it.
 *
 * Plots the *landing point*, not the zone. Six coloured buckets would tell you
 * where you aimed; the scattered dots tell you what your power did to it, which
 * is the half of the mechanic that is otherwise invisible.
 *
 * It is also the keeper's reading material made visible. If three dots cluster
 * in one corner, that is exactly what `readablePattern()` is about to punish.
 */

const WIDTH = 78;
const HEIGHT = 50;
/** Room around the frame so a shot that went wide still has somewhere to sit. */
const MARGIN = 7;

type Props = { shots: readonly ShotRecord[] };

function toPixels(aim: { x: number; y: number }) {
  // Clamp a little beyond the posts so wild misses stay on the thumbnail
  // instead of vanishing — a miss you cannot see teaches nothing.
  const x = Math.max(-1.35, Math.min(1.35, aim.x));
  const y = Math.max(-0.25, Math.min(1.3, aim.y));
  return {
    cx: MARGIN + ((x + 1) / 2) * (WIDTH - MARGIN * 2),
    cy: MARGIN + (1 - y) * (HEIGHT - MARGIN * 2),
  };
}

export function ShotMap({ shots }: Props) {
  const frameWidth = WIDTH - MARGIN * 2;
  const frameHeight = HEIGHT - MARGIN * 2;

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT}>
        <Rect
          x={MARGIN}
          y={MARGIN}
          width={frameWidth}
          height={frameHeight}
          fill="rgba(15,23,42,0.55)"
          stroke={palette.chalkDim}
          strokeWidth={1.5}
        />
        {[1, 2].map((index) => (
          <Line
            key={index}
            x1={MARGIN + (frameWidth * index) / 3}
            y1={MARGIN}
            x2={MARGIN + (frameWidth * index) / 3}
            y2={MARGIN + frameHeight}
            stroke={palette.chalkDim}
            strokeWidth={0.5}
            opacity={0.4}
          />
        ))}
        <Line
          x1={MARGIN}
          y1={MARGIN + frameHeight / 2}
          x2={MARGIN + frameWidth}
          y2={MARGIN + frameHeight / 2}
          stroke={palette.chalkDim}
          strokeWidth={0.5}
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
              r={latest ? 4 : 3}
              fill={outcomeColour[shot.kind]}
              stroke={latest ? palette.chalk : "transparent"}
              strokeWidth={latest ? 1.2 : 0}
              opacity={latest ? 1 : 0.65}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: WIDTH, height: HEIGHT },
});
