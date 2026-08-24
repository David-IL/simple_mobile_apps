import Svg, { ClipPath, Defs, G, Line, Path, Rect } from "react-native-svg";
import type { Locale } from "../i18n";
import { palette } from "../theme";

/**
 * Chrome icons, drawn rather than typed.
 *
 * Flag *emoji* were the obvious first thought and are the wrong answer on this
 * platform: regional-indicator sequences render inconsistently across Android
 * versions and OEM fonts, and a language switch that shows two empty boxes on
 * somebody's phone is worse than the text it replaced. `react-native-svg` is
 * already a dependency ([ADR 9](../../../../docs/adr/0009-svg-for-character-art.md))
 * and a flag is a handful of rectangles, so these always draw.
 *
 * They are deliberately not in `components/art/` — that folder is the game's
 * characters and scenery. This is menu furniture.
 */

const FLAG_RATIO = 22 / 16;

/**
 * Typed per locale, the same trick the banner artwork uses: adding a third
 * language fails to compile until someone draws its flag.
 *
 * Flags stand in for languages here, which is normally a poor idea — one flag
 * rarely maps to one language. It is safe in this specific case: there are
 * exactly two locales, each belongs to one country, and the reader is an
 * 11-year-old who parses a picture faster than a word. The accessible name is
 * still the language in its own language, which is the property the text
 * version had and the one worth keeping.
 */
export const FLAGS: Record<Locale, (props: { height: number }) => React.ReactElement> = {
  nb: NorwayFlag,
  en: UnionFlag,
};

function NorwayFlag({ height }: { height: number }) {
  return (
    <Svg width={height * FLAG_RATIO} height={height} viewBox="0 0 22 16">
      <Rect x="0" y="0" width="22" height="16" fill="#ba0c2f" />
      {/* White cross, then the blue one inset inside it. */}
      <Rect x="6" y="0" width="4" height="16" fill="#ffffff" />
      <Rect x="0" y="6" width="22" height="4" fill="#ffffff" />
      <Rect x="7" y="0" width="2" height="16" fill="#00205b" />
      <Rect x="0" y="7" width="22" height="2" fill="#00205b" />
    </Svg>
  );
}

function UnionFlag({ height }: { height: number }) {
  return (
    <Svg width={height * FLAG_RATIO} height={height} viewBox="0 0 22 16">
      <Defs>
        {/* The diagonals run corner to corner, so they need trimming to the field. */}
        <ClipPath id="unionField">
          <Rect x="0" y="0" width="22" height="16" />
        </ClipPath>
      </Defs>
      <Rect x="0" y="0" width="22" height="16" fill="#012169" />
      <G clipPath="url(#unionField)">
        <Line x1="0" y1="0" x2="22" y2="16" stroke="#ffffff" strokeWidth="3.4" />
        <Line x1="22" y1="0" x2="0" y2="16" stroke="#ffffff" strokeWidth="3.4" />
        <Line x1="0" y1="0" x2="22" y2="16" stroke="#c8102e" strokeWidth="1.6" />
        <Line x1="22" y1="0" x2="0" y2="16" stroke="#c8102e" strokeWidth="1.6" />
      </G>
      <Rect x="8.5" y="0" width="5" height="16" fill="#ffffff" />
      <Rect x="0" y="5.5" width="22" height="5" fill="#ffffff" />
      <Rect x="9.5" y="0" width="3" height="16" fill="#c8102e" />
      <Rect x="0" y="6.5" width="22" height="3" fill="#c8102e" />
    </Svg>
  );
}

/**
 * One control with two states rather than an On/Off pair, because the icon
 * already says which state it is in — a crossed-out speaker needs no label.
 */
export function SoundIcon({ height, muted }: { height: number; muted: boolean }) {
  const colour = muted ? palette.chalkDim : palette.brand;
  return (
    <Svg width={height} height={height} viewBox="0 0 16 16">
      <Path d="M3 6 L6 6 L10 2.5 L10 13.5 L6 10 L3 10 Z" fill={colour} />
      {muted ? (
        <G stroke={colour} strokeWidth="1.6" strokeLinecap="round">
          <Line x1="12" y1="5.5" x2="15.5" y2="10.5" />
          <Line x1="15.5" y1="5.5" x2="12" y2="10.5" />
        </G>
      ) : (
        <G stroke={colour} strokeWidth="1.5" strokeLinecap="round" fill="none">
          <Path d="M11.8 5.4 Q13.6 8 11.8 10.6" />
          <Path d="M13.6 3.4 Q16.4 8 13.6 12.6" />
        </G>
      )}
    </Svg>
  );
}

/** The rematch affordance. A chevron, pointing the way the tap goes. */
export function ChevronRight({ height, colour }: { height: number; colour: string }) {
  return (
    <Svg width={height * 0.6} height={height} viewBox="0 0 6 10">
      <Path
        d="M1.5 1 L4.5 5 L1.5 9"
        stroke={colour}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
