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
 * How short the rest is allowed to get.
 *
 * Two things set this, and the *larger* of them wins.
 *
 * 1. **The phone.** It has to leave a window comfortably wider than the 266ms
 *    of tap scatter measured on the device, or the last cycles feel rigged.
 * 2. **The shout has to fit inside it.** `SHOUT_MS` is 640ms, and a player who
 *    answers on the beat starts it at `armDurationMs()`. For that to finish
 *    before the next count-in the floor must be at least
 *    `armDurationMs() + SHOUT_MS - ANSWER_SLOT_MS` = 730ms. A test pins it.
 *
 * It was 500ms, which satisfied the first and quietly broke the second: at the
 * fast end there was *no legal tap* whose shout did not run over the next
 * cycle's drums, so the two-beat call stopped reading as two beats. The first
 * attempt at a fix cut the shout down to 370ms to fit the floor; it sounded
 * thin in play, which is the honest answer — the recording is what it is, and
 * a celebration that sounds wrong is not worth a tighter difficulty curve.
 *
 * So the schedule moved instead of the audio. **This is also closer to the
 * source**: the real row's rests bottom out around 920ms (see the measurements
 * at the top of this file), so 500ms was always tighter than the thing being
 * imitated. The cost is a gentler ending — see `REST_DECAY` and `MAX_CYCLES`.
 */
export const REST_FLOOR_MS = 800;
/**
 * How fast the rest collapses.
 *
 * Raised from 0.85 when the floor went up. With less distance to fall, falling
 * at the old rate slammed into the floor after four cycles and spent the rest
 * of the row flat — the acceleration is the whole point, so it has to be spread
 * over the room that is left rather than spent immediately.
 */
export const REST_DECAY = 0.9;

/**
 * How long the RO shout sounds for. **It has to fit inside `REST_FLOOR_MS`.**
 *
 * This is a timing constant, not an audio detail, which is why it lives here
 * next to the rest it must fit in rather than beside the file it describes.
 * `SFX_LENGTH_MS` in src/audio/sounds.ts reads it from here.
 *
 * Against the old 500ms floor the arithmetic was unforgiving: to have the shout
 * finish before the next drum you would have had to answer by
 * `REST_FLOOR_MS + ANSWER_SLOT_MS - 640` = 660ms, and the gate does not open
 * until `answerOpensMs()` = 740ms. **There was no legal tap at the fast end
 * that did not run over the next cycle's count-in**, which is why the two-beat
 * call stopped reading as two beats, and why it only happened late in a row.
 *
 * The first fix cut the file down to 370ms to fit the floor. It sounded thin,
 * and that is the end of that argument — **the recording is fixed and the
 * schedule is not.** `REST_FLOOR_MS` went up instead. If this number ever
 * changes, the floor is what has to move with it, and a test says so.
 */
export const SHOUT_MS = 640;

/**
 * Hard cap, which is what holds the whole thing to about twenty seconds — see
 * `totalMs`. A row that never ends is a row nobody finishes, and the first cut
 * at thirty seconds outstayed its welcome in play.
 *
 * Cut from 13 when `REST_FLOOR_MS` went up: longer rests mean longer cycles,
 * and the twenty seconds is the budget that actually matters. Eleven cycles at
 * the new schedule come to 19.8s, which is where thirteen used to sit.
 */
export const MAX_CYCLES = 11;

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
  return answerBeatMs() - EARLY_GRACE_MS;
}

/**
 * When the answer is actually *due* — the beat itself, on the heard clock.
 *
 * This is the moment the music points at: one beat after the second drum, plus
 * the delay before the phone makes a noise. It is what the button fills toward.
 */
export function answerBeatMs(): number {
  return ANSWER_SLOT_MS + AUDIO_LATENCY_MS;
}

/**
 * How long the button takes to fill, measured from the start of the cycle.
 *
 * **It fills to the beat, not to the moment the gate opens.** Those were the
 * same number until playtesting caught what that costs: `EARLY_GRACE_MS` exists
 * to *widen the gate* so an anticipated tap is not swallowed, and tying the fill
 * to the gate quietly moved the visual target `EARLY_GRACE_MS` earlier than the
 * beat as well. A player who trusts the ring — and the design tells them to,
 * because "full" is the only cue there is — then shouted 150ms ahead of the
 * drum on every single cycle. The grace was silently teaching the wrong beat.
 *
 * So the two are now separate statements. The fill says *here is the beat*; the
 * gate says *near enough counts*. The 150ms between them is forgiveness the
 * player never has to see, which is the only way forgiveness works.
 *
 * A continuous fill still beats the highlight it replaced: a blink is either
 * before or after the player's thumb and both read as broken, whereas a ring
 * that is nearly closed when they tap reads as in time even if
 * `AUDIO_LATENCY_MS` is off by a hundred milliseconds.
 */
export function armDurationMs(): number {
  return answerBeatMs();
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
