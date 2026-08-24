import { describe, expect, it } from "vitest";
import {
  FORM_WINDOW,
  applyShot,
  parseRecord,
  recentForm,
  recentScored,
  savePercent,
  tallyFor,
} from "./keeperTally";
import type { KeeperRecord } from "./keeperTally";

describe("applyShot", () => {
  it("counts every shot as faced", () => {
    let record: KeeperRecord = {};
    for (const kind of ["goal", "saved", "missed", "blocked"] as const) {
      record = applyShot(record, "wall", kind);
    }
    expect(tallyFor(record, "wall")).toEqual({
      faced: 4,
      conceded: 1,
      recent: ["goal", "saved", "missed", "blocked"],
    });
  });

  it("only counts goals against the keeper", () => {
    // A shot into row Z was not his doing, and neither was one that hit
    // someone's uncle.
    let record: KeeperRecord = {};
    record = applyShot(record, "statue", "missed");
    record = applyShot(record, "statue", "blocked");
    expect(tallyFor(record, "statue")).toEqual({
      faced: 2,
      conceded: 0,
      recent: ["missed", "blocked"],
    });
  });

  it("keeps keepers separate", () => {
    let record: KeeperRecord = {};
    record = applyShot(record, "wall", "goal");
    record = applyShot(record, "statue", "saved");
    expect(tallyFor(record, "wall")).toEqual({ faced: 1, conceded: 1, recent: ["goal"] });
    expect(tallyFor(record, "statue")).toEqual({ faced: 1, conceded: 0, recent: ["saved"] });
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
    expect(tally).toEqual({
      faced: 5,
      conceded: 5,
      recent: ["goal", "goal", "goal", "goal", "goal"],
    });
    expect(savePercent(tally)).toBe(0);
  });

  it("does not mutate what it was given", () => {
    const before: KeeperRecord = { wall: { faced: 1, conceded: 1, recent: ["goal"] } };
    applyShot(before, "wall", "goal");
    expect(before).toEqual({ wall: { faced: 1, conceded: 1, recent: ["goal"] } });
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

describe("recent form", () => {
  it("keeps the newest outcomes and drops the oldest", () => {
    let record: KeeperRecord = {};
    for (let shot = 0; shot < FORM_WINDOW + 3; shot += 1) {
      record = applyShot(record, "wall", shot < 3 ? "goal" : "saved");
    }
    const tally = tallyFor(record, "wall");
    expect(tally.faced).toBe(FORM_WINDOW + 3);
    expect(tally.recent).toHaveLength(FORM_WINDOW);
    // The three early goals have aged out of the window entirely.
    expect(tally.recent.every((kind) => kind === "saved")).toBe(true);
  });

  it("shows the last five, oldest first", () => {
    let record: KeeperRecord = {};
    for (const kind of ["goal", "saved", "goal", "missed", "goal", "blocked"] as const) {
      record = applyShot(record, "veteran", kind);
    }
    expect(recentForm(tallyFor(record, "veteran"))).toEqual([
      "saved",
      "goal",
      "missed",
      "goal",
      "blocked",
    ]);
  });

  it("counts only goals as scored, and only inside the window", () => {
    let record: KeeperRecord = {};
    // Six shots: the opening goal falls outside a five-shot window.
    for (const kind of ["goal", "saved", "saved", "goal", "saved", "saved"] as const) {
      record = applyShot(record, "statue", kind);
    }
    expect(recentScored(tallyFor(record, "statue"))).toBe(1);
  });

  it("is empty before they have ever met", () => {
    expect(recentForm(tallyFor({}, "sunday"))).toEqual([]);
    expect(recentScored(tallyFor({}, "sunday"))).toBe(0);
  });
});

describe("parseRecord form migration", () => {
  it("keeps the career counters of a record written before form existed", () => {
    // Every record already on a phone looks like this. Losing the career total
    // to gain a form list would be a bad trade, and a silent one.
    expect(parseRecord('{"wall":{"faced":12,"conceded":4}}')).toEqual({
      wall: { faced: 12, conceded: 4, recent: [] },
    });
  });

  it("drops junk inside the form list without dropping the tally", () => {
    expect(parseRecord('{"wall":{"faced":2,"conceded":1,"recent":["goal","nope",7]}}')).toEqual({
      wall: { faced: 2, conceded: 1, recent: ["goal"] },
    });
  });

  it("survives a form list that is not a list", () => {
    expect(parseRecord('{"wall":{"faced":2,"conceded":1,"recent":"goal"}}')).toEqual({
      wall: { faced: 2, conceded: 1, recent: [] },
    });
  });
});
