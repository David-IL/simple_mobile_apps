import { describe, expect, it } from "vitest";
import {
  ANSWER_SLOT_MS,
  AUDIO_LATENCY_MS,
  EARLY_GRACE_MS,
  HIT_GAP_MS,
  MAX_CYCLES,
  MISSES_TO_END,
  REST_FLOOR_MS,
  REST_START_MS,
  SHOUT_MS,
  answer,
  answerBeatMs,
  answerClosesMs,
  answerOpensMs,
  armDurationMs,
  cycleMs,
  endCycle,
  restMs,
  startRow,
  totalMs,
} from "./row";

describe("the measured shape of the row", () => {
  it("keeps the beat constant — that is the whole point", () => {
    // 45 gaps measured across two run-throughs: median 0.400s, p25 0.37, p75
    // 0.44, from the slowest cycle to the fastest. Nothing here may make the
    // beat a function of the cycle index.
    expect(HIT_GAP_MS).toBe(400);
    expect(ANSWER_SLOT_MS).toBe(HIT_GAP_MS * 2);
  });

  it("fills to the beat, not to the moment the gate opens", () => {
    // The two were the same number once, and that is how EARLY_GRACE_MS ended
    // up moving the *visual* target as well as the gate: the ring closed a full
    // grace period before the drum, so a player following it shouted early on
    // every cycle. The fill has to point at the beat.
    expect(armDurationMs()).toBe(answerBeatMs());
    expect(armDurationMs()).toBe(ANSWER_SLOT_MS + AUDIO_LATENCY_MS);
  });

  it("keeps the grace invisible - the gate opens before the ring closes", () => {
    // Forgiveness the player can see is not forgiveness, it is an instruction.
    // The gate has to open first and say nothing about it.
    expect(armDurationMs() - answerOpensMs()).toBe(EARLY_GRACE_MS);
    expect(answerOpensMs()).toBeLessThan(armDurationMs());
  });

  it("starts filling from the top of the cycle, not from the second drum", () => {
    // The fill spans both drums, so the player sees the beat approaching rather
    // than being told about it after the fact.
    expect(armDurationMs()).toBeGreaterThan(HIT_GAP_MS + AUDIO_LATENCY_MS);
  });

  it("opens the window a touch before the answer is due", () => {
    // Anticipating the beat is rewarded, not swallowed.
    expect(ANSWER_SLOT_MS + AUDIO_LATENCY_MS - answerOpensMs()).toBe(EARLY_GRACE_MS);
  });

  it("keeps the shout inside the rest, so it never covers the next count-in", () => {
    // The clip is 640ms and it was once up against a 500ms floor. Every legal
    // tap at the fast end therefore ran over the next cycle's drums, which is
    // why the two-beat call stopped sounding like two beats late in a row.
    //
    // Cutting the shout down to fit sounded thin in play, so the floor moved
    // instead. This pair of assertions is the contract between them: whichever
    // one someone changes next, the other has to follow.
    expect(SHOUT_MS).toBeLessThanOrEqual(REST_FLOOR_MS);

    // The property that actually matters, at the fastest cycle there is: a
    // player who answers *on the beat* must hear their shout finish before the
    // next count-in starts. A tap at the very close of the window will still
    // spill over, but that player was late already - the beat is the contract.
    const fastest = cycleMs(MAX_CYCLES - 1);
    expect(armDurationMs() + SHOUT_MS).toBeLessThanOrEqual(fastest);
    expect(answerOpensMs() + SHOUT_MS).toBeLessThanOrEqual(fastest);
  });

  it("accelerates by shortening the rest, not the beat", () => {
    const rests = Array.from({ length: MAX_CYCLES }, (_, cycle) => restMs(cycle));
    expect(rests[0]).toBe(REST_START_MS);
    for (let i = 1; i < rests.length; i += 1) {
      const previous = rests[i - 1] ?? 0;
      const current = rests[i] ?? 0;
      // Strictly shorter every cycle until it lands on the floor, then flat.
      // Written against the floor rather than against a fixed count so that
      // moving REST_FLOOR_MS re-tunes the test instead of breaking it.
      if (previous > REST_FLOOR_MS) expect(current).toBeLessThan(previous);
      else expect(current).toBe(REST_FLOOR_MS);
    }
  });

  it("spends the acceleration rather than slamming into the floor", () => {
    // The ramp is the whole feel, so it has to survive a change of floor. When
    // REST_FLOOR_MS went up, REST_DECAY had to go up with it or the rest hit
    // bottom after four cycles and the back half was one flat tempo.
    const rests = Array.from({ length: MAX_CYCLES }, (_, cycle) => restMs(cycle));
    expect(new Set(rests).size).toBeGreaterThanOrEqual(6);
  });

  it("settles at a floor rather than collapsing to nothing", () => {
    expect(restMs(0)).toBe(REST_START_MS);
    expect(restMs(MAX_CYCLES - 1)).toBe(REST_FLOOR_MS);
    expect(restMs(999)).toBe(REST_FLOOR_MS);
  });

  it("runs about twenty seconds, which is the budget", () => {
    // Thirty was the first cut and it dragged. The cap is what enforces this,
    // so the test guards the cap rather than trusting the constants.
    const seconds = totalMs() / 1000;
    expect(seconds).toBeGreaterThan(17);
    expect(seconds).toBeLessThan(23);
  });

  it("shrinks the answer window without ever making it tight", () => {
    // 266ms of measured tap scatter on the phone. Even the last, meanest window
    // has to stay comfortably wider than that or the row starts feeling rigged.
    const last = answerClosesMs(MAX_CYCLES - 1) - answerOpensMs();
    expect(answerClosesMs(0) - answerOpensMs()).toBeGreaterThan(last);
    // Wider than the 266ms scatter the phone actually produces, with margin.
    // The rest floor is what buys this, so lowering the floor breaks the test
    // rather than quietly making the endgame unfair.
    expect(last).toBeGreaterThan(400);
  });

  it("closes the window exactly when the next cycle starts", () => {
    expect(answerClosesMs(3)).toBe(cycleMs(3));
  });
});

describe("answering", () => {
  it("counts a stroke and clears the miss streak", () => {
    const state = answer({ ...startRow(), misses: 1 });
    expect(state.strokes).toBe(1);
    expect(state.misses).toBe(0);
    expect(state.answeredThisCycle).toBe(true);
  });

  it("ignores extra taps in the same cycle rather than punishing them", () => {
    // Hammering the button is what a child does when it is working.
    const once = answer(startRow());
    expect(answer(answer(once)).strokes).toBe(1);
  });

  it("does nothing once the row is over", () => {
    const dead = { ...startRow(), over: true };
    expect(answer(dead)).toEqual(dead);
  });
});

describe("ending", () => {
  it("survives a single miss", () => {
    const state = endCycle(startRow());
    expect(state.misses).toBe(1);
    expect(state.over).toBe(false);
  });

  it("ends on two misses in a row", () => {
    const state = endCycle(endCycle(startRow()));
    expect(state.misses).toBe(MISSES_TO_END);
    expect(state.over).toBe(true);
  });

  it("forgives a miss that was answered for", () => {
    // miss, answer, miss — never two consecutive, so the row goes on.
    let state = endCycle(startRow());
    state = endCycle(answer(state));
    state = endCycle(state);
    expect(state.misses).toBe(1);
    expect(state.over).toBe(false);
  });

  it("stops at the cap even if every cycle is answered", () => {
    let state = startRow();
    for (let i = 0; i < MAX_CYCLES; i += 1) state = endCycle(answer(state));
    expect(state.strokes).toBe(MAX_CYCLES);
    expect(state.over).toBe(true);
  });

  it("keeps the score after it is over", () => {
    let state = answer(startRow());
    state = endCycle(state);
    state = endCycle(endCycle(state));
    expect(state.over).toBe(true);
    expect(state.strokes).toBe(1);
  });
});
