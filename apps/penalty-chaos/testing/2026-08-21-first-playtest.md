# Playtest 1 — 2026-08-21

**Who:** David's son (11) and his younger sister.
**What:** two-player pass-the-phone, unguided.
**How long:** ~20 minutes, roughly 10–20 rounds.
**Method:** David deliberately did not explain or point anything out, and let them
find things themselves. Observation only.

## The headline

Asked "are you done?", both said **no**.

That is the first time [§6 of the research doc](../../../docs/research/penalty-chaos.md)
has had any evidence at all behind it, and it is good evidence: unprompted
continuation is the thing that actually separates a toy that gets played from one
that gets opened once.

**Do not bank it yet.** §6's bar is "plays it unprompted a week later", and this
is twenty minutes of a novel object with a parent watching. Novelty and
supervision both inflate a first session. The measurement that counts is whether
either of them asks for it again, unprompted, on a day when nobody suggests it.

## What this actually validated

**Two-player pass-the-phone is doing real work.** It held two children for twenty
minutes with no instructions. That matches the one piece of genuine unmet demand
the research found — people repeatedly asking for one-phone two-player games and
getting no good answers — as opposed to penalty games, for which demand was
precisely zero.

**Renaming keepers is being used exactly as designed.** They renamed several to
real goalkeepers (Buffon among them). This is
[ADR 8](../../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md) working:
children obviously *want* real names, which is exactly why shipping them would
have been tempting — and the on-device rename gives them what they want while the
binary and the store listing stay clean. Nothing left the phone.

Worth noting the feature was justified on "specific beats generic" grounds and is
being used for something slightly different: not local in-jokes, but famous
keepers. Same mechanism, different motive, still fine.

## What it did *not* validate

**The riskiest assumption partly failed.** (Added after a follow-up conversation.)
Several disruptions were **not understood and not reacted to**. The badger was
"only annoying". The pitch invader was "only annoying". The sun, the mud and the
away-end chant all worked.

The pattern is not telegraphed-versus-sprung. It is **whether the effect is
legible from the picture**:

| Gag | Effect | Visible? | Landed |
| --- | --- | --- | --- |
| Low sun | aim line disappears | immediately | yes |
| Muddy spot | power bar caps | on the bar | yes |
| Away end | keeper commits early and showily | in his lean | yes |
| Badger | keeper's `readDepth` drops to 0 | **nothing** | no |
| Pitch invader | a column is blocked | a small static figure + a paragraph | no |

The badger's effect was invisible *by construction* — it is a negative, the
keeper quietly stopping something you could not see him doing. No amount of art
fixes that.

The invader's effect was legible only in text, and the text was a paragraph two
children were not going to read mid-game.

**"They said nothing about the graphics" is not "the graphics are fine."**
Children rarely articulate visual complaints; they just stop playing. The correct
reading is narrower and still useful: *the art is not the current blocker*, so
effort is better spent elsewhere than on polish.

## New information

**A second player appeared who was not in the plan.** §6 named "the son and his
football mates". A younger sister playing for twenty minutes suggests either the
audience is wider than assumed, or — more interestingly — that the **duel is the
draw and football is the skin**. Those have different consequences: if it is the
duel, then modes, turn-taking and rivalry are where future effort pays, not more
football content.

One observation is not enough to act on. Worth testing by watching who else picks
it up and whether they care which keeper they face.

## Issues found

### Fingertip saves looked broken — fixed

Reported: *"some keeper saves seem strange because the ball hits where the keeper
is not while it is still counted as a save with 'his finger tips'."*

The engine was right and the picture was lying. `reach` means "got a hand to a
shot in the **next zone along**", so on that outcome the ball legitimately lands
somewhere the keeper did not dive — but he was drawn parked in his dive zone,
visibly nowhere near it, while the game announced a save.

**This mattered more than it looked.** The single loudest complaint across every
competitor in this genre is "it's rigged" — an outcome the player cannot
reconcile with what they saw. A save where the ball visibly misses the keeper is
that exact failure, produced by an animation shortcut rather than by the rules.

Fixed in the same session:

- On a fingertip save the keeper now **stretches out of his dive toward the
  ball**, ending most of the way to it, so contact is visible.
- A stopped ball now **deflects away** instead of halting in the net, which read
  as a goal being scored and then disallowed.
- The pitch invader now stops the ball **at his body and his height**, rather
  than the ball flying past him to wherever it was aimed.
- Sound was split from the verdict so the glove noise fires at contact rather
  than after the ball has finished bouncing.

## Changes made in response

- **Badger removed entirely.** Not reworked — deleted. Its effect cannot be made
  visible, so it could only ever be decoration that occasionally seemed to
  matter.
- **Pitch invader reworked to carry itself.** Much bigger, waving the KAOS sign
  from the banner art, pacing while you aim, and a steward now sprints on after
  the shot and hauls him off. He also *distracts the keeper* — telegraph up,
  reach down — so he is a trade rather than a pure tax: a shut column in
  exchange for a keeper giving more away.
- **Banner copy cut to an exclamation.** "Banestormer! Treffer du ham, ryker
  skuddet." The figure on the grass is the announcement now; the text is a
  backup, not the mechanism.
- **Muddy round churns the whole pitch and rains.** A splat by the spot was too
  small to read as conditions being against you.

The one thing deliberately **not** taken from the feedback was making the invader
arrive unannounced and wander across the goal during the drag. Moving him within
his own column keeps him alive without letting the safe zone change after the
player has chosen it — see the reasoning in `GoalScene.tsx`.

## What to do next

1. **Leave it alone for a week**, then see if either of them asks for it. That is
   the §6 measurement and it cannot be rushed.
2. **Watch the disruptions deliberately** next session — the one question that
   still decides whether the premise works.
3. **Do not spend the next evening on art.** It is demonstrably not the blocker.
4. Consider whether the duel, not the football, is the product. Do not act on it
   until a second observation says the same thing.
