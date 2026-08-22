import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";

/**
 * The two comic characters that wander into shot. Flat vector, no animation
 * inside — the caller tweens them with `Animated`.
 *
 * Kept deliberately cartoonish and invented. Nothing here resembles a real
 * person; see docs/adr/0008-no-real-person-likenesses-or-club-ip.md.
 */

type Size = { width: number; height: number };

const INVADER_INK = "#181026";

/**
 * Someone's uncle, mid-run, scarf streaming, brandishing a KAOS sign.
 *
 * Redrawn after the first playtest, where two children found him "only
 * annoying" — he stood still, small, in a column, and the only thing telling you
 * he mattered was a paragraph of text above the pitch. The sign and the scale
 * are the fix: he has to be the loudest thing on the grass, because he *is* the
 * announcement now.
 *
 * Redrawn again for the "Banner-close" direction picked from the character
 * canvas: bold ink outline, cel-shaded gradients, a beanie and chin-beard
 * lifted straight from the banner art. He holds still (paces, never dives),
 * so he can carry more of that detail than the keeper can.
 */
export function PitchInvader({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 74 84">
      <Defs>
        <LinearGradient id="piCoat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f4e3b8" />
          <Stop offset="1" stopColor="#dcc27f" />
        </LinearGradient>
        <LinearGradient id="piJeans" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3b5a8a" />
          <Stop offset="1" stopColor="#1e3a5f" />
        </LinearGradient>
        <LinearGradient id="piSkin" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f4c599" />
          <Stop offset="1" stopColor="#d99e68" />
        </LinearGradient>
      </Defs>
      <G stroke={INVADER_INK} strokeLinejoin="round">
        {/* Scarf, trailing behind him */}
        <Path
          d="M22 30 C 10 26, 6 34, 0 30"
          stroke="#dc2626"
          strokeWidth={5.5}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M18 31.5 Q 10 30.5, 3 30"
          stroke="#fde68a"
          strokeWidth={1.6}
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
          fill="url(#piJeans)"
          strokeWidth={1.4}
          transform="rotate(28 25 54)"
        />
        {/* Front leg, driving forward */}
        <Rect
          x={28}
          y={52}
          width={7}
          height={26}
          rx={3.5}
          fill="url(#piJeans)"
          strokeWidth={1.4}
          transform="rotate(-24 31 54)"
        />
        {/* Belly */}
        <Ellipse cx={29} cy={40} rx={13} ry={14} fill="url(#piCoat)" strokeWidth={1.5} />
        {/* Arms, one up in triumph */}
        <Rect
          x={36}
          y={22}
          width={6}
          height={22}
          rx={3}
          fill="url(#piCoat)"
          strokeWidth={1.3}
          transform="rotate(24 39 33)"
        />
        <Rect
          x={16}
          y={34}
          width={6}
          height={20}
          rx={3}
          fill="url(#piCoat)"
          strokeWidth={1.3}
          transform="rotate(-30 19 44)"
        />
        <Circle cx={44} cy={20} r={4} fill="url(#piSkin)" strokeWidth={1.2} />
        <Circle cx={13} cy={54} r={4} fill="url(#piSkin)" strokeWidth={1.2} />
        {/* Head, delighted with himself */}
        <Circle cx={29} cy={17} r={10} fill="url(#piSkin)" strokeWidth={1.4} />
        {/* Chin-beard */}
        <Path d="M20 19 Q 21 28, 29 28 Q 37 28, 38 19 Q 34 25, 29 25 Q 24 25, 20 19 Z" fill="#5b3a22" stroke="none" />
        {/* Beanie, with a turned-up brim */}
        <Path
          d="M18 13 Q 20 1, 29 1 Q 38 1, 40 13 Q 34 8, 29 8 Q 24 8, 18 13 Z"
          fill="#fbbf24"
          strokeWidth={1.3}
        />
        <Ellipse cx={22} cy={11} rx={4} ry={2.4} fill="#fde68a" opacity={0.75} stroke="none" />
        <Rect x={18} y={12} width={22} height={4} rx={2} fill="#ca8a04" strokeWidth={1} />
        <Circle cx={25.5} cy={17} r={1.6} fill="#1f2937" stroke="none" />
        <Circle cx={32.5} cy={17} r={1.6} fill="#1f2937" stroke="none" />
        <Circle cx={26.2} cy={16.4} r={0.55} fill="#fdfdfd" stroke="none" />
        <Circle cx={33.2} cy={16.4} r={0.55} fill="#fdfdfd" stroke="none" />
        <G opacity={0.55} fill="#fb7185" stroke="none">
          <Circle cx={20.4} cy={19.6} r={2.1} />
          <Circle cx={37.6} cy={19.6} r={2.1} />
        </G>
        <Path d="M22 20.5 Q 29 27, 36 20.5 Q 33 25.4, 29 25.4 Q 25 25.4, 22 20.5 Z" fill="#7f1d1d" strokeWidth={1} />
        <Path d="M24.4 21.2 L 33.6 21.2 L 32.2 23 L 25.8 23 Z" fill="#fdfdfd" stroke="none" />
        {/*
          The sign, straight off the banner art, drawn last so it sits in front
          of his head rather than being clipped by it — its left edge and the
          head circle genuinely overlap at this rotation, and drawing order
          decides who's on top.
        */}
        <G transform="rotate(-12 51 14)">
          <Rect
            x={34}
            y={4}
            width={34}
            height={19}
            rx={3}
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth={1.5}
          />
          <SvgText x={51} y={18} fontSize={11} fontWeight="bold" fill="#fde68a" textAnchor="middle" stroke="none">
            KAOS!
          </SvgText>
        </G>
      </G>
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

/**
 * The steward, arriving too late to prevent anything.
 *
 * He exists for the payoff rather than the mechanic — the research doc found
 * that what people actually enjoy about pitch invasions is the tackle, not the
 * invasion. He only ever appears after the shot has been taken, so he can never
 * affect it.
 */
export function Steward({ width, height }: Size) {
  return (
    <Svg width={width} height={height} viewBox="0 0 74 84">
      <G transform="translate(10 0)">
      {/* Legs mid-stride */}
      <Rect x={21} y={52} width={7} height={26} rx={3.5} fill="#1f2937" transform="rotate(22 24 54)" />
      <Rect x={29} y={52} width={7} height={26} rx={3.5} fill="#1f2937" transform="rotate(-26 32 54)" />
      {/* High-vis vest */}
      <Ellipse cx={28} cy={40} rx={12} ry={14} fill="#a3e635" />
      <Rect x={22} y={32} width={12} height={4} rx={2} fill="#f8fafc" opacity={0.8} />
      <Rect x={22} y={44} width={12} height={4} rx={2} fill="#f8fafc" opacity={0.8} />
      {/* Arms reaching for a collar */}
      <Rect x={36} y={28} width={6} height={22} rx={3} fill="#a3e635" transform="rotate(58 39 39)" />
      <Rect x={16} y={30} width={6} height={20} rx={3} fill="#a3e635" transform="rotate(-38 19 40)" />
      <Circle cx={49} cy={31} r={4} fill="#d9a074" />
      <Circle cx={11} cy={44} r={4} fill="#d9a074" />
      {/* Head, unimpressed */}
      <Circle cx={28} cy={17} r={10} fill="#d9a074" />
      <Ellipse cx={28} cy={9} rx={10} ry={5} fill="#1f2937" />
      <Circle cx={24.5} cy={17} r={1.5} fill="#1f2937" />
      <Circle cx={31.5} cy={17} r={1.5} fill="#1f2937" />
      <Rect x={24} y={21.5} width={8} height={1.8} rx={0.9} fill="#7f1d1d" />
      </G>
    </Svg>
  );
}
