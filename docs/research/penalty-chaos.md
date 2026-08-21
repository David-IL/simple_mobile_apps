# Penalty Chaos

- **Slug:** `penalty-chaos`
- **Status:** draft <!-- draft | proceed | shelved -->
- **Date:** 2026-08-21

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

## 1. Problem and user

- **Problem:** none, honestly. This is not a problem-solving app — it's a joke you can pass
  around. The nearest real need it serves: two people (a kid and a mate, a parent and a kid)
  with five minutes to kill and no ad-free offline game on the phone worth opening.
- **Who:** the 11-year-old and his football mates. Secondary: the team, waiting around at a
  tournament or in the car on the way to an away game.
- **How often:** rarely, in bursts. Tournament weekends, car journeys, the ten minutes before
  training starts. Not daily.
- **Would I use it daily?** No. I'd play it twice and be done. I'm building it because the
  *son* is the target user, he'll tell me straight if it's boring, and it's the smallest
  possible vehicle for learning RN game loops + EAS deployment end-to-end.

## 2. Existing alternatives

All figures below are as literally shown on the Play listing on 2026-08-21 (`hl=en_US&gl=US`).
Nothing here is estimated.

| App | Installs | Price | Common complaint |
| --- | --- | --- | --- |
| [Penalty Shooters 2](https://play.google.com/store/apps/details?id=com.flashfooty.penaltyshooters2) (CodeVlyca) | 500K+ | Free + ads | Keeper reads you in late rounds; ad-gated retries |
| [Penalty Shooters Football Game](https://play.google.com/store/apps/details?id=com.flashfooty.penaltyshooters) (CodeVlyca) | 1M+ | Free + ads + IAP | "keeper never dives where you want"; ad to start any mode |
| [Penalty Shootout: Multi League](https://play.google.com/store/apps/details?id=com.flashfooty.psmultileague) (CodeVlyca) | 500K+ | Free + ads + IAP | 2.8★. Banner ad covers the controls; forced-ad-to-win |
| [Final Shoot: Penalty-Shootout](https://play.google.com/store/apps/details?id=com.aceproject.pso.google.dist) (Ace Project) | 100K+ | Free + ads + IAP | **Has an actual "mind game NPC".** Players want it removed |
| [Penalty Goal](https://play.google.com/store/apps/details?id=games.joker.penalty) (PlayRoof) | 100K+ | Free + ads + IAP | Chicken-keeper "chaos" — but it's a crash/multiplier gambling game in a football skin |
| [Head Ball 2](https://play.google.com/store/apps/details?id=com.masomo.headball2) (Masomo) | 100M+ | Free + ads + IAP | Not penalties, but **does** run random mid-match disruptions. Being frozen at the decisive moment reads as cheated |
| [Football Strike](https://play.google.com/store/apps/details?id=com.miniclip.footballstrike) (Miniclip) | 100M+ | Free + ads + IAP | Bot matchmaking / rigged-feeling opponents |

Checked and **couldn't confirm**: "Penalty Kick Wars" returns no Play listing under that name.
"Penalty Superstar" (grow/shrink-the-keeper power-ups) is a *web* game, not a Play listing.
Score! Hero 2 appears delisted from the US storefront.

**Is the "random comedic disruption per shot" mechanic occupied?** No — and every listing
description fetched was keyword-scanned for *distraction / obstacle / mascot / pitch invader /
crowd / random event / wind / chaos*. The only hits were cosmetic weather backdrops
([Penalty League 2026](https://play.google.com/store/apps/details?id=com.sr.penaltykick.football.freekick.penalty.games)
has "dynamic weather", explicitly framed as *variety*, not interference), a gambling-adjacent
chicken skin, and generic "spiced with humor" flavour text.

**But the gap exists for a reason, and the reason is visible in the reviews.** The two games
that shipped adjacent versions of this mechanic generate their sharpest 1★ reviews from
precisely that feature:

> "This sucks SO BAD I can't play normally they played mind game on me please REMOVE the mind
> game npc Thank You." — Qhaliff Rayyan, 1★, [Final Shoot](https://play.google.com/store/apps/details?id=com.aceproject.pso.google.dist)

> "I started losing more and more because I was unable to move, got frozen by the referee … I
> was on a 7+ game win streak then I was unable to move my player, caused me to lose."
> — Thomas Kirchgessner, 2★, [Head Ball 2](https://play.google.com/store/apps/details?id=com.masomo.headball2)

And the genre's **single most common complaint across every penalty title read** is "the keeper
reads me / it's rigged / it's rock-paper-scissors". Players here are already primed to read any
unexplained outcome as the game cheating. Dropping randomised disruptions onto that baseline
lands a new feature on the exact nerve the category is sore about.

**What's genuinely different about mine:** offline, no ads, no IAP, no energy timer — against a
field where *every single* penalty game found carries "Contains ads". That is a real difference,
but it is a difference nobody is searching for (see §3). The honest framing: this is not a
product, it's a toy for a named group of kids, and the differentiation that matters is that the
jokes are *theirs*.

## 3. Riskiest assumption

**That random comedic disruptions are the hook.** If they're actually the thing that makes it
feel unfair and gets it deleted after a week, the whole premise is wrong.

Two independent lines of evidence point the wrong way:

1. **The one validated case in this exact space deliberately doesn't have them.** In July–Aug
   2026 an Argentine browser game, [*La Vieja contra el Dibu*](https://laviejacontraeldibu.app/),
   went viral — an old lady takes 30 penalties against Emi Martínez to get her son out of jail.
   Its own copy: *"Ignorá las provocaciones del Dibu. El arquero te habla, te hace gestos, te
   provoca"* and *"si siempre tirás al mismo lado, el Dibu lo lee y se tira antes"*. Built in
   under 48 hours, spread by a streamer, and people shared their **failures**. The comedy came
   from a specific recognisable heel and an absurd stake — **not** from wind or pitch invaders.
   ([El Destape](https://www.eldestapeweb.com/tecnologia/furor-redes-jugar-vieja-vs-dibu-videojuego-viral-tendencia-argentina-2026731175920),
   [Show HN](https://news.ycombinator.com/item?id=49205048).) Traffic numbers are the site's own
   SEO copy — *(unverified estimate)* — though four squatter clone domains exist, which is
   circumstantial corroboration at best.
2. **Pitch-invader delight is spectator delight.** r/soccer upvotes clips heavily —
   [6,898](https://reddit.com/r/soccer/comments/1k3irtu/vibes_at_old_trafford_were_so_good_that_the_pitch/),
   [3,968](https://reddit.com/r/soccer/comments/1koc674/great_rugby_tackle_by_the_steward_on_a_pitch/),
   [1,424](https://reddit.com/r/soccer/comments/1nawueu/pitch_invader_attempts_to_steal_corner_flag/)
   — with exactly the right tone in the comments ("Put him in goal.", "I adore that audible
   laughter"). But **not one person anywhere said "I wish a game did this."** Enjoying watching
   chaos is not the same appetite as wanting chaos to void your goal.

**Also worth stating plainly: there is no demand signal for a penalty game at all.** Every
penalty-game post found on Reddit is a developer promoting their own, and they all die at 0–1
upvotes ([one](https://reddit.com/r/iosgaming/comments/1n8iprd/a_new_style_to_penalty_shootout_games/)
was removed by mods for self-promo). On the App Store the pure-penalty long tail is brutal:
Penalty Shootouts 46 ratings, Penalty Challenge Multiplayer 40, Football Penalty Kick 11, Save
or Score 8. The only scale is in live-ops multiplayer. Under ADR 6 that doesn't disqualify the
idea — but it kills any story where this finds an audience on the store.

*(Coverage gap: Reddit was reachable only via the Arctic Shift archive API, which does not index
r/FIFA, r/EASportsFC, or r/footballmanagergames. The null result above does not cover those three.)*

**How to check it cheaply, before writing code:** paper prototype. Draw the goal on a sheet, son
picks a corner, roll a die for the disruption, and see whether he laughs or argues. Ten minutes.
Specifically test: does he accept a disruption he was *shown in advance*, and reject one that
fires *after* he's committed? That single distinction is the whole design.

## 4. Offline-only or cloud backend?

- [ ] Does data need to sync across a user's devices? — **No.** Scores are per-phone bragging
      rights; the phone is passed around, not synced.
- [ ] Do multiple users need to see each other's data? — **No.** Two-player is pass-the-phone,
      same device, same room. That's the *point* — it's a shared-screen joke, not a leaderboard.
- [ ] Are accounts / login required? — **No.** An 11-year-old shouldn't need an account to take
      a penalty.
- [ ] Is there logic that can't run on-device? — **No.** A weighted random event table, a tween,
      and a keeper that tracks your last few shot directions. All trivially local.
- [ ] Does content need updating without an app release? — **No.** The gag roster ships with the
      build. If a new gag is wanted, that's a release — and shipping a release is part of what's
      being learned here.

**Decision: offline-only.** Nothing is even close to ticking. No server, no auth, no privacy
policy, no running cost, and it works on a coach bus with no signal — which is exactly where it
will actually get played.

## 5. MVP scope

**Must have:**
- Take a penalty: pick direction + power. One gesture (drag-and-release aim), not a menu.
- A keeper that reacts, taunts, and **reads your pattern** — shoot the same corner twice and it
  dives early. This is the mechanic the Dibu game validated; treat it as the core, not a garnish.
- A disruption roster of ~6 events, **telegraphed before the run-up** (see §6b). Wind sock
  swings, a supporter climbs the hoarding, the keeper starts jumping on the line, mascot wanders
  on. Player sees it, then chooses the shot.
- Best-of-5 shootout, two-player pass-the-phone on one device, plus solo vs. the keeper.
- Scoreline on screen and a result card at the end worth showing someone.

**Nice to have (v2):**
- Locally-specific gags: name the keeper after someone at the club, in-jokes from the team.
  Per §3, *specific* comedy is what works; generic chaos is what doesn't.
- Sound. A crowd "ooooh" on a miss probably carries more of the comedy than any animation.
- A shareable "you lost to a chicken" result image.

**Explicit non-goals:**
- Online multiplayer. Ticks a backend box, kills the offline-only property, and the whole point
  is two kids on one sofa.
- Careers, leagues, tournaments, unlockable kits, currency, energy timers.
- Ads and IAP (see §7).
- Realistic football physics or 3D. Not the mechanic.

## 6. Success metric

- **Success is:** he plays it unprompted a week after I stop showing it to him, and at least one
  of his mates asks for it on their phone. Plus: a real EAS build installed on a phone that
  isn't mine. That's the learning goal — the game is the excuse.
- **Failure looks like:** he plays three rounds, says "that's not fair", and doesn't open it
  again. That is the §3 risk landing.
- **Who specifically will use it:** the son (first playtester, and the source of half the gag
  ideas — building it together is the actual point); three or four of his mates I can hand a
  phone to; his team on the way to an away fixture. That is a real, in-person, reachable dozen.
  Not "people who find it on the Play Store" — the evidence in §3 says that's nobody.
- **Not a channel:** the club/coaches. r/bootroom is openly hostile to apps substituting for
  football — *"Just get down a local park and play fives"*, *"keep it a social game with your
  mates"*
  ([thread](https://reddit.com/r/bootroom/comments/1v2hdkh/if_you_could_build_the_perfect_athome_soccer/),
  downvoted to 0). Pitching this to a coach as a *training tool* would land badly. It's a joke
  you pass around in the changing room, and it should be framed that way.

## 6b. Does it fit React Native?

- **Core mechanic:** drag-and-release to aim and power a penalty, against a keeper that taunts
  and learns your pattern, with a comedic disruption shown *before* you shoot that changes what
  the good shot is.
- **Is it RN-shaped?** Yes, squarely. Drag-and-release aiming and tween-driven motion are both
  named in [ADR 7](../adr/0007-game-rendering-approach.md) as things RN does well. The ball is
  one animated view on a bezier path; the keeper is a sprite with a handful of tweened poses.
- **Does it need a physics engine / dozens of bodies / per-frame collision / particles?** No —
  **provided the disruptions stay presentational.** The design rule that keeps it in RN:
  - **Wind** = a lateral offset baked into the ball's tween target, shown by a swinging wind
    sock. Not a simulated force.
  - **Pitch invader / mascot** = a sprite that walks a fixed path across the shot lane and, if
    the ball's endpoint falls in its band, triggers a canned "blocked" outcome. One box check at
    resolution time, not per frame.
  - **Keeper antics** = tweened animation plus a bias term in the keeper's dive choice.
  - Goal/save/miss is decided from the ball's **endpoint**, evaluated once. There is no
    frame-by-frame collision anywhere in the design.

  If a gag can't be expressed as "a sprite on a tween plus a term in the outcome function", cut
  the gag. Per ADR 7 that's changing the idea, not the stack — and this call is being made here,
  not mid-build.
- **The disruption-timing rule is a hard design constraint, not a preference.** Disruptions must
  be **telegraphed before the run-up begins**. Then it's a puzzle input and the comedy lands. If
  one fires after the player has committed, every miss becomes the game's fault and it inherits
  Final Shoot's and Head Ball 2's one-star reviews verbatim (§2). Exception: an event may still
  *resolve* comically after the shot — the invader gets rugby-tackled — as long as it didn't
  change the outcome unannounced.
- **Tooling:** start with layout + `Animated`. Move to `react-native-reanimated` if the ball arc
  and keeper dive judder on a real phone. **No Skia** — nothing here needs a canvas, and adding
  one would be building ahead of a need.
- **Low-end Android:** must be tested on his actual phone, not the dev machine. Ceiling is
  roughly one ball + one keeper + one wandering sprite on screen at once, which is well inside
  what RN handles. If a gag wants twenty confetti particles, it's the wrong gag.

## 7. Play Store feasibility

- **Policy risk:** low. No user-generated content, no data collection, no health/finance claims,
  no runtime permissions needed. One thing to be deliberate about: the gags must stay
  child-appropriate — a "supporter storming the field" is fine, a *streaker* is not, and that
  distinction has to survive contact with an 11-year-old's suggestions.
- **Privacy policy:** not required — collects nothing, no analytics, no ads.
- **Monetization: none.** Not paid, no IAP, no ads. Per
  [ADR 6](../adr/0006-monetization-is-a-learning-goal.md), ads are a compliance exercise for when
  he wants to learn that, and this app is not that exercise. Keeping it ad-free is also the only
  honest differentiator against a field where every competitor found carries "Contains ads":
  > "it's disgusting how the play store became a fucking online casino for kids"
  > — [r/AndroidGaming, 661 upvotes](https://reddit.com/r/AndroidGaming/comments/1el2w9f/call_me_hater_but_the_android_play_store_is_the/)
- **Android target:** whatever the Expo SDK's current default targetSdk is at scaffold time —
  check the versioned docs rather than pinning a number here. minSdk = Expo default; the
  constraint that matters is the son's actual phone, not a spec.

### 7b. Kids and ads

**Not applicable — no ads.** Skipped deliberately. If ads ever get added this becomes a
child-directed app under Families policy and the questions in
[docs/reference/families-policy-and-ads.md](../reference/families-policy-and-ads.md) all have to
be answered first. Not now.

## 8. Time-box

**Six evenings.** Checkpoint after evening two: a ball that flies where you aim, a keeper that
dives, and *one* disruption — shown to the son. If he doesn't want another go at that point, the
remaining four evenings don't get spent. Ship or stop at six either way.

## 9. Decision

- **Decision:** proceed *(recommendation — David's call to flip the status)*
- **Reasoning:**

  **Not because there's a market.** There isn't. Zero organic demand, a long tail of penalty
  games with 8–46 ratings, and dev promo posts that die at 0 upvotes. If this were a product
  pitch the answer would be shelve, without hesitation.

  It passes on ADR 6's terms instead: there is a named, in-person, reachable audience of about a
  dozen — the son and his mates — and he is a co-designer, not just a tester. The gag roster is
  the part an 11-year-old can genuinely own. It's the smallest thing that still forces the whole
  pipeline: game loop, `Animated`, a real EAS build, a phone that isn't mine. Offline-only, so no
  server, no auth, no privacy policy, no running cost.

  **The one condition, and it is not optional: disruptions are telegraphed before the run-up.**
  Every piece of evidence gathered points at the same failure mode — Final Shoot's *"please
  REMOVE the mind game npc"*, Head Ball 2's frozen-at-the-decisive-moment reviews, and a genre
  where "it's rigged" is already the default complaint. Randomness that punishes after you've
  committed reads as unfair far faster than it reads as funny. Telegraphed, it's a puzzle input.
  Sprung, it's the reason the app gets deleted in week one.

  **Second condition: the keeper is the star, not the weather.** The one viral proof point in this
  exact space — *La Vieja contra el Dibu* — is built entirely on a taunting keeper who reads your
  pattern, with no random disruptions at all. Build that first. Wind and pitch invaders are
  garnish on top of a mechanic that has to be fun without them. If evening two's build isn't fun
  with just the keeper, adding gags won't save it.

  **Third: make the comedy local.** Specific beats generic — that's why the Dibu game worked and
  why a generic chaos roster is the weaker version. Name the keeper after someone at the club.
