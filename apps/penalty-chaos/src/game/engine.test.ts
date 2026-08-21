import { describe, expect, it } from "vitest";
import { NO_EFFECT, effectFor } from "./disruptions";
import {
  aimFromDrag,
  areAdjacent,
  chooseDive,
  chooseTell,
  favouriteZone,
  resolveShot,
  zoneOf,
} from "./engine";
import { keeperById } from "./keepers";
import type { Disruption, KeeperArchetype, Rng, RoundSetup, Zone } from "./types";

/** Deterministic rng: replays the given values, then repeats the last one. */
function scriptedRng(values: number[]): Rng {
  let index = 0;
  return () => {
    const value = values[Math.min(index, values.length - 1)] ?? 0;
    index += 1;
    return value;
  };
}

const baseKeeper: KeeperArchetype = {
  ...keeperById("veteran"),
  taunts: [],
  tauntRate: 0,
};

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

describe("favouriteZone", () => {
  it("finds the most repeated zone", () => {
    expect(favouriteZone(["left-low", "right-high", "left-low"])).toBe("left-low");
  });

  it("breaks ties toward the most recent", () => {
    expect(favouriteZone(["left-low", "right-high"])).toBe("right-high");
  });

  it("has nothing to say about an empty history", () => {
    expect(favouriteZone([])).toBeNull();
  });
});

describe("chooseDive", () => {
  const reader: KeeperArchetype = { ...baseKeeper, readDepth: 3, readAccuracy: 1 };

  it("goes where you keep putting it — the core mechanic", () => {
    const history: Zone[] = ["right-high", "right-high"];
    expect(chooseDive(reader, history, NO_EFFECT, scriptedRng([0]))).toBe("right-high");
  });

  it("only reads as far back as readDepth", () => {
    const shallow: KeeperArchetype = { ...reader, readDepth: 1 };
    const history: Zone[] = ["left-low", "left-low", "centre-high"];
    expect(chooseDive(shallow, history, NO_EFFECT, scriptedRng([0]))).toBe("centre-high");
  });

  it("cannot read you at all with no history", () => {
    // Falls through to the weighted random branch rather than throwing.
    expect(chooseDive(reader, [], NO_EFFECT, scriptedRng([0.5]))).toBeTruthy();
  });

  it("is distracted by the mascot", () => {
    const effect = effectFor({ id: "mascot" } as Disruption, scriptedRng([0]));
    const history: Zone[] = ["right-high", "right-high", "right-high"];
    // readDepthMultiplier 0 means the pattern is ignored; a dive to the far side
    // is only reachable through the random branch.
    expect(chooseDive(reader, history, effect, scriptedRng([0]))).toBe("left-low");
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
    const effect = effectFor({ id: "away-end" } as Disruption, scriptedRng([0]));
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
    expect(result.headline).toContain("Wide");
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
    expect(result.headline).toContain("Fingertips");
  });

  it("blows the ball sideways in a crosswind", () => {
    const straight = { aim: { x: 0, y: 0.2 }, power: 0.5 };
    const drifted = resolveShot({
      ...straight,
      keeper: baseKeeper,
      setup: setupWith({ effect: { ...NO_EFFECT, windX: 0.6 } }),
      rng: noScatter(),
    });
    expect(drifted.landing.x).toBeCloseTo(0.6);
    expect(drifted.zone).toBe("right-low");
  });

  it("honours the muddy-spot power cap when working out scatter", () => {
    // Same aim and rng, but a capped power must not scatter like a full-power shot.
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
      rng: wild,
    });
    expect(Math.abs(capped.landing.x)).toBeLessThan(Math.abs(uncapped.landing.x));
  });
});
