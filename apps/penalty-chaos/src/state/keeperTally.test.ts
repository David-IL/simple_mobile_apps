import { describe, expect, it } from "vitest";
import { applyShot, parseRecord, savePercent, tallyFor } from "./keeperTally";
import type { KeeperRecord } from "./keeperTally";

describe("applyShot", () => {
  it("counts every shot as faced", () => {
    let record: KeeperRecord = {};
    for (const kind of ["goal", "saved", "missed", "blocked"] as const) {
      record = applyShot(record, "wall", kind);
    }
    expect(tallyFor(record, "wall")).toEqual({ faced: 4, conceded: 1 });
  });

  it("only counts goals against the keeper", () => {
    // A shot into row Z was not his doing, and neither was one that hit
    // someone's uncle.
    let record: KeeperRecord = {};
    record = applyShot(record, "statue", "missed");
    record = applyShot(record, "statue", "blocked");
    expect(tallyFor(record, "statue")).toEqual({ faced: 2, conceded: 0 });
  });

  it("keeps keepers separate", () => {
    let record: KeeperRecord = {};
    record = applyShot(record, "wall", "goal");
    record = applyShot(record, "statue", "saved");
    expect(tallyFor(record, "wall")).toEqual({ faced: 1, conceded: 1 });
    expect(tallyFor(record, "statue")).toEqual({ faced: 1, conceded: 0 });
  });

  /**
   * The reported bug, as arithmetic. Five shots, all scored, must read back as
   * five of five — the earlier version dropped the last one because the write
   * happened inside a state updater on a screen that was unmounting.
   */
  it("keeps a whole shootout", () => {
    let record: KeeperRecord = {};
    for (let shot = 0; shot < 5; shot += 1) {
      record = applyShot(record, "mind-reader", "goal");
    }
    const tally = tallyFor(record, "mind-reader");
    expect(tally).toEqual({ faced: 5, conceded: 5 });
    expect(savePercent(tally)).toBe(0);
  });

  it("does not mutate what it was given", () => {
    const before: KeeperRecord = { wall: { faced: 1, conceded: 1 } };
    applyShot(before, "wall", "goal");
    expect(before).toEqual({ wall: { faced: 1, conceded: 1 } });
  });
});

describe("savePercent", () => {
  it("is null before they have ever met", () => {
    expect(savePercent({ faced: 0, conceded: 0 })).toBeNull();
  });

  it("counts everything that is not a goal as a save", () => {
    expect(savePercent({ faced: 4, conceded: 1 })).toBe(75);
    expect(savePercent({ faced: 3, conceded: 3 })).toBe(0);
    expect(savePercent({ faced: 3, conceded: 0 })).toBe(100);
  });

  it("rounds", () => {
    expect(savePercent({ faced: 3, conceded: 1 })).toBe(67);
  });
});

describe("parseRecord", () => {
  it("reads back what was written", () => {
    const record = applyShot({}, "veteran", "goal");
    expect(parseRecord(JSON.stringify(record))).toEqual(record);
  });

  it("survives nonsense rather than taking the app down with it", () => {
    expect(parseRecord(null)).toEqual({});
    expect(parseRecord("not json")).toEqual({});
    expect(parseRecord("[1,2,3]")).toEqual({});
    expect(parseRecord('{"wall":"nope"}')).toEqual({});
    expect(parseRecord('{"wall":{"faced":2}}')).toEqual({});
  });
});
