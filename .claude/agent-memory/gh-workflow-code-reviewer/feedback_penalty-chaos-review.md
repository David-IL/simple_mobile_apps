---
name: feedback-penalty-chaos-review
description: How David frames penalty-chaos code changes — pure-logic-vs-React-glue split, and where past real bugs (found via playtesting, not typechecking) actually lived
metadata:
  type: feedback
---

This project treats "it typechecks" as insufficient evidence a change works (see repo
CLAUDE.md's Verifying section) and that same skepticism shows in the code itself: multiple
files in `apps/penalty-chaos` carry comments describing a real bug found by a human
playtester (often the 11-year-old son) that no unit test or type system caught, followed by
the fix and a regression test. Examples: keeper "still chance" not existing as a lever
(engine had no mechanic behind a written trait claim), the last shot of a shootout being
silently dropped (setState-updater-inside-unmounting-component), the tie-break in
`readablePattern` making the hardest keeper trivially exploitable.

**How to apply**: when reviewing this app (or others in the monorepo built the same way),
weight runtime/state-timing bugs and "does the mechanic actually match the flavor text"
checks highly — that is where this project's real bugs have historically come from, more
than type errors or obvious logic slips. See [[project-penalty-chaos]] for the specific
pattern (pure `src/game/*` is reliable; `src/state/*` persistence hooks are the recurring
risk area).
