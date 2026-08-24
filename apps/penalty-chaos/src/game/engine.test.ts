import { describe, expect, it } from "vitest";
import { NO_EFFECT, effectFor } from "./disruptions";
import {
  aimFromDrag,
  areAdjacent,
  chooseDive,
  chooseTell,
  readablePattern,
  resolveShot,
  zoneOf,
} from "./engine";
import { keeperById } from "./keepers";
import type { KeeperArchetype, Rng, RoundSetup, Zone } from "./types";

/** Deterministic rng: replays the given values, then repeats the last one. */
function scriptedRng(values: number[]): Rng {
  let index = 0;
  return () => {
    const value = values[Math.min(index, values.length - 1)] ?? 0;
    index += 1;
    return value;
  };
}

const baseKeeper: KeeperArchetype = { ...keeperById("veteran"), tauntRate: 0 };

function setupWith(overrides: Partial<RoundSetup> = {}): RoundSetup {
  return {
    disruption: null,
    effect: NO_EFFECT,
    keeperDive: "left-low",
    keeperTell: null,
    ...overrides,
  };
}

describe("zoneOf", () => {
  it("splits the goal into six zones", () => {
    expect(zoneOf({ x: -0.8, y: 0.2 })).toBe("left-low");
    expect(zoneOf({ x: -0.8, y: 0.8 })).toBe("left-high");
    expect(zoneOf({ x: 0, y: 0.2 })).toBe("centre-low");
    expect(zoneOf({ x: 0.8, y: 0.8 })).toBe("right-high");
  });

  it("returns null when the ball never reached the goal", () => {
    expect(zoneOf({ x: 1.2, y: 0.5 })).toBeNull();
    expect(zoneOf({ x: 0, y: 1.4 })).toBeNull();
    expect(zoneOf({ x: 0, y: -0.1 })).toBeNull();
  });
});

describe("areAdjacent", () => {
  it("counts neighbouring columns and the zone above or below", () => {
    expect(areAdjacent("left-low", "centre-low")).toBe(true);
    expect(areAdjacent("left-low", "left-high")).toBe(true);
  });

  it("excludes itself, diagonals, and the far post", () => {
    expect(areAdjacent("left-low", "left-low")).toBe(false);
    expect(areAdjacent("left-low", "centre-high")).toBe(false);
    expect(areAdjacent("left-low", "right-low")).toBe(false);
  });
});

describe("aimFromDrag", () => {
  it("turns an upward drag into an upward aim", () => {
    const { aim, power } = aimFromDrag(0, -160, 160);
    expect(power).toBe(1);
    expect(aim.y).toBeGreaterThan(0);
    expect(aim.x).toBeCloseTo(0);
  });

  it("caps power, and pulls the aim in with it", () => {
    const full = aimFromDrag(-100, -100, 160);
    const capped = aimFromDrag(-100, -100, 160, 0.4);
    expect(capped.power).toBe(0.4);
    // The muddy-spot cap has to shorten the shot as well as weaken it, or the
    // preview would promise a corner the engine will not deliver.
    expect(Math.abs(capped.aim.x)).toBeLessThan(Math.abs(full.aim.x));
  });

  it("treats a zero drag as no shot", () => {
    expect(aimFromDrag(0, 0, 160)).toEqual({ aim: { x: 0, y: 0 }, power: 0 });
  });
});

describe("readablePattern", () => {
  it("reads a genuine repeat", () => {
    expect(readablePattern(["left-low", "right-high", "left-low"])).toBe("left-low");
    expect(readablePattern(["left-low", "left-low"])).toBe("left-low");
  });

  /**
   * The regression that matters. This was found on a real phone: after three
   * shots in one corner the keeper read it correctly, but on switching corners
   * it was already waiting there on the second shot. The old tie-break picked
   * the most recent zone, so with no real pattern the keeper simply shadowed
   * your last shot — beatable by one trivial rule, "never shoot where you just
   * shot", which collapsed the hardest keeper in the roster.
   */
  it("refuses to read a player who is not repeating", () => {
    expect(readablePattern(["left-low", "right-high"])).toBeNull();
    expect(readablePattern(["left-low", "right-high", "left-low", "right-high"])).toBeNull();
  });

  it("needs more than one sighting", () => {
    expect(readablePattern([])).toBeNull();
    expect(readablePattern(["centre-low"])).toBeNull();
  });

  it("needs an outright leader, not a joint one", () => {
    expect(readablePattern(["left-low", "left-low", "right-high", "right-high"])).toBeNull();
    expect(readablePattern(["left-low", "left-low", "right-high"])).toBe("left-low");
  });
});

describe("chooseDive", () => {
  const reader: KeeperArchetype = { ...baseKeeper, readDepth: 3, readAccuracy: 1 };

  it("goes where you keep putting it — the core mechanic", () => {
    expect(chooseDive(reader, ["right-high", "right-high"], NO_EFFECT, scriptedRng([0]))).toBe(
      "right-high",
    );
  });

  /** The Mind-Reader's real configuration, which is where this was reported. */
  const mindReader: KeeperArchetype = {
    ...keeperById("mind-reader"),
    readAccuracy: 1,
    tauntRate: 0,
  };

  it("guesses against an alternating player instead of shadowing them", () => {
    const alternating: Zone[] = ["left-low", "right-high", "left-low", "right-high"];
    // A shadowing keeper would return "right-high" — the last shot. The random
    // branch with rng()=0 lands on centre-low (stillChance is checked first,
    // and 0 is below any positive stillChance), proving the read did not fire.
    expect(chooseDive(mindReader, alternating, NO_EFFECT, scriptedRng([0]))).toBe("centre-low");
  });

  it("does not jump straight onto a corner you have only just switched to", () => {
    // Reported from a real device: three shots in one corner, then a switch, and
    // the keeper was waiting in the new corner on the very next shot.
    const settled: Zone[] = ["left-low", "left-low", "left-low"];
    expect(chooseDive(mindReader, settled, NO_EFFECT, scriptedRng([0]))).toBe("left-low");

    // First shot at the new corner: the old habit still dominates the window.
    const justSwitched: Zone[] = [...settled, "right-high"];
    expect(chooseDive(mindReader, justSwitched, NO_EFFECT, scriptedRng([0]))).toBe("left-low");

    // Second shot at the new corner: window is 2-2, so there is no pattern to
    // read and the keeper has to guess (centre-low, per rng()=0 below)
    // rather than sit on either corner.
    const twiceThere: Zone[] = [...justSwitched, "right-high"];
    expect(chooseDive(mindReader, twiceThere, NO_EFFECT, scriptedRng([0]))).toBe("centre-low");

    // Third shot there is a genuine new habit, and it gets punished.
    const newHabit: Zone[] = [...twiceThere, "right-high"];
    expect(chooseDive(mindReader, newHabit, NO_EFFECT, scriptedRng([0]))).toBe("right-high");
  });

  it("only reads as far back as readDepth", () => {
    const shallow: KeeperArchetype = { ...reader, readDepth: 2 };
    const history: Zone[] = ["left-low", "left-low", "centre-high", "centre-high"];
    expect(chooseDive(shallow, history, NO_EFFECT, scriptedRng([0]))).toBe("centre-high");
  });

  it("cannot read you at all with no history", () => {
    expect(chooseDive(reader, [], NO_EFFECT, scriptedRng([0.5]))).toBeTruthy();
  });

  it("can be stopped from reading at all", () => {
    // No disruption currently zeroes readDepthMultiplier — the badger that did
    // was cut after playtesting, because "the keeper has quietly stopped reading
    // you" is an effect with nothing visible to show for it. The engine still
    // supports it, and this keeps that honest for the next gag that wants it.
    const distracted = { ...NO_EFFECT, readDepthMultiplier: 0 };
    const history: Zone[] = ["right-high", "right-high", "right-high"];
    expect(chooseDive(reader, history, distracted, scriptedRng([0]))).toBe("centre-low");
  });

  /**
   * The Statue's whole blurb is "does not move" — reported from real play as
   * false, because `stillChance` did not exist yet and every keeper committed
   * to a side on the same roll this one uses. r=0.1 is below the roster
   * default (0.22) *and* below the Statue's real 0.75, so on its own this
   * would only prove both configs land on centre — the `mover` case (0
   * stillChance) is what proves the gate is actually being checked at all.
   */
  it("stillChance keeps a keeper in place on a roll that would send a zero-stillChance keeper to a side", () => {
    const mover: KeeperArchetype = { ...baseKeeper, diveBias: 0, stillChance: 0 };
    expect(chooseDive(mover, [], NO_EFFECT, scriptedRng([0.1]))).toBe("left-low");

    const statueLike: KeeperArchetype = { ...baseKeeper, diveBias: 0, stillChance: 0.75 };
    expect(chooseDive(statueLike, [], NO_EFFECT, scriptedRng([0.1]))).toBe("centre-low");
  });
});

describe("chooseTell", () => {
  it("shows nothing when the keeper never telegraphs", () => {
    const silent: KeeperArchetype = { ...baseKeeper, telegraph: 0 };
    expect(chooseTell(silent, "left-low", NO_EFFECT, scriptedRng([0.99]))).toBeNull();
  });

  it("shows the truth when it always telegraphs and never bluffs", () => {
    const honest: KeeperArchetype = { ...baseKeeper, telegraph: 1, bluffRate: 0 };
    expect(chooseTell(honest, "right-high", NO_EFFECT, scriptedRng([0]))).toBe("right-high");
  });

  it("can point at the wrong corner when it bluffs", () => {
    const liar: KeeperArchetype = { ...baseKeeper, telegraph: 1, bluffRate: 1 };
    const tell = chooseTell(liar, "right-high", NO_EFFECT, scriptedRng([0]));
    expect(tell).not.toBe("right-high");
    expect(tell).not.toBeNull();
  });

  it("is forced into the open by the away end", () => {
    const quiet: KeeperArchetype = { ...baseKeeper, telegraph: 0, bluffRate: 0 };
    const effect = effectFor({ id: "away-end" }, scriptedRng([0]));
    expect(chooseTell(quiet, "centre-low", effect, scriptedRng([0]))).toBe("centre-low");
  });
});

describe("resolveShot", () => {
  // 0.5 twice gives zero scatter, so the ball lands exactly on the aim. This is a
  // factory, not a shared generator — a shared one would be drained by the first test.
  const noScatter = () => scriptedRng([0.5, 0.5, 0.99]);

  it("saves a shot hit straight at the dive", () => {
    const result = resolveShot({
      aim: { x: -0.8, y: 0.2 },
      power: 0.5,
      keeper: baseKeeper,
      setup: setupWith({ keeperDive: "left-low" }),
      rng: noScatter(),
    });
    expect(result.kind).toBe("saved");
    expect(result.headline).toBe("saveGuessed");
    expect(result.zone).toBe("left-low");
  });

  it("scores when the keeper went the other way and cannot reach", () => {
    const result = resolveShot({
      aim: { x: 0.8, y: 0.8 },
      power: 0.5,
      keeper: baseKeeper,
      setup: setupWith({ keeperDive: "left-low" }),
      rng: noScatter(),
    });
    expect(result.kind).toBe("goal");
    expect(result.zone).toBe("right-high");
    expect(result.headline).toBe("goalCornerHigh");
  });

  it("misses when the aim is outside the frame", () => {
    const result = resolveShot({
      aim: { x: 1.4, y: 0.5 },
      power: 1,
      keeper: baseKeeper,
      setup: setupWith(),
      rng: noScatter(),
    });
    expect(result.kind).toBe("missed");
    expect(result.zone).toBeNull();
    expect(result.headline).toBe("missWideRight");
  });

  it("hits the pitch invader before the keeper gets involved", () => {
    const result = resolveShot({
      aim: { x: 0.8, y: 0.8 },
      power: 0.5,
      keeper: baseKeeper,
      // Keeper dove elsewhere: without the invader this is a goal.
      setup: setupWith({
        keeperDive: "left-low",
        effect: { ...NO_EFFECT, blockedCol: "right" },
      }),
      rng: noScatter(),
    });
    expect(result.kind).toBe("blocked");
  });

  it("lets a long reach claw back an adjacent shot", () => {
    const stretchy: KeeperArchetype = { ...baseKeeper, reach: 1 };
    const result = resolveShot({
      aim: { x: 0, y: 0.2 },
      power: 0.5,
      keeper: stretchy,
      setup: setupWith({ keeperDive: "left-low" }),
      rng: scriptedRng([0.5, 0.5, 0]),
    });
    expect(result.kind).toBe("saved");
    expect(result.headline).toBe("saveFingertips");
  });

  it("blows the ball sideways in a crosswind", () => {
    const drifted = resolveShot({
      aim: { x: 0, y: 0.2 },
      power: 0.5,
      keeper: baseKeeper,
      setup: setupWith({ effect: { ...NO_EFFECT, windX: 0.6 } }),
      rng: noScatter(),
    });
    expect(drifted.landing.x).toBeCloseTo(0.6);
    expect(drifted.zone).toBe("right-low");
  });

  it("honours the muddy-spot power cap when working out scatter", () => {
    const wild = scriptedRng([1, 1, 0.99]);
    const uncapped = resolveShot({
      aim: { x: 0, y: 0.5 },
      power: 1,
      keeper: baseKeeper,
      setup: setupWith(),
      rng: wild,
    });
    const capped = resolveShot({
      aim: { x: 0, y: 0.5 },
      power: 1,
      keeper: baseKeeper,
      setup: setupWith({ effect: { ...NO_EFFECT, powerCap: 0.2 } }),
      rng: scriptedRng([1, 1, 0.99]),
    });
    expect(Math.abs(capped.landing.x)).toBeLessThan(Math.abs(uncapped.landing.x));
  });
});
