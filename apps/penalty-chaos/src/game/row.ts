/**
 * The Viking row, as timing and rules. No React, no sound, no copy.
 *
 * Every constant here was **measured** off a real two-minute recording of the
 * row rather than invented — see assets/sfx/README.md and
 * docs/research/viking-row.md. The two findings that shaped the whole design:
 *
 * 1. **The beat never accelerates.** Across 45 measured gaps spanning two full
 *    run-throughs, the hits sit 0.40s apart (p25 0.37, p75 0.44) from the first
 *    lazy cycle to the last frantic one.
 * 2. **What accelerates is the rest between cycles** — 10.1s, 6.1, 5.1, 4.2,
 *    2.7, 1.8, 1.1, 0.95, 0.92. The row gets wild because it *restarts sooner*,
 *    not because the drum speeds up.
 *
 * That is why this is not a rhythm game. The phone measured 266ms of tap
 * scatter, which is nearly triple the point at which a timing window stops
 * feeling fair, so **nothing here scores accuracy**. The crowd plays two beats,
 * the player answers with RO before the next cycle starts, and the shout fires
 * on the tap rather than on a grid — you cannot be late against a sound you
 * trigger yourself.
 */

/** Gap between the two drum beats. Measured, and deliberately constant. */
export const HIT_GAP_MS = 400;

/**
 * When the answer is nominally due — one more beat after the second drum.
 * Used for the crowd animation, never to judge a tap.
 */
export const ANSWER_SLOT_MS = HIT_GAP_MS * 2;

/**
 * How much early is still "on time".
 *
 * The window opens slightly *before* the answer is due so anticipating the beat
 * is rewarded rather than swallowed — with 266ms of measured tap scatter, a
 * window that opens exactly on the slot would eat a lot of honest taps.
 */
export const EARLY_GRACE_MS = 150;

/**
 * How long after `play()` the phone actually makes a noise.
 *
 * This exists because of a bug that took two rounds of playtesting to name. The
 * drums are *scheduled* on the JS clock but *heard* some milliseconds later,
 * while the button's highlight is seen the instant it is drawn. Putting the
 * highlight on the audio clock therefore made it appear only
 * `HIT_GAP_MS - AUDIO_LATENCY_MS` after the drum the player actually heard —
 * visibly early, and it pulled people out of sync exactly as reported.
 *
 * So everything the *player* is timed against lives on a "heard clock" that
 * runs this much behind the audio one.
 *
 * **The number is deliberately no longer critical.** Tuning it by hand failed
 * twice — 0 read as early, 180 read as late, and each attempt just moved a
 * blink to the other side of the player's thumb. A single instant that flips
 * has to be right to within a few tens of milliseconds or it feels wrong, and
 * there is no API that reports output latency. The fix was to stop using an
 * instant: the button now *fills* toward the answer, so being a little out
 * shifts a gradient rather than misplacing a flash. This value only sets where
 * that fill completes.
 */
export const AUDIO_LATENCY_MS = 90;

/** The real recording opens with a ~10s rest. In a game that is dead air. */
export const REST_START_MS = 1500;
/**
 * The floor is set by the phone, not by taste: it has to leave a window
 * comfortably wider than the 266ms of tap scatter measured on the device, or
 * the last cycles start feeling rigged. A test pins that.
 */
export const REST_FLOOR_MS = 500;
export const REST_DECAY = 0.85;

/**
 * Hard cap, which is what holds the whole thing to about twenty seconds — see
 * `totalMs`. A row that never ends is a row nobody finishes, and the first cut
 * at thirty seconds outstayed its welcome in play.
 */
export const MAX_CYCLES = 13;

/** One miss is bad luck. Two in a row is the crowd losing it. */
export const MISSES_TO_END = 2;

/** How long the crowd waits before starting the next cycle. */
export function restMs(cycle: number): number {
  return Math.max(REST_FLOOR_MS, Math.round(REST_START_MS * REST_DECAY ** cycle));
}

/** Beat, beat, the answer slot, then the rest. */
export function cycleMs(cycle: number): number {
  return ANSWER_SLOT_MS + restMs(cycle);
}

/**
 * When a tap starts counting, measured from the start of the cycle.
 *
 * Just before the answer is due, not on the second drum. The first version
 * opened on the second beat, which lit the button in time with the *drum* — and
 * a lit button is an instruction, so it taught the thumb the wrong beat and
 * pulled players out of sync. The lesson is the badger's, again: what the player
 * sees has to line up with what the game means.
 *
 * It closes when the next cycle begins, so the window shrinks as the rest
 * collapses. That shrinking is the entire difficulty curve — there is no
 * precision component anywhere.
 */
export function answerOpensMs(): number {
  return ANSWER_SLOT_MS + AUDIO_LATENCY_MS - EARLY_GRACE_MS;
}

/**
 * How long the button takes to fill, measured from the start of the cycle.
 *
 * It completes exactly when a tap starts counting, so "full" and "you may
 * answer" are the same statement. A continuous fill replaced a highlight that
 * blinked on at one instant: a blink is either before or after the player's
 * thumb and both read as broken, whereas a gradient that is nearly full when
 * they tap reads as in time even if the estimate above is off by a hundred
 * milliseconds.
 */
export function armDurationMs(): number {
  return answerOpensMs();
}

export function answerClosesMs(cycle: number): number {
  return cycleMs(cycle);
}

/** Total run time if every cycle is answered. Kept honest by a test. */
export function totalMs(cycles: number = MAX_CYCLES): number {
  let total = 0;
  for (let cycle = 0; cycle < cycles; cycle += 1) total += cycleMs(cycle);
  return total;
}

export type RowState = {
  /** Index of the cycle now playing. */
  cycle: number;
  /** Whether the current cycle has already been answered. */
  answeredThisCycle: boolean;
  /** Total cycles answered — the score, and the only number shown. */
  strokes: number;
  /** Consecutive misses. Reset by any answer. */
  misses: number;
  over: boolean;
};

export function startRow(): RowState {
  return { cycle: 0, answeredThisCycle: false, strokes: 0, misses: 0, over: false };
}

/**
 * A tap inside the window. Extra taps in the same cycle are ignored rather than
 * punished — hammering the button is what a child does when it is working.
 */
export function answer(state: RowState): RowState {
  if (state.over || state.answeredThisCycle) return state;
  return {
    ...state,
    answeredThisCycle: true,
    strokes: state.strokes + 1,
    misses: 0,
  };
}

/** The cycle ran out. Move on, or stop. */
export function endCycle(state: RowState): RowState {
  if (state.over) return state;

  const misses = state.answeredThisCycle ? 0 : state.misses + 1;
  const next = state.cycle + 1;
  const over = misses >= MISSES_TO_END || next >= MAX_CYCLES;

  return {
    cycle: next,
    answeredThisCycle: false,
    strokes: state.strokes,
    misses,
    over,
  };
}
