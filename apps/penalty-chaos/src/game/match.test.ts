import { describe, expect, it } from "vitest";
import {
  currentPlayer,
  isOver,
  isSuddenDeath,
  newMatch,
  recordShot,
  scoreOf,
  winner,
  zoneHistory,
  type MatchState,
} from "./match";
import type { ShotResultKind, Zone } from "./types";

const players: [string, string] = ["A", "B"];

/** Play a run of shots, alternating exactly as the match rules say to. */
function play(state: MatchState, kinds: ShotResultKind[], zone: Zone = "left-low"): MatchState {
  return kinds.reduce(
    (current, kind) => recordShot(current, kind, kind === "missed" ? null : zone),
    state,
  );
}

describe("solo", () => {
  it("runs for exactly five shots", () => {
    const state = play(newMatch("solo", players), ["goal", "saved", "goal", "missed"]);
    expect(isOver(state)).toBe(false);
    expect(isOver(play(state, ["goal"]))).toBe(true);
  });

  it("counts only goals", () => {
    const state = play(newMatch("solo", players), ["goal", "saved", "blocked", "missed", "goal"]);
    expect(scoreOf(state, 0)).toBe(2);
    expect(winner(state)).toBeNull();
  });
});

describe("duel", () => {
  it("alternates takers", () => {
    let state = newMatch("duel", players);
    expect(currentPlayer(state)).toBe(0);
    state = recordShot(state, "goal", "left-low");
    expect(currentPlayer(state)).toBe(1);
    state = recordShot(state, "saved", "left-low");
    expect(currentPlayer(state)).toBe(0);
  });

  it("stops early once the trailing player cannot catch up", () => {
    // A scores three, B misses three: 3-0 with two each left is unrecoverable.
    const state = play(newMatch("duel", players), [
      "goal",
      "saved",
      "goal",
      "saved",
      "goal",
      "saved",
    ]);
    expect(scoreOf(state, 0)).toBe(3);
    expect(scoreOf(state, 1)).toBe(0);
    expect(isOver(state)).toBe(true);
    expect(winner(state)).toBe(0);
  });

  it("plays all ten when it stays close", () => {
    const kinds: ShotResultKind[] = [
      "goal",
      "goal",
      "goal",
      "goal",
      "saved",
      "saved",
      "goal",
      "goal",
      "saved",
    ];
    const state = play(newMatch("duel", players), kinds);
    expect(isOver(state)).toBe(false);
    expect(isSuddenDeath(state)).toBe(false);
  });

  it("goes to sudden death when the five are level, and only ends on a complete pair", () => {
    const level: ShotResultKind[] = [
      "goal",
      "goal",
      "goal",
      "goal",
      "saved",
      "saved",
      "saved",
      "saved",
      "goal",
      "goal",
    ];
    let state = play(newMatch("duel", players), level);
    expect(scoreOf(state, 0)).toBe(3);
    expect(scoreOf(state, 1)).toBe(3);
    expect(isSuddenDeath(state)).toBe(true);
    expect(isOver(state)).toBe(false);

    // A scores: still not over, B has not answered yet.
    state = recordShot(state, "goal", "left-low");
    expect(isOver(state)).toBe(false);

    // B misses: now the pair is complete and A has won it.
    state = recordShot(state, "saved", "left-low");
    expect(isOver(state)).toBe(true);
    expect(winner(state)).toBe(0);
  });
});

describe("zoneHistory", () => {
  it("keeps only this player's shots, in order", () => {
    let state = newMatch("duel", players);
    state = recordShot(state, "goal", "left-low");
    state = recordShot(state, "goal", "right-high");
    state = recordShot(state, "saved", "centre-low");
    expect(zoneHistory(state, 0)).toEqual(["left-low", "centre-low"]);
    expect(zoneHistory(state, 1)).toEqual(["right-high"]);
  });

  it("drops misses — a shot into row Z says nothing about placement", () => {
    let state = newMatch("solo", players);
    state = recordShot(state, "goal", "left-low");
    state = recordShot(state, "missed", null);
    expect(zoneHistory(state, 0)).toEqual(["left-low"]);
  });
});
