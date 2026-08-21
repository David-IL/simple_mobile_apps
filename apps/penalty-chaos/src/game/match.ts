import type { ShotResultKind, Zone } from "./types";

export type Player = 0 | 1;
export type MatchMode = "solo" | "duel";

export const REGULATION_SHOTS = 5;

export type ShotRecord = {
  player: Player;
  kind: ShotResultKind;
  /** Null when the ball missed the goal entirely. */
  zone: Zone | null;
};

export type MatchState = {
  mode: MatchMode;
  shots: readonly ShotRecord[];
  names: readonly [string, string];
};

export function newMatch(mode: MatchMode, names: readonly [string, string]): MatchState {
  return { mode, shots: [], names };
}

export function takenBy(state: MatchState, player: Player): number {
  return state.shots.filter((shot) => shot.player === player).length;
}

export function scoreOf(state: MatchState, player: Player): number {
  return state.shots.filter((shot) => shot.player === player && shot.kind === "goal").length;
}

/** Solo is one taker. Duel alternates, so the player with fewer taken is up. */
export function currentPlayer(state: MatchState): Player {
  if (state.mode === "solo") return 0;
  return takenBy(state, 0) <= takenBy(state, 1) ? 0 : 1;
}

/**
 * Shots a player still has left in regulation. Used both for the "cannot be
 * caught" early finish and for the round pips in the scoreboard.
 */
function remainingInRegulation(state: MatchState, player: Player): number {
  return Math.max(0, REGULATION_SHOTS - takenBy(state, player));
}

export function isOver(state: MatchState): boolean {
  if (state.mode === "solo") return takenBy(state, 0) >= REGULATION_SHOTS;

  const taken: [number, number] = [takenBy(state, 0), takenBy(state, 1)];
  const scores: [number, number] = [scoreOf(state, 0), scoreOf(state, 1)];
  const bothDone = taken[0] >= REGULATION_SHOTS && taken[1] >= REGULATION_SHOTS;

  if (bothDone) {
    // Sudden death: only judged at the end of a complete pair.
    return taken[0] === taken[1] && scores[0] !== scores[1];
  }

  // Regulation: stop as soon as the trailing player cannot catch up.
  return (
    scores[0] > scores[1] + remainingInRegulation(state, 1) ||
    scores[1] > scores[0] + remainingInRegulation(state, 0)
  );
}

export function isSuddenDeath(state: MatchState): boolean {
  if (state.mode === "solo") return false;
  return takenBy(state, 0) >= REGULATION_SHOTS && takenBy(state, 1) >= REGULATION_SHOTS;
}

/** Null in solo, or on a draw that has not been broken yet. */
export function winner(state: MatchState): Player | null {
  if (state.mode === "solo" || !isOver(state)) return null;
  const [a, b] = [scoreOf(state, 0), scoreOf(state, 1)];
  if (a === b) return null;
  return a > b ? 0 : 1;
}

export function recordShot(
  state: MatchState,
  kind: ShotResultKind,
  zone: Zone | null,
): MatchState {
  return {
    ...state,
    shots: [...state.shots, { player: currentPlayer(state), kind, zone }],
  };
}

/**
 * Zones this player has previously *hit*, oldest first — the keeper's reading
 * material. Misses are excluded: the keeper reads where your shots go, and a
 * shot into row Z says nothing about where you like to place them.
 */
export function zoneHistory(state: MatchState, player: Player): Zone[] {
  return state.shots
    .filter((shot) => shot.player === player && shot.zone !== null)
    .map((shot) => shot.zone as Zone);
}

/** "3 - 2", or "3" in solo. */
export function scoreline(state: MatchState): string {
  if (state.mode === "solo") return `${scoreOf(state, 0)} / ${takenBy(state, 0)}`;
  return `${scoreOf(state, 0)} - ${scoreOf(state, 1)}`;
}
