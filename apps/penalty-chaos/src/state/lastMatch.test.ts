import { describe, expect, it } from "vitest";
import { parseLastMatch } from "./lastMatch";

/**
 * The home screen renders a keeper's face, name and form straight off this
 * value, so anything that is not a complete, recognisable fixture has to read
 * back as "no last match" rather than as a partly-filled one.
 */
describe("parseLastMatch", () => {
  it("reads back a stored fixture", () => {
    expect(parseLastMatch('{"mode":"duel","keeperId":"wall","takers":["Ada","Bo"]}')).toEqual({
      mode: "duel",
      keeperId: "wall",
      takers: ["Ada", "Bo"],
    });
  });

  it("keeps the empty second name solo matches store", () => {
    expect(parseLastMatch('{"mode":"solo","keeperId":"statue","takers":["Ada",""]}')).toEqual({
      mode: "solo",
      keeperId: "statue",
      takers: ["Ada", ""],
    });
  });

  it("has nothing to say before a first match", () => {
    expect(parseLastMatch(null)).toBeNull();
    expect(parseLastMatch("")).toBeNull();
  });

  it("rejects a keeper who is no longer in the roster", () => {
    // Deleting a keeper must not strand the home screen on a face that cannot
    // be drawn — the badger is the precedent for a keeper simply going away.
    expect(parseLastMatch('{"mode":"solo","keeperId":"badger","takers":["Ada",""]}')).toBeNull();
  });

  it("rejects a mode that is not a mode", () => {
    expect(parseLastMatch('{"mode":"tournament","keeperId":"wall","takers":["Ada","Bo"]}')).toBeNull();
  });

  it("rejects malformed or missing takers", () => {
    expect(parseLastMatch('{"mode":"duel","keeperId":"wall"}')).toBeNull();
    expect(parseLastMatch('{"mode":"duel","keeperId":"wall","takers":["Ada"]}')).toBeNull();
    expect(parseLastMatch('{"mode":"duel","keeperId":"wall","takers":["Ada",7]}')).toBeNull();
    expect(parseLastMatch('{"mode":"duel","keeperId":"wall","takers":"Ada"}')).toBeNull();
  });

  it("survives nonsense rather than taking the home screen down with it", () => {
    expect(parseLastMatch("not json")).toBeNull();
    expect(parseLastMatch("null")).toBeNull();
    expect(parseLastMatch("[1,2,3]")).toBeNull();
  });
});
