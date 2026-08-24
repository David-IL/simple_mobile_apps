# Viking Row

- **Slug:** `viking-row`
- **Status:** shelved <!-- draft | proceed | shelved -->
- **Date:** 2026-08-24

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

**Idea as pitched:** the crowd performs the Norwegian/Viking row; a player on the pitch who
looks like Erling Haaland (without using the name) drums the beat.

## 1. Problem and user

- **Problem:** none. Same as [penalty-chaos](penalty-chaos.md) — this is a joke you pass
  around, not a tool. The nearest real thing it serves: a ritual the target audience already
  performs together, turned into something you can do on a phone.
- **Who:** the 11-year-old and his team. Unlike penalty-chaos, the in-joke here is genuinely
  *shared and current* — Norwegian kids were doing this in kindergartens and offices through
  July 2026 ([ABC News](https://abcnews.com/GMA/Culture/norway-fans-viking-row-celebration-takes-world-cup/story?id=134128821)).
  That is the single best thing about this idea and it should be said first.
- **How often:** once. It is a meme, and memes have a decay curve. See §3.
- **Would I use it daily?** No — and here the honest answer is worse than for penalty-chaos:
  I'd play it *once*, because there is one verb.

## 2. Existing alternatives

Checked live on 2026-08-24 (`hl=en_US&gl=US`) unless marked otherwise.

| App | Installs | Price | Common complaint |
| --- | --- | --- | --- |
| [Viking Row](https://play.google.com/store/apps/details?id=com.vikingrowgame.app) (Whirlwin) | **1+** | Free + cosmetic IAP | No reviews yet — too new |
| [Steve Reich's Clapping Music](https://apps.apple.com/us/app/steve-reichs-clapping-music/id946487211) (NatureGuides) | iOS: 1,212 ratings, 4.8★ | Paid | Bluetooth/headphone latency wrecks the timing *(unverified wording — multiple secondary sources agree on the substance, no linkable quote found)* |
| [Football Crowd Sounds](https://play.google.com/store/apps/details?id=com.Sounds.Effects.Music.Ringtones.Football.Crowd) (Sounds Effects) | 500+ | Free | (couldn't confirm — Play lazy-loads reviews) |
| [Football Chant Soundboard](https://play.google.com/store/apps/details?id=com.uikey.footballchantsoundboardstadiumchantsfansounds) (UIKEY Studio) | 50+ | Free | (couldn't confirm) |
| [Supporter Wheel](https://apps.apple.com/app/supporter-wheel/id6760310754) (Morten Teinum) | "hasn't received enough ratings" | Free + $3.99 IAP | (couldn't confirm) |

**The finding that matters: this app already exists, and it is not similar — it is the same
app.** Whirlwin shipped *Viking Row* on 2026-08-07, roughly three weeks after the tournament
ended. From its own listing:

> "A marching bass drum counts you in — bam, bam — and you are the third beat. A pace bar
> charges toward a chalk line; tap the instant it arrives. Land the beat and your longboat
> pulls one stroke across the fjord. Ten strokes to a crossing, and eight clean ones carry you
> to the far bank — while the drum speeds up the closer you get."

Same name, same mechanic, same crescendo, same theme. It also ships:

> "Twelve pixel-art parody footballers — Erling Braut Hairland, Wayne Looney, Robert
> Lewangoalski, Hairy Kane and friends"

— which is the *exact* move [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md) rules
out, executed by someone who evidently thought a pun name was a shield. It isn't. This is a
free worked example of what not to do, sitting on the store.

Verified by fetching the APKCombo mirror and the live Play listing separately; both return the
same title, developer and copy, and the developer's own site
([vikingrowgame.com](https://vikingrowgame.com)) corroborates. Install count is the "1+"
bucket, no star badge, no review text — so there is **no evidence of product-market fit in
either direction**, just proof that the idea is obvious enough that it was already taken.

**What would be genuinely different about mine:** nothing mechanical. Offline and ad-free,
but so is that one. The only honest differentiator available is the same one penalty-chaos
found: the joke could be *theirs* — his team's chant, his team's names. That is a real
difference and it is also very thin.

## 3. Riskiest assumption

**That the meme is still alive by the time this ships.** Everything else about this idea rests
on the row being current, because the row *is* the idea.

The phenomenon itself is not in doubt — it is large and thoroughly documented
([Wikipedia](https://en.wikipedia.org/wiki/Viking_Row),
[FIFA](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/norway-fans-viking-row),
[ESPN](https://www.espn.com/soccer/story/_/id/49221882/norway-world-cup-viking-row-usa-fans-erling-haaland-martin-odegaard),
[Time](https://time.com/article/2026/07/06/erling-haaland-norway-brazil-world-cup-win-impossible-viking-row/)):
started by fan Ole Frøystad, broke out against Sweden on 2026-06-01, ran through the World
Cup, ~100,000 at the Royal Palace reception on 2026-07-13, seismographically detectable in
Oslo and Bergen. Still visible in late July via the Donnarumma wedding clip.

But the tournament ended in July. **A six-evening build against a meme whose peak is already
five weeks behind it is a race, and this repo is not paced for races** — penalty-chaos is
still mid-playtest on `app/penalty-chaos`. Whirlwin ran that race, got there in three weeks,
and landed on 1+ installs.

**Second, independent problem: there is no demand signal for a game of it.** Reddit searches
across r/soccer, r/norway, r/gaming and r/mobilegaming returned **nothing** — not a weak
signal, zero threads of anyone asking for a Viking-row game or app, in any phrasing. Plenty of
people love doing the row. Nobody said they wanted to tap it on a phone. That is the same
finding as penalty-chaos §3 ("enjoying watching chaos is not the same appetite as wanting
chaos"), and it lands harder here because the real thing is *free, social, and physical* — the
row's whole appeal is a thousand people doing it in sync. A single player tapping alone is the
one version of it with the joy removed.

**How to check cheaply, before writing code:** ask the son and two of his mates whether
they'd rather (a) tap a drum beat on a phone, or (b) just do the row. If the answer is (b),
that is the whole gate. Ten seconds, not ten minutes.

## 4. Offline-only or cloud backend?

- [ ] Sync across devices? — **No.** A score for a rhythm run is per-phone.
- [ ] Multiple users see each other's data? — **No.** Best case this is pass-the-phone, same
      as penalty-chaos. (Note the competitor added sign-in for cross-device progress. That is
      a running cost and a privacy policy bought for a cosmetic unlock — not a model to copy.)
- [ ] Accounts / login? — **No.**
- [ ] Logic that can't run on-device? — **No.** A metronome, a tap timestamp, a tolerance
      window. Arithmetic.
- [ ] Content updated without a release? — **No.**

**Decision: offline-only.** Nothing comes close to ticking. This is the least interesting
section of this doc — the backend question is trivially settled and it does not rescue the
idea.

## 5. MVP scope

Recorded for completeness; §9 says don't build it.

- **Must have:** tap on the beat, a drum that accelerates, a visible pace/crescendo indicator,
  a run that ends, a score.
- **Nice to have (v2):** the crowd responding in layers as you build; a shout at the top.
- **Explicit non-goals:** a Haaland lookalike, or any drummer identifiable as a real player
  (§7); pun names for real footballers; real kits, crests or competition names; online
  leaderboards; the name "Viking Row" as a store title, which is now taken.

## 6. Success metric

- **What would make it a success:** he plays it a week later. Same bar as penalty-chaos.
- **Who specifically will use it:** the son, his mates, the team. Same reachable dozen — and
  genuinely a *better* fit than penalty-chaos, because they already perform this ritual
  together. This is the strongest argument the idea has.
- **But:** the learning is largely a repeat. One-tap timing, `Animated`, EAS build, a phone
  that isn't mine — penalty-chaos is teaching all of that right now, on a branch that isn't
  merged. A second app that teaches the same lesson is not "something new was learned"
  ([ADR 6](../adr/0006-monetization-is-a-learning-goal.md)); it's the same lesson twice.
  The new learning on offer here is *audio timing*, which is real but is one evening's worth,
  not six.

## 6b. Does it fit React Native?

**This is the section the idea passes, comfortably.**

- **Core mechanic:** tap in time with an accelerating drum; sustained accuracy builds the row
  to a crescendo.
- **Is it RN-shaped?** Yes — "one-tap timing" is the first example named in
  [ADR 7](../adr/0007-game-rendering-approach.md). One tap handler, one timestamp diff against
  a scheduled beat, one tween on a pace bar. It is arguably the single most RN-shaped idea
  considered in this repo so far.
- **Physics / many bodies / per-frame collision / particles?** None needed. The crowd is a
  tiled background whose animation state steps with the beat, not thirty independent sprites.
  If a design idea wants individually animated crowd members, cut it — same rule as
  penalty-chaos §6b.
- **Tooling:** layout + `Animated`. **No Skia.**
- **The one genuine technical risk is audio latency, not rendering.** A rhythm game lives or
  dies on whether the tap-to-sound loop is tight, and Android audio latency varies wildly by
  device — the only competitor analogue with real users
  ([Clapping Music](https://apps.apple.com/us/app/steve-reichs-clapping-music/id946487211))
  has latency as its headline complaint, on iOS, which is the *easier* platform for this.
  This would need `expo-av`/`expo-audio` measured on his actual phone before anything else
  gets built. It is a real and interesting problem — and it is the only part of this idea that
  teaches something penalty-chaos doesn't.
- **Low-end Android:** the rendering is trivial; the timing is not. Test on his phone.

## 7. Play Store feasibility

- **The Haaland-lookalike drummer is ruled out. This is not a close call.**
  [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md) already settles it, and this
  case is *worse* than the one that produced the ADR:
  - ADR 8's test is "recognisably them, doing what they're famous for." A drummer leading the
    Viking row is not a generic archetype — it is a role exactly one person occupies in
    public consciousness. Ødegaard normally holds the drum and **handed Haaland the drumsticks**
    after the Brazil brace
    ([ESPN](https://www.espn.com/soccer/story/_/id/49149682/erling-haaland-norway-join-viking-row-win));
    Haaland drummed at the final; Google shipped a search easter egg keyed to *his name* that
    he promoted himself
    ([Olympics.com](https://www.olympics.com/en/news/erling-haaland-viking-rowing-search-my-name));
    he led it on stage at Donnarumma's wedding
    ([Yahoo](https://sports.yahoo.com/articles/erling-haaland-leads-viral-viking-170109741.html)).
  - So "a player who looks like Haaland, drumming the row" is not a caricature that *might* be
    recognised. It is the most identifiable image in Norwegian football right now, and the
    lookalike is doing the precise thing the real person is famous for. Dropping the name
    changes nothing — ADR 8: "caricature is not an exemption, it makes identification *easier*."
  - Whirlwin's "Erling Braut Hairland" is the same mistake with a fig leaf. Do not read its
    survival so far as evidence the move is safe; enforcement is complaint-driven and the app
    has one install.
  - Stake unchanged from ADR 8: the developer account that carries every app in this repo.
- **Also out:** Norway kit, national crest, "World Cup" or any competition mark. The
  competitor ships eight national kits. Don't.
- **Name collision:** "Viking Row" as a store title is taken as of 2026-08-07. Even setting
  IP aside, shipping a same-named clone of a three-week-old app is a bad look.
- **What survives the constraints:** a nameless, faceless pixel drummer in unbranded colours,
  tapping a beat. Which is the point §9 turns on — strip the parts ADR 8 forbids and the
  remaining idea has no football hook left in it.
- **Privacy policy:** required, for the same reason as penalty-chaos — Play requires one from
  any app whose target audience includes children, even with zero data collection.
- **Monetization: none.** Not the ad-learning app.
- **Android target:** Expo SDK default at scaffold time.

### 7b. Kids and ads

**Not applicable — no ads.** Skipped deliberately.

## 8. Time-box

N/A — see §9. If it were built, the honest box is **two evenings**, not six: evening one is
an audio-latency spike on his phone, and if the tap doesn't feel tight there is no game.

## 9. Decision

- **Decision:** shelve *(David, 2026-08-24 — on hold, not killed; see the revisit trigger below)*
- **Reasoning:**

  Four things point the same way, and they are independent of each other:

  1. **The premise is the part that's forbidden.** The pitch is "the crowd rows, a
     Haaland-lookalike drums." [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md)
     rules that out on a test this fails harder than penalty-chaos's keepers did — the
     drummer leading the row is a role one identifiable person owns, doing the thing he is
     famous for. Penalty-chaos survived the same constraint because there was a real game
     underneath the roster: a keeper that taunts and reads your pattern. Here, remove the
     lookalike and what's left is a metronome with a boat on it. **The idea does not have a
     second layer.**
  2. **It already exists, shipped, three weeks after the meme peaked.** Whirlwin's *Viking
     Row* has the same name, the same tap-on-the-accelerating-beat mechanic, the same
     crescendo, no ads, a cosmetic-only IAP — and 1+ installs with no reviews. That is not
     proof the idea fails, but it is proof the idea is obvious, and that someone who executed
     it fast and well got nothing for it.
  3. **Zero demand signal, and a structural reason for it.** Reddit returned nothing across
     every relevant sub. The row's appeal is a thousand people synchronised in a stadium. A
     phone version is that with the only good part removed — and the real thing is free and
     the kids can already do it.
  4. **The learning is a repeat.** One-tap timing, `Animated`, EAS, a phone that isn't mine —
     penalty-chaos is teaching all of that right now and isn't merged. Under ADR 6, "something
     new was learned" is a pass condition, and this mostly re-runs an old lesson.

  **The counter-argument, stated fairly, because it isn't nothing:** the audience fit is
  genuinely better than penalty-chaos's. The team *actually does this ritual*. That's a real
  in-joke with a real reachable group, which is exactly what ADR 6 asks for. And §6b is the
  cleanest RN fit yet considered. If the row were still climbing rather than five weeks past
  its peak, and if the drummer weren't the one thing ADR 8 forbids, this would be a closer
  call.

  **What to do with it instead — and this is the actual recommendation, not a consolation
  prize: put the row in penalty-chaos as a celebration.** Score a penalty, the crowd does the
  row, and you tap the drum to keep it going for as many beats as you can. It:
  - costs about one evening on a branch that already exists, instead of six on a new app;
  - lands the in-joke exactly where the audience already is, with no meme-timing race;
  - needs no drummer on screen at all — the crowd is the joke, so ADR 8 never binds;
  - teaches the one genuinely new thing here (audio timing on a real Android device);
  - and gives penalty-chaos a reward moment it currently doesn't have, at the point in the
    loop where the playtests said the keeper is the star and the texture is thin.

  Revisit as a standalone app only if the son plays that celebration more than the penalties.
  That would be a real signal, gathered for free, from a user who tells the truth.

## 10. Where it actually landed — 2026-08-24

Built, as the recommendation above said to: a row celebration on penalty-chaos's
result screen, offered only after a win. **Still shelved as a standalone app.**

Two things were measured rather than guessed, and both changed the design:

- **A two-minute recording of the real row** was analysed for onsets. The hits
  sit a constant 0.40s apart — median of 45 gaps across two full run-throughs,
  p25 0.37, p75 0.44 — and never accelerate. What accelerates is the *rest
  between cycles*: 10.1s, 6.1, 5.1, 4.2, 2.7, 1.8, 1.1, 0.95. So the mechanic
  ramps by shortening the gap between rows, not by speeding the beat up. The
  measured constants live in `src/game/row.ts` and are covered by tests.
- **§6b's audio-latency risk was real.** A throwaway lab screen measured **266ms
  of tap scatter** on the actual phone, nearly triple the point at which a timing
  window stops feeling fair. So there is no timing test at all: the crowd beats
  twice, the player answers with RO, and **the shout fires on the tap rather
  than on a grid** — you cannot be late against a sound you trigger yourself.
  §6b's warning was the most useful line in this document.

The drummer was never drawn, exactly as §9 required. The crowd carries it, so
[ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md) never binds — and
`RowCrowd.tsx` carries a comment saying not to add one later.

Run time is capped at 13 cycles, about 20 seconds, so it always finishes on the
crowd's roar rather than fizzling. See
[docs/design/penalty-chaos-stickiness.md](../design/penalty-chaos-stickiness.md)
for the surrounding work.
