# VAR Outrage!

- **Slug:** `var-outrage`
- **Status:** draft <!-- draft | proceed | shelved -->
- **Date:** 2026-08-26

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

**Idea as pitched:** you are the lead VAR official. A short 2D clip replays an absurd football
incident — a player tackled by a giant inflatable banana, a phantom handball, a theatrical dive
— and you have 5 seconds to swipe RED CARD, YELLOW CARD or PLAY ON. The scenarios get
progressively more chaotic; the faster and more outrageous *yet rule-compliant* your call, the
higher your crowd-satisfaction score. The son designs the fouls and the sound effects.

## 1. Problem and user

- **Problem:** none, and unlike penalty-chaos there isn't even a nearby one. This is a joke
  format looking for an engine.
- **Who:** nominally the 11-year-old and his mates — the same reachable dozen as every app in
  this repo. Worth noting the pitch's stated audience rationale is *"everyone loves complaining
  about VAR"*, which is an adult-football-internet observation, not an observation about him.
  See §3.
- **How often:** rarely, in bursts, and — this is the load-bearing word — **decreasingly**. A
  scenario is a joke. Jokes are consumed once. Section §3 is mostly about this.
- **Would I use it daily?** No. I'd see every gag in one sitting and be done, and so would he.
  That is a different failure shape from penalty-chaos, where I said I'd play twice and be done
  but the *son* had an engine to keep playing against.

## 2. Existing alternatives

Figures as literally shown on the Play listing on 2026-08-26 (`hl=en_US&gl=US`), scraped from
the raw listing HTML — WebFetch can't summarise Play pages, they truncate before the install
block. Nothing here is estimated.

### The mechanic is thoroughly occupied

| App | Installs | Rating | Price | Common complaint |
| --- | --- | --- | --- | --- |
| [Soccer Referee Simulator 3D](https://play.google.com/store/apps/details?id=com.flatgames.football.referee.simulator) | 10M+ | 4.2 (111K) | Free + ads + IAP | Ads block the match; "intentionally gives you bad camera angles" to sell coins |
| [Football Referee Lite](https://play.google.com/store/apps/details?id=com.VladimirPlyashkun.FootballRefereeLite) | 1M+ | 4.1 (7.8K) | Free + ads | Energy cap — "the limit to the amount of games you can play makes this game unenjoyable" |
| [Football Referee](https://play.google.com/store/apps/details?id=com.spinkeysoft.shingo) | 1M+ | 3.4 (4.9K) | Free + ads | — |
| [Football Referee VAR](https://play.google.com/store/apps/details?id=com.flockpekingese.var) | 500K+ | 3.9 (4.6K) | Free + ads | **Repetitive; graded against what the real ref did.** See below |
| [Referee Simulator 2026](https://play.google.com/store/apps/details?id=com.byedgames.refereesimulator2025) | 500K+ | 3.6 (1.3K) | Free + ads + IAP | — |
| [Football Referee Simulator 26](https://play.google.com/store/apps/details?id=com.minico.FootballRefereeSimulator26) | 500K+ | **1.5** (817) | Free + ads | "title doesn't match the game… just delete the game" |
| [Football Referee Simulator](https://play.google.com/store/apps/details?id=com.VladimirPlyashkun.FootballReferee) | 100K+ | **4.4** (8.3K) | **Paid $0.99, no ads, no IAP** | Ambiguous fouls — see §3 |
| [Football Referee Sim 26 VAR](https://play.google.com/store/apps/details?id=com.Drivion.FootballRefereeSim26VAR) | 100K+ | 4.4 | Free + ads | — |
| [VAR Assistant Referee Game Sim](https://play.google.com/store/apps/details?id=com.zg.var.assistant.referee.game.simulator) | 10K+ | 4.0 | Free + ads | — |
| [**VAR Challenge**](https://play.google.com/store/apps/details?id=com.varchallenge.appgame) | **10K+** | **3.0** | Free + ads | — (too few reviews shown) |

**VAR Challenge is a mechanical clone of this pitch.** Timed calls — red / yellow / penalty /
offside / play on — *"before time runs out"*, plus survival mode and daily challenges. Updated
this month. It is at 10K+ installs and **3.0 stars**. That, not the 10M+ 3D match sim, is the
honest benchmark for a solo timed-VAR-decision game.

The same loop also already shipped on the web as [FoulCall](https://www.foulcall.app/) — *"watch
real foul clips and guess the correct decision… no foul, foul, or penalty, then… no card, a
yellow card, or a red card. Players score more points for fast answers and build streaks across
five rounds."* That is this pitch, minus the comedy, already built. *(The domain now resolves to
a hub called MatchIQ listing five other daily games and FoulCall is not among them — retired or
folded in, **couldn't confirm which**. No user numbers published anywhere.)*

Also on iOS, not Play: [Swipe FC: Football Decisions](https://apps.apple.com/us/app/swipe-fc-football-decisions/id6759169354),
$0.99, *"hasn't received enough ratings or reviews to display an overview"* — i.e. the
Reigns-style football swipe-judgment game exists and has effectively no users.

### The serious rules-quiz niche exists, is real, and is owned by the governing body

| App | Installs | Price |
| --- | --- | --- |
| [Laws of the Game (official IFAB)](https://play.google.com/store/apps/details?id=com.theifab.lawsofthegame) | **500K+**, 4.4 (2.5K) | Free, no ads, no IAP |
| [Football Referee Trivia](https://play.google.com/store/apps/details?id=kkconsulting.frtrivia_free) | 50K+, 2.7 | Free + ads — abandoned since Sep 2023 |
| [RefereeWise](https://play.google.com/store/apps/details?id=com.refereewise.app) | 5K+, 4.3 | Free + IAP to $19.99 |
| [Referee Academy](https://play.google.com/store/apps/details?id=com.referee.academy) · [Referee Quiz](https://play.google.com/store/apps/details?id=com.refai.ref_ai_app) | 1K+ each | Free + ads |
| [Regra18](https://play.google.com/store/apps/details?id=com.regra18.app) · [Soccer Laws Dojo](https://play.google.com/store/apps/details?id=com.soccerlawsdojo.app) | 500+ each | Free + IAP / ads |

Working referees use IFAB's app and say so — *"I am a referee and the IFAB is very useful because
it helps to make the right decision in the game"*. Below it the long tail collapses to 5K, 1K,
500. **Couldn't confirm** review counts on most of the tail; Play hides the number below a
volume threshold, and several render no star rating at all.

**Delisted, and worth noting why:** [Football Referee Quiz](https://play.google.com/store/apps/details?id=mengws.com.referee_quiz)
returns 404. So do `com.owlstudioapps.VAR` and `VAR2`, both described on mirror sites as using
*"Full HD clips from real matches."* Two real-footage VAR games are gone from Play. Causation
**not confirmed**, but the shape is suggestive.

### What is genuinely different about this one

**The comedy — and that is verified as unoccupied.** Play searches for `funny referee game`,
`silly VAR decisions` and `referee swipe cards game` all return the same ten straight-faced
simulators. Not one listing description in the set sells humour or absurdity. Every incumbent
chases realism.

**And realism is what's killing them**, which is the one genuinely interesting finding in this
section:

> "It's very fun at first but it gets repetitive and boring. The VAR is terrible you only get one
> look and the angles are usually awful. And sometimes he gets dragged down and I say penalty and
> it's like NOPE THE REF DIDN'T CALL IT IRL, **yeah well the ref made a mistake so the game
> sucks**" — Flamingo, 2★, [Football Referee VAR](https://play.google.com/store/apps/details?id=com.flockpekingese.var)

> "some of the fouls seem unclear. 'Wayne steps on opponents leg' ok. Well was it an intentional
> stomp or accidental as he was trying to jump over him? I was pitching a 5.0 and **got this wrong
> because of how vague it is**." — M C, 3★, [Football Referee Simulator](https://play.google.com/store/apps/details?id=com.VladimirPlyashkun.FootballReferee) (the 4.4★ paid one)

Realism forces you onto real footage — expensive, legally exposed, and two such apps now 404 —
and it makes the scoring feel unfair, because the "right" answer is whatever a fallible human
did on television. Invented absurd scenarios dissolve all three problems at once: no licensed
clips, no real players (so [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md) is
satisfied *by construction* rather than by careful avoidance), and no appeal to a real-world
correct answer.

That is a real and well-evidenced argument. **It is also the argument for a game this pitch
isn't quite proposing** — see §3.

## 3. Riskiest assumption

Three, and they compound. The first is fatal on its own.

### (a) That a roster of gags is a game. It isn't — it's content, and content is consumed.

This is the structural objection and everything else is secondary to it.

**Compare the engine.** Penalty-chaos generates fresh play from a parameter set: the keeper
reads your last few shots, so the same code produces a different match every time. Finite code,
unbounded play. **VAR Outrage inverts that.** Every scenario is a bespoke authored animation,
played once. The second time you see the inflatable banana you are not refereeing, you are
recalling what you answered. A 5-second clip buys 5 seconds of novel gameplay and then becomes a
memory test. Linear content cost, zero replay.

The market says this in its own words, and says it from both directions:

> "It's very fun at first but **it gets repetitive and boring**" — Flamingo, 2★, Football Referee VAR

> "Really enjoyable game, **hasnt been too repetitive thus far**" — Matthew Henderson, 4★, Football Referee Simulator

When "not yet repetitive" is the *praise*, the category is telling you where it dies.

**And this repo has already measured the gag hit-rate.** [Playtest 1](../../apps/penalty-chaos/testing/2026-08-21-first-playtest.md):
of five disruptions, three landed, one was "only annoying", one had to be **deleted outright**
because its effect was invisible by construction. Call it 60% at best, on gags backed by an
engine that carried the session anyway. Six evenings of RN animation work buys maybe ten
scenarios. Six of them land. That is a few minutes of game.

### (b) That funny scenarios are the hook — already tested in this repo, with this playtester, and the answer was no.

[Playtest 2](../../apps/penalty-chaos/testing/2026-08-22-day-two.md) is the single most relevant
piece of evidence in this document, and it is first-party:

> He is talking about the keepers as **characters with reputations**, by the names he gave them,
> and tracking how they behave across matches. Not about penalties, not about the chaos, not
> about winning.

The research doc's §9 predicted it — *"the keeper is the star, not the weather"* — and the
playtests confirmed it. **The disruptions are texture. The characters are the product.**

VAR Outrage is the weather with the keeper removed. There is no character to build a reputation
about, nothing to track across sessions, nothing to have an opinion on. This is the same failure
that shelved [viking-row](viking-row.md): *"the idea does not have a second layer."* Take the
gags out of VAR Outrage and what remains is a three-button multiple-choice quiz.

### (c) That "outrageous yet rule-compliant" is a coherent scoring rule. It isn't.

The pitch wants both: absurd scenarios *and* rule-compliant grading *and* a 5-second clock. Pick
any two.

- **If the scenario is genuinely absurd** — an inflatable banana commits the tackle — the Laws
  of the Game have no answer, so the "correct" call is whatever was authored. Punishing a player
  on a 5-second timer for failing to guess an undiscoverable answer is precisely the nerve this
  genre is sore about, and precisely the failure penalty-chaos had to engineer *out* when a
  fingertip save looked like a cheat.
- **If the call is derivable from the Laws**, the absurd dressing is cosmetic and the game
  underneath is referee exam prep — a niche that exists, has real users, and is anchored by
  IFAB's free ad-free app at 500K+ installs. It is also homework.

The escape hatch is real but it is a different game: **drop rule-compliance entirely and score on
crowd reaction only.** Then nothing is wrong, so nothing is unfair. But then there is no skill,
no right answer, and no reason to swipe carefully — which removes the last thing that could have
supplied replay value once the jokes are spent. The pitch as written sits exactly between the two
positions, which is the worst square on the board: refs tell you your calls are wrong, kids find
it dry.

**The timer is independently suspect.** The most specific complaint found about timed refereeing
input:

> "By the time I can get my hand out of its resting positon and click on it, even if I click on
> it on time, **it ignores it**" — Football Referee Lite, App Store

Note also that *Reigns* — the validated swipe-to-judge precedent, 2M+ copies — **has no timer.**
Its tension comes from consequence-chains across a reign. This pitch borrows Reigns' input and
leaves Reigns' engine behind.

### The premise's stated reason to exist does not survive checking

> *"Why Kids Love It: Everyone loves complaining about VAR!"*

Complaining about VAR is real and voluminous. It is also a **grievance, not an appetite**. The
Football Supporters' Association surveyed ~8,000 Premier League fans (March 2026):

- **75.7%** do not support VAR's use ([FSA](https://thefsa.org.uk/news/fsa-survey-three-quarters-dont-support-var/))
- **90%** say it has *worsened* the matchday experience ([ESPN](https://www.espn.com/soccer/story/_/id/48345320/matchgoing-premier-league-fans-overwhelmingly-var-survey-finds), [Inside World Football](https://www.insideworldfootball.com/2026/03/30/90-premier-league-fans-say-var-worsened-match-day-finds-fsa-survey/))
- **91%** say it damaged goal celebrations

An earlier [BBC poll](https://feeds.bbci.co.uk/sport/football/55193287) of 2,100 fans: 30% said
it improved the game, 44% said it made football worse. On r/soccer the *news* that VAR is hated
gets engagement ([62 points, 121 comments](https://reddit.com/r/soccer/comments/1safbv8/)); the
individual rants score 0–1 and get corralled into a weekly "Monday Moan" megathread.

*(Fair caveat: that survey is matchgoing adult Premier League season-ticket holders, who are not
the audience. But the pitch's argument for the audience is the adult-internet observation, and
the adult-internet observation is measurably resentment.)*

**And "be the ref" is not a kid power fantasy.** r/Referees' recent posts are dominated by
assault, brawls and attrition. The NFHS has lost 50,000+ officials since 2018–19; 70%+ of new
referees quit within three years, most citing abuse
([TODAY](https://www.today.com/parents/youth-sports-referees-across-us-are-quitting-because-abusive-parents-t126087),
[Athletic Business](https://www.athleticbusiness.com/operations/personnel/news/15154156/youth-sports-experience-shortage-of-referees)).
Programmes report teenagers won't take officiating jobs. In the changing room the ref is the
butt of the joke, not the role you want.

### Zero stated demand — and worse coverage of the null than penalty-chaos got

No request post found anywhere: not one "someone should make a VAR game" or "I want to be the
ref". The only referee-game posts in r/iosgaming's entire archive are four, all dev self-promo,
scoring 1 point with 0 comments. r/AndroidGaming's football-game posts are near-uniformly `[DEV]`
promos at 1 point.

*(Coverage gap, and it is a real one: Arctic Shift's **comment** search returned HTTP 400 on every
parameter combination tried, and old.reddit.com is blocked at the harness level. A request like
this most plausibly lives in a comment, not a post title. The null above is a null on **post
titles only**. Sort-by-score also failed, so results are recency-weighted.)*

### How to check it cheaply, before writing code

**Do not build anything. Test the content economy on paper, tonight.** Write eight scenarios on
index cards with the son. Show him the cards. Then — and this is the whole experiment — **show
him the same eight cards again tomorrow.** If round two is boring, the app is boring, and no
amount of animation fixes it, because the animation *is* the joke and the joke is spent.

Second, cheaper still: ask him to invent five fouls. Count how many have a *decision* in them
versus how many are just a funny picture. If the answer is five funny pictures, the game he wants
is a joke generator, not a referee sim, and it should be built as one — or as a mode in something
that already has an engine.

## 4. Offline-only or cloud backend?

- [ ] **Sync across devices?** No. Scores are per-phone.
- [ ] **Multiple users see each other's data?** No — pass-the-phone at most.
- [ ] **Accounts / login?** No.
- [ ] **Logic that can't run on-device?** No. A deck of scenarios, a countdown, a swipe
      recogniser, a score. Trivially local.
- [ ] **Content updated without an app release?** **This is the one box in the repo so far with
      a genuine argument behind it, and it should be stated honestly rather than waved away.**
      For a game that *is* its content, "add three gags without shipping" is a real product need
      in a way it never was for penalty-chaos. A content-delivery endpoint would let the son add
      a scenario on a Tuesday and have it on his mates' phones on Wednesday.

      **Still not ticked.** It costs a server, a CDN or a bucket, a schema, a privacy policy, and
      a moderation question the moment a child authors content that reaches another child's
      phone. Against that: shipping a release *is* the learning goal here, gags arrive in batches
      of one evening's work anyway, and an OTA content pack is exactly the kind of infrastructure
      ADR 6's consequences warn about building ahead of an app that needs it. If the app were
      succeeding and starving for content, revisit. It isn't and won't be.

**Decision: offline-only.** Note what this means, though: an offline content game has a hard
ceiling equal to whatever shipped in the binary. That ceiling is the §3(a) objection restated as
architecture.

## 5. MVP scope

Recorded for completeness; §9 recommends not building this as pitched.

**Must have:**
- A deck of scenarios: sprite scene + a countdown + swipe left/up/right → yellow / play on / red.
- ~20 scenarios minimum. **Below that there is no game**, and this is the real cost — see §3(a).
- A scoring rule that is *one* thing, not two. Either crowd-satisfaction (no wrong answers) or
  correctness (has wrong answers). Not both. §3(c).
- A run of 10, a score, a result card.

**Nice to have (v2):**
- Sound. Per penalty-chaos, probably carries more of the comedy than the animation does.
- Pass-the-phone duel — same deck, higher score wins. This is the only element with observed
  evidence behind it in this repo.

**Explicit non-goals:**
- Real match footage, real players, real clubs, real competitions. [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md).
  Note the two delisted real-footage VAR apps in §2.
- A career/progression mode. That's the sim genre, occupied at 10M+ installs.
- Ads, IAP, energy caps.
- Downloadable content packs (§4).

## 6. Success metric

- **Success would be:** he plays it unprompted a week later. **The specific reason to doubt it:**
  penalty-chaos cleared the *first day* of that bar because there was a keeper to have opinions
  about. Here there is a deck, and a deck he co-wrote — meaning he already knows every punchline
  before he opens it. **The co-designer is also the one player guaranteed to be spoiled.** That
  is a genuinely nasty property and it does not apply to any other idea in this repo.
- **Who specifically will use it:** the same reachable dozen — the son, three or four mates, the
  team on the way to a fixture. Real and in-person, which is what ADR 6 asks for. But §3(a) says
  each of them gets one sitting out of it, not a returning habit.
- **Not a channel:** the Play Store. Zero organic demand, and a shipped mechanical clone sitting
  at 10K installs / 3.0★.
- **The learning:** swipe gestures on the UI thread and a countdown are genuinely new relative to
  penalty-chaos's drag-and-release. That is real but small — perhaps one evening of new ground,
  and the rest is a re-run of the same pipeline.

## 6b. Does it fit React Native?

**Yes, cleanly, and this is the one section with no objection in it.**

- **Core mechanic:** a swipe-to-choose card deck with a countdown timer over a sprite scene.
- **RN-shaped?** Squarely. [ADR 7](../adr/0007-game-rendering-approach.md) names card interactions
  and tween-driven motion explicitly. A Reigns-style deck is one of the most RN-native game shapes
  there is.
- **Physics engine / dozens of bodies / per-frame collision / particles?** None. Scenes are
  pre-authored sprite tweens on a fixed timeline — closer to an animated GIF than a simulation.
  Nothing is resolved from a collision; the outcome is authored data.
- **Tooling:** `react-native-reanimated` for the swipe gesture (this *is* the case it exists for —
  a drag tracking the finger must run on the UI thread), plus `Animated` for the scenes. **No
  Skia.**
- **Low-end Android:** the lightest thing considered in this repo. One scene, a few sprites, a
  timer.
- **The constraint that actually bites is authoring, not rendering.** Each scenario is
  hand-keyframed. There is no procedural generation available for a joke. Per ADR 7's logic the
  right response to a bad ratio is to change the idea — and here the bad ratio is
  evenings-per-minute-of-play, not frames per second.

## 7. Play Store feasibility

- **Policy risk: low as scoped, with one live edge.** No UGC leaving the device, no data
  collection, no permissions. The edge is content: "absurd football incidents" designed by an
  11-year-old will drift, and a game whose entire premise is escalating outrageousness has an
  escalation gradient built into it by design. Penalty-chaos handled the same risk with a
  streaker-vs-supporter line; here the ratchet is the *mechanic*, so the line needs to be firmer.
- **ADR 8 fit is the best of any idea in this repo, and it's structural.** Invented absurd
  incidents cannot resemble a real player, because no real player has been tackled by an
  inflatable banana. Contrast the two `owlstudioapps` VAR apps advertising *"Full HD clips from
  real matches"*, both now 404 on Play (causation **not confirmed**), and viking-row, which was
  shelved because its premise *was* the forbidden bit.
  **The one thing to watch:** "everyone loves complaining about VAR" means relitigating famous
  real incidents, and if a scenario is recognisably a specific real moment, the structural
  protection evaporates. That must be an explicit content rule, not an assumption.
- **Also out:** crests, kits, competition names — trademarks, and the easiest thing to spot on a
  store listing.
- **Privacy policy:** required. Same reasoning as penalty-chaos — Play requires one from any app
  whose target audience includes children *"even apps that do not access any personal or sensitive
  user data"*. A cartoon football game for an 11-year-old is child-appealing however it's declared.
- **Distribution:** Norway only, same reasoning as penalty-chaos — the audience is local and
  global distribution means the strictest jurisdiction governs.
- **Monetization: none.** Not paid, no IAP, no ads. Worth noting the category evidence agrees:
  ads are the single most-cited complaint across every referee app read, and the **only** 4.4★
  listing with no ads and no IAP is the **paid $0.99** one.
- **Android target:** Expo SDK default at scaffold time; check the versioned docs.

### 7b. Kids and ads

**Not applicable — no ads.** Skipped deliberately.

## 8. Time-box

**Not applicable — recommending it isn't started.** If it were: two evenings to a deck of five
scenarios, shown to the son twice on consecutive days. That test decides it, and it can be run on
index cards for the cost of nothing.

## 9. Decision

- **Decision:** shelve as pitched *(recommendation — David's call to flip the status)*
- **Reasoning:**

  **This is a content project wearing a game's clothes.** Penalty-chaos works because a keeper is
  a parameter set: finite code, unbounded play, a character you form opinions about across
  sessions. VAR Outrage is the exact inverse — every minute of play must be hand-authored, and
  each minute is spent the first time it's seen. Six evenings of animation buys roughly ten
  scenarios; playtest 1 says about six of them land; that is a few minutes of game. The category
  confirms it from both directions: *"it gets repetitive and boring"* as the 2★ complaint, and
  *"hasn't been too repetitive thus far"* as the 4★ praise.

  **The hook this depends on has already been tested here and failed.** Playtest 2 is
  unambiguous — the son talks, unprompted, about *keepers as characters with reputations*, not
  about the chaos. Comedic disruptions were the riskiest assumption in penalty-chaos and the
  answer came back no. VAR Outrage removes the character layer and keeps only the part that
  didn't work. Same shape as viking-row: **remove the premise and there is no second layer.**

  **And the co-designer is the guaranteed-spoiled player.** The pitch's best feature — the son
  writes the fouls — is also, uniquely among the ideas in this repo, the thing that ensures he is
  the one person who can never be surprised by the result. §6's success bar is "plays it
  unprompted a week later" and he'll know every punchline before it opens.

  **Stated fairly, because two of the counter-arguments are genuinely good:**

  1. **The comedic framing is verifiably unoccupied, and for a *structural* reason.** All ten
     shipping referee sims chase realism; realism forces real footage, which is expensive,
     which is legally exposed (two such apps now 404), and which makes scoring feel unfair —
     *"the ref made a mistake so the game sucks."* Invented absurdity dissolves all three at
     once and satisfies ADR 8 by construction rather than by careful avoidance. That is the
     cleanest ADR 8 fit of any idea considered so far. It is a real insight and it should not
     be lost with the shelving.
  2. **The judge-the-incident format is validated over nearly 70 years.** *You Are The Ref* has
     run since 1957 — *"improbable hypothetical football scenarios that then invites the reader
     to make the refereeing decision"* — through *Shoot* and then the Guardian and Observer
     2006–2016 ([Wikipedia](https://en.wikipedia.org/wiki/You_Are_The_Ref)). Sky Sports still
     runs the format digitally.

     **But read what that proof point actually validates**, because the pitch borrows its wrapper
     and drops its engine. You Are The Ref is *untimed*, and the payoff is the reveal — "oh,
     *that's* the rule". Absurd setup, surprising-but-derivable answer. It is a rules puzzle, not
     a comedy reflex test. The pitch takes the absurd setup, adds a 5-second clock, and scores on
     crowd satisfaction — which discards the exact thing that made the format last seventy years.
     The same borrowing happens with Reigns: its input, without its consequence-chains, and
     without noticing Reigns has no timer.

  **The pitch is also internally contradictory, and this is not a detail.** "Outrageous yet
  rule-compliant" cannot both hold: absurd incidents have no answer in the Laws, so grading them
  on a clock punishes players for undiscoverable answers — the exact "it's rigged" failure this
  repo already had to engineer out of a fingertip save. Make the calls genuinely rule-derivable
  and you've built referee exam prep, against IFAB's free ad-free app at 500K+ installs. Sitting
  between the two is the worst option available.

  ---

  **What to do instead — the actual recommendation, not a consolation prize.**

  **Run the index-card test tonight anyway.** Eight scenarios, written with him, shown twice on
  consecutive days. It costs nothing, it directly tests §3(a), and — more usefully — it tells you
  whether what he actually wants is *to referee* or *to invent ridiculous fouls*. Those are
  different products and only one of them is this app.

  Then, in order of how well the evidence supports them:

  1. **Spend his content-authoring energy on penalty-chaos, where there's an engine underneath.**
     This is the same conclusion viking-row reached and for the same reason: the in-joke lands
     better attached to something that already generates play, and it costs an evening on a branch
     rather than six on a new app. **Be honest about the asset reuse, though** — penalty-chaos has
     a goal, a keeper and a ball. A foul incident needs outfield players and contact animation,
     which don't exist yet. The reuse is the pipeline, the art style and the audience, not the
     sprites.
  2. **If a VAR game gets built at all, build the booth, not the swipe.** The one specific
     unserved request found in the whole scan is a player asking for *more* VAR:
     > "can you let us see all the camera when we are doing VAR because the players are blocking
     > the way so I can't see anything" — 4★, Soccer Referee Simulator 2026

     Nobody has made the VAR booth itself the game: scrub the replay, switch angles, **drag the
     offside line**. That is a skill with a genuinely right answer that is *visible in the
     picture* — which is exactly the rule playtest 1 discovered — so it escapes §3(c) entirely.
     It's RN-shaped (a scrubber, a draggable line, angle tabs, all reanimated). And an offside
     line is procedurally generatable, which breaks the content treadmill in §3(a). **That is a
     different idea and deserves its own research doc**, not a rewrite of this one.
  3. **Watch the duel hypothesis, don't build on it yet.** Playtest 1 raised it — that the
     pass-the-phone duel is the draw and football is the skin — and explicitly said one
     observation isn't enough to act on. A "you invent the foul, I call it, we argue" party mode
     would kill the content treadmill by making the players the content. It is also the least
     evidenced thing here. Second observation first.
