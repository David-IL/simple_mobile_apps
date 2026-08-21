import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

/**
 * Backdrop and disruption props. Each one exists so a gag can be *seen before
 * the run-up* rather than only read — the telegraph is the design, and a
 * telegraph nobody notices is the same as no telegraph.
 */

type Size = { width: number; height: number };

/**
 * Wind sock on a pole. `strength` is the engine's windX, so the flag bends by
 * exactly as much as the ball will drift, in the same direction.
 */
export function WindSock({ width, height, strength }: Size & { strength: number }) {
  const bend = Math.max(-1, Math.min(1, strength / 0.34));
  const tipX = 14 + bend * 22;
  const tipY = 16 - Math.abs(bend) * 5;

  return (
    <Svg width={width} height={height} viewBox="0 0 44 60">
      <Rect x={12} y={8} width={3} height={50} rx={1.5} fill="#94a3b8" />
      <Path
        d={`M15 10 Q ${15 + bend * 14} ${tipY - 2}, ${tipX} ${tipY} L ${tipX} ${tipY + 9} Q ${
          15 + bend * 14
        } ${tipY + 12}, 15 22 Z`}
        fill="#f97316"
        opacity={0.95}
      />
      <Path
        d={`M15 13 Q ${15 + bend * 9} ${tipY + 2}, ${15 + bend * 15} ${tipY + 3}`}
        stroke="#fed7aa"
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

/** Churned-up mud around the penalty spot. */
export function MudPatch({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 90 34">
      <Ellipse cx={45} cy={19} rx={42} ry={13} fill="#4a3418" opacity={0.85} />
      <Ellipse cx={33} cy={15} rx={16} ry={7} fill="#6b4a22" opacity={0.9} />
      <Ellipse cx={58} cy={22} rx={13} ry={6} fill="#3b2a13" opacity={0.9} />
      <Ellipse cx={68} cy={13} rx={7} ry={3.5} fill="#6b4a22" opacity={0.8} />
      <Ellipse cx={20} cy={24} rx={6} ry={3} fill="#3b2a13" opacity={0.8} />
    </Svg>
  );
}

/**
 * Low evening sun, sitting over a corner of the stand.
 *
 * It used to hang in the middle of the goal, directly in front of the keeper,
 * which reads as a rendering mistake rather than weather. Up in a corner it
 * reads as an evening kick-off. The effect is unchanged either way — what the
 * sun takes away is the aim line, not the view.
 */
export function SunGlare({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 100">
      <Defs>
        <RadialGradient id="glare" cx="82%" cy="24%" r="78%">
          <Stop offset="0%" stopColor="#fef9c3" stopOpacity={0.95} />
          <Stop offset="38%" stopColor="#fde047" stopOpacity={0.4} />
          <Stop offset="100%" stopColor="#facc15" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={200} height={100} fill="url(#glare)" />
      <Circle cx={164} cy={24} r={15} fill="#fffbeb" opacity={0.96} />
      {/* A couple of flare streaks, so it reads as glare rather than a lamp. */}
      <Line x1={128} y1={24} x2={200} y2={24} stroke="#fffbeb" strokeWidth={1.6} opacity={0.35} />
      <Line x1={164} y1={0} x2={164} y2={58} stroke="#fffbeb" strokeWidth={1.6} opacity={0.28} />
    </Svg>
  );
}

/**
 * The crowd behind the goal. Static bank by default; `roaring` brightens it for
 * the away-end disruption so the noise is visible as well as described.
 */
export function CrowdBank({ width, height, roaring }: Size & { roaring?: boolean }) {
  const shirts = roaring
    ? ["#f87171", "#fbbf24", "#f472b6", "#fb923c", "#facc15", "#fca5a5"]
    : ["#334155", "#3f4a5f", "#2c3648", "#3a4557", "#293345", "#374357"];

  return (
    <Svg width={width} height={height} viewBox="0 0 240 60">
      <Defs>
        <LinearGradient id="stand" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0f172a" />
          <Stop offset="100%" stopColor="#1e293b" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={240} height={60} fill="url(#stand)" />
      {Array.from({ length: 30 }, (_, index) => {
        const column = index % 15;
        const row = Math.floor(index / 15);
        const x = 8 + column * 16;
        const y = 20 + row * 20;
        const fill = shirts[index % shirts.length] ?? "#334155";
        return (
          <G key={index} opacity={roaring ? 0.95 : 0.7}>
            <Circle cx={x} cy={y - 7} r={3.4} fill="#94a3b8" />
            <Ellipse cx={x} cy={y + 3} rx={5.4} ry={6.4} fill={fill} />
          </G>
        );
      })}
    </Svg>
  );
}

/** Floodlit night sky above the stand. */
export function NightSky({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 80">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#020617" />
          <Stop offset="100%" stopColor="#0f172a" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={240} height={80} fill="url(#sky)" />
      <G fill="#e2e8f0" opacity={0.55}>
        <Circle cx={28} cy={18} r={1} />
        <Circle cx={72} cy={9} r={0.8} />
        <Circle cx={128} cy={22} r={1.1} />
        <Circle cx={186} cy={12} r={0.9} />
        <Circle cx={214} cy={30} r={0.8} />
      </G>
    </Svg>
  );
}

/**
 * Rain, for the muddy-pitch round.
 *
 * Not a particle system — ADR 7 is clear that dozens of independently moving
 * bodies is a signal to change the idea. This is one static SVG of streaks,
 * drawn twice so the tile repeats seamlessly, moved by a single `Animated`
 * transform on the caller's side. Two dozen lines, one animated value.
 */
export function Rain({ width, height }: Size) {
  const streaks = Array.from({ length: 26 }, (_, index) => {
    // A fixed pseudo-scatter: deterministic, so it never re-rolls on re-render.
    const x = (index * 37) % 100;
    const y = (index * 61) % 100;
    return { x, y, length: 6 + ((index * 13) % 7) };
  });

  return (
    <Svg width={width} height={height} viewBox="0 0 100 200" preserveAspectRatio="none">
      {[0, 100].map((offset) =>
        streaks.map((streak, index) => (
          <Line
            key={`${offset}-${index}`}
            x1={streak.x}
            y1={streak.y + offset}
            x2={streak.x - 2}
            y2={streak.y + offset + streak.length}
            stroke="#cbd5e1"
            strokeWidth={0.7}
            opacity={0.5}
          />
        )),
      )}
    </Svg>
  );
}
