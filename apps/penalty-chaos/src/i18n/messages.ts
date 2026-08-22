import type { TraitId } from "../game/keepers";
import type { DisruptionId, HeadlineKey, KeeperId, ShotResultKind } from "../game/types";

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
