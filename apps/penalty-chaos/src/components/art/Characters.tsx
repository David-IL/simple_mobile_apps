import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

/**
 * The two comic characters that wander into shot. Flat vector, no animation
 * inside — the caller tweens them with `Animated`.
 *
 * Kept deliberately cartoonish and invented. Nothing here resembles a real
 * person; see docs/adr/0008-no-real-person-likenesses-or-club-ip.md.
 */

type Size = { width: number; height: number };

/** Someone's uncle, mid-run, scarf streaming. Blocks a column of the goal. */
export function PitchInvader({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 54 84">
      {/* Scarf, trailing behind him */}
      <Path
        d="M22 30 C 10 26, 6 34, 0 30"
        stroke="#dc2626"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Back leg, thrown out behind */}
      <Rect
        x={22}
        y={52}
        width={7}
        height={26}
        rx={3.5}
        fill="#1e3a8a"
        transform="rotate(28 25 54)"
      />
      {/* Front leg, driving forward */}
      <Rect
        x={28}
        y={52}
        width={7}
        height={26}
        rx={3.5}
        fill="#1e3a8a"
        transform="rotate(-24 31 54)"
      />
      {/* Belly */}
      <Ellipse cx={29} cy={40} rx={13} ry={14} fill="#facc15" />
      {/* Arms, one up in triumph */}
      <Rect
        x={36}
        y={22}
        width={6}
        height={22}
        rx={3}
        fill="#facc15"
        transform="rotate(24 39 33)"
      />
      <Rect
        x={16}
        y={34}
        width={6}
        height={20}
        rx={3}
        fill="#facc15"
        transform="rotate(-30 19 44)"
      />
      <Circle cx={44} cy={20} r={4} fill="#d9a074" />
      <Circle cx={13} cy={54} r={4} fill="#d9a074" />
      {/* Head, delighted with himself */}
      <Circle cx={29} cy={17} r={10} fill="#d9a074" />
      <Ellipse cx={29} cy={10} rx={10} ry={5} fill="#78350f" />
      <Circle cx={25.5} cy={17} r={1.5} fill="#1f2937" />
      <Circle cx={32.5} cy={17} r={1.5} fill="#1f2937" />
      <Path
        d="M24 21 Q 29 25.5, 34 21"
        stroke="#7f1d1d"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** A giant badger, dancing. The keeper cannot stop watching it. */
export function Mascot({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 72 80">
      {/* Arms up, mid-wiggle */}
      <Rect
        x={8}
        y={30}
        width={8}
        height={24}
        rx={4}
        fill="#475569"
        transform="rotate(28 12 42)"
      />
      <Rect
        x={56}
        y={30}
        width={8}
        height={24}
        rx={4}
        fill="#475569"
        transform="rotate(-28 60 42)"
      />
      {/* Body */}
      <Ellipse cx={36} cy={56} rx={20} ry={21} fill="#64748b" />
      <Ellipse cx={36} cy={60} rx={12} ry={14} fill="#e2e8f0" />
      {/* Feet */}
      <Ellipse cx={26} cy={76} rx={8} ry={4} fill="#334155" />
      <Ellipse cx={46} cy={76} rx={8} ry={4} fill="#334155" />
      {/* Head */}
      <Circle cx={36} cy={26} r={19} fill="#f1f5f9" />
      {/* The badger stripes */}
      <Path d="M28 9 L 22 40 L 29 41 L 33 10 Z" fill="#1e293b" />
      <Path d="M44 9 L 50 40 L 43 41 L 39 10 Z" fill="#1e293b" />
      <Circle cx={28} cy={25} r={2.6} fill="#f8fafc" />
      <Circle cx={44} cy={25} r={2.6} fill="#f8fafc" />
      <Ellipse cx={36} cy={35} rx={5} ry={4} fill="#0f172a" />
      {/* Ears */}
      <Circle cx={20} cy={12} r={5.5} fill="#cbd5e1" />
      <Circle cx={52} cy={12} r={5.5} fill="#cbd5e1" />
      {/* Grin */}
      <Path
        d="M30 40 Q 36 44, 42 40"
        stroke="#0f172a"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * A football. Panel detail mostly disappears once it is 13px and shrinking, so
 * the readable part is the silhouette and the spin the caller applies — the
 * seams are there for the home screen, where it is 52px and static.
 */
export function Ball({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill="#ffffff" stroke="#94a3b8" strokeWidth={0.8} />
      {/* Centre pentagon plus the five that ring it — enough to read as a ball. */}
      <Path d="M12 6.6 L 16.1 9.6 L 14.5 14.4 L 9.5 14.4 L 7.9 9.6 Z" fill="#111827" />
      <Path d="M12 1.2 L 15.4 3.1 L 16.1 8.4 L 12 5.9 L 7.9 8.4 L 8.6 3.1 Z" fill="#111827" opacity={0.9} />
      <Path d="M22.4 9.2 L 22.6 13.4 L 18.6 16 L 15.3 14 L 16.9 9.2 Z" fill="#111827" opacity={0.9} />
      <Path d="M1.6 9.2 L 7.1 9.2 L 8.7 14 L 5.4 16 L 1.4 13.4 Z" fill="#111827" opacity={0.9} />
      <Path d="M6.2 20.9 L 5.1 17 L 9 15 L 11.4 18.4 L 9.3 22.2 Z" fill="#111827" opacity={0.9} />
      <Path d="M17.8 20.9 L 14.7 22.2 L 12.6 18.4 L 15 15 L 18.9 17 Z" fill="#111827" opacity={0.9} />
      {/* A touch of shading so it does not read as a flat disc. */}
      <Ellipse cx={8.4} cy={7.6} rx={4.6} ry={3.4} fill="#ffffff" opacity={0.5} />
    </Svg>
  );
}
