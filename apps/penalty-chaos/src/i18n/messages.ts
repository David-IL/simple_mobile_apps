import type { TraitId } from "../game/keepers";
import type { DisruptionId, HeadlineKey, KeeperId, ShotResultKind } from "../game/types";
import { MAX_CYCLES } from "../game/row";

/**
 * How many strokes make "a proper row", as a fraction of a perfect one.
 *
 * It lives here rather than in either locale so the two cannot drift apart, and
 * it is derived from `MAX_CYCLES` rather than written as a number because the
 * ceiling has moved once already. The previous copy topped out at 18, which no
 * row could ever reach — a perfect row is one answer per cycle, so `MAX_CYCLES`
 * is the ceiling — and the best line was therefore dead. `row.test.ts` pins
 * that every tier stays reachable.
 *
 * Importing one constant out of the engine is not what ADR 10 forbids: the
 * engine still hands over a number and the sentences still live in the locales.
 */
export const ROW_PROPER = Math.ceil(MAX_CYCLES * 0.6);

export const LOCALES = ["nb", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Context a headline may need. Passed to every one so the shape stays uniform. */
export type HeadlineContext = { keeper: string; side: string };

/**
 * The shape every locale must satisfy.
 *
 * `Record<KeeperId, …>` and `Record<DisruptionId, …>` are the point: adding a
 * keeper or a disruption breaks every locale file at compile time, so a new gag
 * cannot ship half-translated. Same for headlines.
 */
export type Messages = {
  languageName: string;

  home: {
    titleLine1: string;
    titleLine2: string;
    solo: string;
    duel: string;
    /** The rematch card's call to action, on the home screen. */
    rematch: string;
    footnote: string;
    language: string;
    sound: string;
    on: string;
    off: string;
  };

  setup: {
    modeSolo: string;
    modeDuel: string;
    pickKeeper: string;
    renameLabel: string;
    clearName: string;
    takers: string;
    yourName: string;
    start: string;
    back: string;
    playerOne: string;
    playerTwo: string;
    traits: Record<TraitId, string>;
    neverFaced: string;
    savePercent: (percent: number) => string;
    record: (scored: number, faced: number) => string;
  };

  match: {
    toTake: (name: string) => string;
    /** Not shown on screen any more — the accessibility label for the gesture demo. */
    hintNormal: string;
    tapToContinue: string;
    giveUp: string;
    giveUpHint: string;
    outOf: (total: number) => string;
    suddenDeath: string;
    calmName: string;
    calmBrief: string;
    soloTaker: string;
    /** Shown when the keeper read a repeated zone and the shot went there. */
    readSaved: (times: number) => string;
    /** Shown when he read a repeat and the player went somewhere else. */
    readBeaten: string;
  };

  /**
   * The Viking row celebration.
   *
   * `ro` is the crowd's own word and is **the same string in every locale** —
   * translating it would be like translating "olé". It stays in the contract
   * rather than being hardcoded so that a third language has to make that
   * decision consciously instead of inheriting it (ADR 10).
   */
  row: {
    /** The offer on the result screen, shown only after a win. */
    invite: string;
    ro: string;
    strokes: (count: number) => string;
    finished: (count: number) => string;
    close: string;
    /** Hold-to-leave, the same control the shootout uses. */
    abort: string;
    abortHint: string;
  };

  /**
   * Recent form against one keeper. Its own group because both the home
   * screen's rematch card and the setup screen's keeper card show it.
   */
  form: {
    /**
     * `of` is how many outcomes are actually held, not how many shots have been
     * faced — a record migrated from before form existed has the second without
     * the first. See recentForm in src/state/keeperTally.ts.
     */
    recent: (scored: number, of: number) => string;
  };

  verdict: Record<ShotResultKind, string>;
  outcome: Record<ShotResultKind, string>;

  result: {
    fullTime: string;
    versus: (keeper: string) => string;
    again: string;
    differentKeeper: string;
    allSquare: string;
    wins: (name: string) => string;
    soloVerdict: (scored: number, total: number) => string;
  };

  sides: { left: string; centre: string; right: string };

  banner: {
    windDirection: (direction: "left" | "right") => string;
    invaderAt: (side: string) => string;
  };

  keepers: Record<KeeperId, { name: string; blurb: string; taunts: readonly string[] }>;
  disruptions: Record<DisruptionId, { name: string; brief: string }>;
  headlines: Record<HeadlineKey, (context: HeadlineContext) => string>;
};
