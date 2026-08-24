# Penalty Chaos — gamification and stickiness

- **Date:** 2026-08-24
- **Status:** items 1–3 built, not yet playtested; items 4–6 deferred
- **Constraints assumed:** offline-only, no cross-phone multiplayer, no ads
  ([ADR 6](../adr/0006-monetization-is-a-learning-goal.md)), and the app stays roughly two
  seconds from launch to the first ball.

## The evidence this is built on

Two playtests, both recorded in [`apps/penalty-chaos/testing/`](../../apps/penalty-chaos/testing/).
They settled two things, and everything below is downstream of them.

**1. The keepers are the product.** [Day two](../../apps/penalty-chaos/testing/2026-08-22-day-two.md)
caught unprompted commentary — *"X has become much better"*, *"Ahh, Y is bad"* — by the names
he had given them, tracking behaviour **across matches**. Not about penalties, not about the
chaos, not about winning. He is already running a rivalry system in his head that the app does
not model.

**2. An effect that is not visible does not land.** The badger was deleted in
[playtest 1](../../apps/penalty-chaos/testing/2026-08-21-first-playtest.md) because its effect
was invisible by construction. The mud fix was noticed and praised *because* the change made
an effect legible. This is the strongest design rule the app has, and it was derived from a
real player rather than from taste.

## What we are deliberately not building

### Streaks, and any mechanic that punishes absence

A streak does not reward playing; it penalises not playing. That is precisely why it drives
daily opens, and daily opens are the metric [ADR 6](../adr/0006-monetization-is-a-learning-goal.md)
says is *not* success here. Setting the ADR aside, the target user is an 11-year-old and the
builder is his father: the failure mode is that the app becomes an obligation he resents. A
broken streak is a small real distress, deliberately engineered. **Not worth it for a game
about kicking a ball past a man in gloves.**

The line adopted instead: **a mechanic may reward showing up; it may not punish staying away.**

### Any target expressed as a number of goals

This one is specific to this game and it is the sharpest reason to reject "daily target" as
pitched. The roster is difficulty-ordered and The Sunday Keeper exists to be scored past. So
"score 10 goals today" is best satisfied by farming the weakest opponent — it actively pushes
the player *away* from the rivalries that are the one thing demonstrably working. A challenge
tied to a **named keeper** has no such inversion; a challenge tied to a **count** always will.

### A lifetime running total

"Total score over time" only ever goes up, goes up whether he plays well or badly, and rewards
grinding over skill. It carries no tension at any point in its life.

### Also rejected

XP and player levels (fake progression running alongside real progression), a coin or cosmetics
economy (large build, drags toward IAP framing), an achievements grid (content authoring, reads
as cheap), push notifications (the streak problem with a bigger hammer, plus a dev build and a
permission prompt), and **anything at all placed between app launch and the ball**.

## The flaw in the stat that already exists

`savePercent` in [`keeperTally.ts`](../../apps/penalty-chaos/src/state/keeperTally.ts) is a
lifetime average. After a hundred shots against The Wall, one more goal moves it by half a
point. **It becomes less responsive the more the game is played** — exactly backwards for
stickiness, and the same defect that makes a lifetime total a poor choice.

Meanwhile *"X has become much better"* is a **form** observation, not a career-average one. The
stat he actually wants already exists in his head; the app is storing the wrong shape of it.

## What is being built

### 1. Open onto a rivalry, not a menu — and make it faster doing it

[`SetupScreen.tsx`](../../apps/penalty-chaos/src/screens/SetupScreen.tsx) initialised its
selection to `KEEPERS[0]`, so **every launch reset to the easiest keeper in the roster**, while
player names were faithfully persisted. The app forgot the one thing he cares about and
remembered the one thing he does not.

The change: persist the last opponent and mode, and put a **keeper card** on the home screen —
portrait, his on-device name, recent form, and a rematch action that goes straight into a
match, skipping setup entirely.

This takes time-to-ball from two taps to one, so it *strengthens* the two-second rule rather
than taxing it. It is the cheapest change here and probably the highest value: the app now
opens on "you versus him" instead of on a menu.

**The banner must not move.** The artwork is anchored to the top of the home screen's button
block and overflows off the *top* of the screen, so anything that makes that block taller drags
the picture up and crops its own wordmark away — which is exactly what the first version of the
card did. Two rules came out of fixing it, and both are load-bearing:

- **Only the buttons are measured.** The card is rendered outside the measured block and floats
  over the faded bottom of the artwork, so the banner sits in the same place whether or not
  there is a last opponent. Adding anything else to that block will move the picture again.
- **Chrome earns its height.** The card became a single pressable row — portrait, name, form,
  and a rematch pill — instead of a caption, a body and a full-width button stacked in three
  bands. The two labelled settings rows became one row of icons: a speaker that toggles mute,
  and a flag per language. Both changes buy back more height than the card costs, so the banner
  is now *less* cropped than before any of this work started.

Flags stand in for languages here, which is usually a poor idea — one flag rarely maps to one
language. It is safe in this specific case: two locales, each belonging to one country, read by
an 11-year-old who parses a picture faster than a word. They are drawn as SVG rather than emoji
because regional-indicator flag emoji render inconsistently across Android versions and OEM
fonts, and a language switch that shows two empty boxes is worse than the text it replaced. The
accessible name is still the language in its own language, which was the point of the original
text version.

Two notes on the card:

- A finished match records the names it was played under, and rematch replays those rather
  than re-resolving them from the name store. The first cut read the store a second time from
  `App`, which went stale the moment setup wrote a new name — rename yourself, play, come back,
  and the rematch handed you the old name. Replaying the fixture is both simpler and closer to
  what the word promises.
- It shows the player's **custom** name for the keeper, not the shipped one — consistent with
  the setup screen, and the ownership effect is the whole point. This differs from the result
  screen, which deliberately uses the shipped name because a result card is shareable content
  ([ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md)). **Consequence worth
  remembering: do not take Play Store screenshots of the home screen with a custom keeper name
  set.**
- The card is absent on a first run, and the screen falls back to exactly what it is today.

### 2. Make the keeper's memory visible

This is the badger lesson applied to the core mechanic. `readDepth` drives `chooseDive` through
`readablePattern`, and **none of it has ever been visible**. Playtest 2 left open whether he has
noticed the keeper reading him at all; that is not a mystery worth preserving, it is a
legibility bug in the one mechanic the whole design rests on.

The change: the engine now reports *why* it dived — the zone it read and how many times it had
seen that zone — and the match screen says so after the shot. Two cases, because both teach:

- **He read you and got you.** "He'd seen you go there three times."
- **He read you and you went somewhere else.** "He guessed you'd repeat yourself."
  Deliberately about repetition rather than about a corner — the read zone can be the centre,
  and copy that names a corner would be wrong a third of the time.

The read zone is also ringed on a shot map — **but only in the post-shot overlay, never while
aiming.** The zone he read is the zone he dived to, so putting the ring on the map that sits
under the player's thumb during a drag would hand over the answer and take the mechanic apart.
That constraint is written on `ShotMap`'s prop, because it is the kind of thing that gets
undone by a later "why isn't this shown everywhere?".

This converts an invisible parameter into a visible antagonist, and it makes varying your
placement into an understood skill rather than an accident. That is progression that is
*earned* rather than issued.

### 3. Lead with form; keep the career number underneath

Store the last ten outcomes per keeper. Show the last five as a form string plus "2 of your last
5", with the lifetime save percentage kept as the career line beneath it.

It moves every session, it matches how he already talks about the keepers, and `keeperTally.ts`
is already pure and separately tested, so the change is contained and testable.

## Deferred, with reasons

**4. A gauntlet run.** Face the roster in difficulty order, one shootout each, eliminated on a
loss. Reuses all eight existing keepers and all existing art, and produces a "best run" number
that carries genuine tension — the thing a lifetime total never will. This is the best
stickiness-per-evening on the list and the obvious next thing after 1–3 land, but it is a new
mode rather than an adjustment to existing ones, so it wants its own evening and its own
playtest.

**5. A date-seeded keeper of the day.** Deterministic from the date, so offline with no server.
Only acceptable under the rule above: **missing a day costs nothing** — no streak counter, no
notification, and it appears as a shortcut on the home screen rather than a modal on the launch
path. Held back because 1–3 may well produce the daily return on their own, and this is the
item closest to the line we just drew.

**6. Persistent head-to-head between the two named takers.** Playtest 1 raised that *the duel
may be the draw and football the skin* — a younger sister played for twenty minutes. A stored
head-to-head would be cheap and would test it directly. Held back on the repo's own discipline:
that is one observation, day two's evidence was solo and about keepers, and the note itself says
not to act until a second observation agrees.

## Open questions

- Does the read note actually get read mid-game, or is it another paragraph two children will
  skip? The banner copy had to be cut to an exclamation for exactly this reason — watch whether
  the same happens here.
- Does leading with form change how he talks about the keepers, or does he keep using his own
  running estimate regardless?
- Does the rematch card get used, or does he still go through setup to pick an opponent
  deliberately? Either answer is informative: the second would mean choosing the keeper is part
  of the fun rather than friction.
