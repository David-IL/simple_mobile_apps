# Coach Toolkit

- **Slug:** `coach-toolkit`
- **Status:** draft <!-- draft | proceed | shelved -->
- **Date:** 2026-08-24

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

**Idea as pitched:** an app for grassroots *fotballtrenere* — parents coaching their kid's team
without deep football knowledge. Three parts: (a) age-appropriate exercises with graphics,
(b) an easy digital tactics board with preset formations, (c) maybe a community layer for
sharing drills and tactics.

## 1. Problem and user

- **Problem:** a parent volunteers to coach because otherwise there is no team, has never
  played, and has to fill an hour on Tuesday with twelve nine-year-olds.
- **Who:** exactly David. That is the single strongest fact in this document and it should be
  said first — every other idea in this repo has been built *for* someone else. This one has a
  user who is in the room, holds the phone, and stands on the touchline every week.
- **How often:** weekly, seasonally, and it resets every autumn as new parents get volunteered.
- **Would I use it daily?** Weekly, not daily — which is the right cadence for a coaching tool.

**The problem is real and documented, loudly, going back a decade.** This is not a manufactured
need:

> "The org needs 5 head coaches or U8 won't happen at all this spring. I am 37F never played
> soccer, barely understand the rules, etc. but I want the kids to play so I signed up anyway…
> **I can barely dribble the ball, y'all!**"
> — [r/SoccerCoachResources, 2026-03-17](https://www.reddit.com/r/SoccerCoachResources/comments/1rwmctj/org_needs_coaches_or_all_u8_cant_play_i_have_no/)

> "I have a 90 page guide that lines out my season, I printed it out and put it in a binder,
> but, **I don't know how to play soccer!**"
> — [r/SoccerCoachResources, 2024-08-29](https://www.reddit.com/r/SoccerCoachResources/comments/1f47hf7/coaching_u8_no_experience_help/)

> "The guidance provided by the YMCA is bare bones and really just not helpful. **I don't know
> where to start.**"
> — [r/SoccerCoachResources, 2026-02-10](https://www.reddit.com/r/SoccerCoachResources/comments/1r11oy0/clueless_first_time_coach_for_u10/)

Norway has institutionalised it. NFF Vestfold runs an event whose title is the problem statement
verbatim — *"Hjelp, jeg har blitt fotballtrener!"*:

> "Hva gjør du når du mer eller mindre frivillig påtar deg å trene et fotballag i aldersklassene
> 5-12 år, og ikke aner hva du skal gjøre?"
> — [fotball.no, 2022-05-11](https://www.fotball.no/kretser/vestfold/klubb-leder-og-trener/trenerutvikling/hjelp-jeg-har-blitt-fotballtrener/)

**But read what they actually ask for.** Across every "new parent coach, help" thread collected,
the named pains are: how to structure an hour, how to hold seven-year-olds' attention, how to
handle subs and playing time fairly, and drills that work with kids who can't yet trap a ball:

> "**Even the most basic U8 drills assume a level of skill that most of my team lacks.** …
> drills requiring passing to a teammate are immediately going off the rails, torpedoing the
> best laid plans."
> — [r/SoccerCoachResources, 2026-05-07](https://www.reddit.com/r/SoccerCoachResources/comments/1t6nmua/even_the_most_basic_u8_drills_assume_a_level_of/)

Searching those same threads for *tactic*, *board*, *whiteboard*, *magnetic board* returns
**zero hits from the lost-parent-coach persona**. Not one asked for a tactics board. The gap
between the problem people describe and the feature the pitch leads with is the crux of this
doc — see §3.

## 2. Existing alternatives

Play data captured 2026-08-24 by pulling listing HTML directly (`hl=en&gl=US` and `hl=no&gl=NO`);
install bands are Play's own. Only Google's surfaced top reviews were visible, not the full
stream — so absence of a complaint below is not evidence there isn't one.

### The Norwegian incumbents — free, federation-backed, already in his coaches' hands

| Tool | Reach | Price | State / complaint |
| --- | --- | --- | --- |
| [tiim.no](https://tiim.no/) (NFF's own) | Web only, **no app found** | Free (presented as free; never stated outright — *unverified*) | Actively maintained; ~200 drills + prebuilt sessions banded 6-7/8-9/10-12/13-19, planner behind free IdrettensID login |
| [PocketCoach Football](https://play.google.com/store/apps/details?id=no.pocketcoach.app) | **1K+** installs, 5.0★ (15 reviews) | Free, no ads, no IAP badge | 500+ drills "kvalitetssikret i henhold til NFF sine retningslinjer", video, AI session generator, match assistant with playing-time tracking. Norwegian-native |
| [Treningsøkta S2S](https://play.google.com/store/apps/details?id=com.s2s.fm_no) | **10K+** installs, **2.5★** (115 reviews) | Free "light" tier; real value behind a club licence (fee not published — *unverified*) | "Muligens den dårligste appen jeg har brukt"; "henger igjen i en svunnen tid" |
| [Landslagsskolens øvelser](https://www.fotball.no/barn-og-ungdom/sportsplaner/landslagsskolen/ovelser/) | Open web | Free | Video drill bank; no planner, no diagrams-first UX |

NFF launched tiim in [April 2023](https://www.fotball.no/trener/2023/nff-lanserer-tiim/) as *"det
nye hjemmet for trenere i norsk fotball"* and shipped a
[2026 planverk refresh](https://tiim.no/artikkel/planverk-2026-var-storste-oppussing-pa-flere-ar).
It is current, not abandoned.

### Tactics boards — saturated, mature, and free at the tier that matters

| App | Installs | Price | Common complaint |
| --- | --- | --- | --- |
| [Coach Tactic Board](https://play.google.com/store/apps/details?id=com.bluelinden.coachboard) | **1M+**, 4.5★ (14.3K reviews) | Free + ads + $1.99–$19.99 IAP | "missing the most obvious feature (a ball)"; **"I'm coaching a 9v9 team that has 13 players on the roster"** and can't remove the extras |
| [TacticalPad](https://play.google.com/store/apps/details?id=com.clansoft.tacticalpadintlite) | **1M+**, 4.4★ (3.27K) | Free tier, then US$24–63/yr | "I paid for this app to own outright and now they changed the plan to monthly"; no Norwegian |
| [Tactics Board](https://play.google.com/store/apps/details?id=it.censa.tacticboardsoccer) (CensaSoft) | **100K+**, 4.6★ (1.46K) | IAP $2.99–$84.99 | (surfaced reviews all positive — couldn't confirm complaints) |
| [easy2coach Training](https://play.google.com/store/apps/details?id=net.easy2coach.exercisesDatabase) | **100K+**, 4.0★ (916) | IAP up to $194.99 | German-first: "I change the language from German to English… Close the app, go back in, it's back in German again… uninstalling" |
| [Coachbetter](https://play.google.com/store/apps/details?id=com.coachbetter.coachbetter) | 10K+, **1.9★** (81) | IAP $6.99–$159.99 | "You have to buy the ProPlan to fully evaluate the app's content (BAIT AND SWITCH)"; "I'm sure the app does a lot of great things if you're Manchester City… for American clubs where parents are responsible for tracking practice times, this app is a nightmare" |

**What is genuinely different about mine?** Honestly: **nothing, on either half.**

- On drills, the content *is* the product, and two free Norwegian sources already have ~200 and
  500+ drills respectively, both NFF-aligned, one with video. I am the confused parent in the
  premise — I am not qualified to author better football content than the federation, and no
  amount of good code closes that gap.
- On the board, this would be roughly the fortieth one. Two incumbents at 1M+ installs, both
  updated within the last month, free at the tier a volunteer would actually use.

**One real seam does show up, and it is worth writing down:** every board in that list is built
for 11-a-side and chokes on small-sided formats. The 9v9 reviewer forced to shuffle 13 players is
precisely the Norwegian barnefotball case — 3v3, 5v5, 7v7, 9v9. Neither tiim nor PocketCoach
ships a board at all. So "a board that *starts* at 5v5 and knows Norwegian youth formats" is a
genuinely unoccupied square. §3 is about whether anyone wants to stand on it.

**The ceiling signal, stated plainly:** PocketCoach is free, no ads, Norwegian-native,
NFF-aligned, 500+ drills with video — and sits at **1K+ installs**. Meanwhile
[Spond](https://play.google.com/store/apps/details?id=com.spond.spond), the admin app every
Norwegian grassroots team already has, is at **1M+ installs, 4.8★, 13.1K reviews**. A new
coaching app is not competing with tiim. It is competing for a slot on a home screen that
already has Spond on it.

## 3. Riskiest assumption

**That the tactics board is a thing grassroots youth coaches want at all.**

Everything in the pitch that isn't a drill library rests on it, and the evidence runs against it
from three independent directions:

1. **The persona never asks for it.** Zero mentions across every "new coach, help me" thread
   found. They ask about session structure, attention span, and subs.
2. **Experienced coaches say it is the wrong tool at this age.**
   > "**There's no point teaching team defense at this point beyond the basics of pressure and
   > cover.** … At U8, you are coaching the individuals, not the team. … **Technique, not
   > tactics.**" — [r/SoccerCoachResources, 2026-04-16](https://www.reddit.com/r/SoccerCoachResources/comments/1sn84tf/u8_soccer_how_do_you_play_structured_defense/)

   > "**children at 9 years of age do not have the motor skills to understand positioning etc.**"
   > — [r/SoccerCoachResources, 2025-08-08](https://www.reddit.com/r/SoccerCoachResources/comments/1mkgyl8/how_much_emphasis_on_positions_for_u10_rec_team/)

   A UEFA-A coach's own age-banding puts tactics at **5%** for young groups, *"more just
   explaining positions like goalkeeper, forward and MAIN functions, that's all"*
   ([r/bootroom, 2026-06-10](https://www.reddit.com/r/bootroom/comments/1u1x41n/stop_using_queues_circles_and_lectures_in_youth/)).
3. **Even coaches who own a board don't reach for it at the pitch.**
   > "Practice time is precious and I think it's **never worth it to lose any fumbling with
   > technology**. also for tactical display **I rarely use 'chalk boards' - I often use cones on
   > the ground or the players themselves.**"
   > — [r/SoccerCoachResources](https://www.reddit.com/r/SoccerCoachResources/comments/6xsldc/what_do_you_guys_think_about_this_tactic_board/)

Where boards *are* wanted: from roughly 9v9 upward, and often by a parent teaching their own kid
rather than a coach teaching a squad
([r/SoccerCoachResources, 2026-03-23](https://www.reddit.com/r/SoccerCoachResources/comments/1s1lced/online_soccer_position_tactics_board/)).
That is a narrower and older user than the one in the pitch.

**Second riskiest assumption, close behind: that a community layer would ever reach critical
mass.** The one honest first-hand account found is a coach-developer who built exactly this:

> "I built my own little app to provide players training drills and the ability to watch videos
> of the drills… I intended to use it for the entire club I used to coach for… **but never got
> past using it personally for my own team.**" … "**i let it die out and stagnate
> unfortunately.**" … "**Making it is the easy part. Keeping it going and getting others to USE
> it is the hard part.**"
> — [r/SoccerCoachResources, Oct 2023–Apr 2024](https://www.reddit.com/r/SoccerCoachResources/comments/16yaacs/what_apps_do_you_use_to_help_with_coaching_and/)

And the distribution reality, from a 2026 thread on this exact app concept:

> "**the hard part is not the coach side, it is that parents will not install anything.** … The
> moment you require an account plus an app download, you lose a chunk of the families, and you
> are back in the WhatsApp group anyway."
> — [r/SoccerCoachResources, 2026-08-05](https://www.reddit.com/r/SoccerCoachResources/comments/1ulrbq4/youth_coaching_app/)

Same thread, on willingness to pay:

> "There are already so many apps out there and people keep building/creating more. Meanwhile
> **none of us freelancers wanna pay (much) for an app cos we don't get paid.**"

There is also a striking structural signal. r/SoccerCoachResources runs a periodic promo thread
for coaching tools. The [June 2026 one](https://www.reddit.com/r/SoccerCoachResources/comments/1uil4rb/apps_studies_groups_etc/)
got one post and zero replies; the [July 2026 one](https://www.reddit.com/r/SoccerCoachResources/comments/1v7sw7g/apps_studies_groups_etc/)
got four posts, all from builders, zero coach replies. Tactics boards posted in 2026 alone
include `usetactix.com`, `ftb.kindoapps.com`, `drawthedrill.com`, `kickert.info/soccerboard` and
`tacticstouches.com`. **Supply of this exact app massively exceeds observable demand**, and the
queue of hobby boards getting no answer is what this project would be joining.

### How to check both cheaply, before writing any code

**This is the best cheap check available to any idea in this repo so far, because the user is
me.** Two weeks, zero lines of code:

1. Install [PocketCoach](https://play.google.com/store/apps/details?id=no.pocketcoach.app) and
   open [tiim.no](https://tiim.no/). Plan and run **four real sessions** with them.
2. Note after each: what did I actually reach for the phone for? What did I want and not find?
   Did I once wish for a tactics board — at the pitch, with the kids waiting?
3. Ask two other coaches at the club what they use. If the answer is "nothing" or "YouTube the
   night before", that is a finding. If it's "PocketCoach", that is a bigger one.

If four sessions pass and the board never came up, §9 is settled without a single commit.

## 4. Offline-only or cloud backend?

Answered against the *actual* MVP, not the someday version.

- [ ] **Sync across a user's devices?** — **No.** One coach, one phone, at the pitch. A tablet
      version is a someday-want, not an MVP box.
- [x] **Multiple users see each other's data?** — **Yes, but only for the community layer.**
      This is the one box the pitch ticks, and it ticks it hard.
- [x] **Accounts / login?** — **Only if the community layer ships.** Nothing else here needs
      identity.
- [ ] **Logic that can't run on-device?** — **No**, at MVP. Worth naming the temptation:
      PocketCoach's AI session generator would mean a third-party API key, which means a server
      to hold it, which means a backend and a running cost. Don't.
- [ ] **Content updated without a release?** — **No.** A bundled drill JSON at this scale ships
      in a release. This is only a "yes" at a content volume this app will never reach.

**Decision: offline-only — and that decision is only available if the community layer is cut.**

That is the cleanest architectural finding in this doc. Cut part (c) and the app is a bundled
JSON, `AsyncStorage`, and no server. Keep part (c) and it drags in a backend, auth, a privacy
policy, a Data safety declaration, UGC moderation and reporting under Play policy, and a
cold-start problem the evidence in §3 says nobody has solved — **all to build the third of the
idea with the least demand evidence behind it.** Against the repo's standing preference for
offline-only, the community layer costs the most and is supported by the least. Cut it.

## 5. MVP scope

Recorded for completeness; §9 recommends not building this as pitched.

- **Must have** (if the narrowed version in §9 were built): a roster, small-sided formats
  (3v3/5v5/7v7/9v9), a pitch that matches the chosen format, draggable player tokens, preset
  formations per format, freehand drawing and erase, save/clear.
- **Nice to have (v2):** step-through of a move; export a board as an image to paste into the
  Spond group chat; equal-playing-time and substitution planning (see §9 — this may be the
  *real* app).
- **Explicit non-goals:**
  - **A drill library.** It is content-authoring, not mobile development, and it is already free
    from NFF and PocketCoach. Building it is copying homework badly.
  - **The community layer.** See §3 and §4.
  - **Any club crest, kit, competition name, or real coach's or player's name**
    ([ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md)). Team names are user input,
    typed on-device, never shipped assets.
  - **Player photos.** See §7 — photos of named children is the one genuinely serious data
    problem this app could create for itself.
  - **Anything parents have to install.** The quote in §3 is unambiguous.

## 6. Success metric

Per [ADR 6](../adr/0006-monetization-is-a-learning-goal.md): it shipped, it works, someone
actually used it, something new was learned.

- **What would make it a success:** I use it at a real training session, unprompted, three weeks
  after building it — and reach for it *instead of* the alternative, not as well as it.
- **Who specifically will use it?** **Me.** Then, plausibly, the two or three other coaches in
  the same age group at the club, and the club's *trenerkoordinator*. This is the strongest §6
  answer of any idea in this repo — the user is the author, so "someone actually used it" is
  nearly guaranteed and the feedback loop is same-day. That is genuinely reachable, in-person
  distribution, which is what this section asks for.

  **The counterweight, and it is heavy:** because I am the user, I can also just install
  PocketCoach this evening, for free, and have more than I would build. "Someone actually used
  it" is not much of a bar when the someone is the person who wrote it. The harder version of
  the question is whether a *second* coach keeps using it after week three — and the
  builder-graveyard quote in §3 says that is exactly where these die.
- **What would be learned:** gesture handling and drag on the UI thread, SVG path drawing from
  touch input, and persistence — none of which penalty-chaos covers. That part is real; see §6b.

## 6b. Does it fit React Native?

Per [ADR 7](../adr/0007-game-rendering-approach.md). **This section passes cleanly, and it
matters that the reason to shelve is not a technical one.**

- **Core mechanic:** drag player tokens onto a pitch, draw arrows and runs over them with a
  finger, load a preset formation, clear.
- **Is it RN-shaped?** Yes. ADR 7 names "drag-and-release aiming" and "card and grid
  interactions" — draggable tokens are the same gesture family with the release doing less work.
  Freehand drawing is touch points accumulated into an SVG `Path`.
- **Physics engine, dozens of moving bodies, per-frame collision, particles?** **None.** Tokens
  move because a finger moves them. Nothing simulates, nothing collides. Twenty-two tokens is
  the theoretical worst case and Norwegian barnefotball caps it far below that — a 5v5 board is
  ten. Comfortably inside what ADR 7 asks for.
- **Tooling:** `react-native-gesture-handler` + `react-native-reanimated` for token drag on the
  UI thread, and `react-native-svg` for the pitch, tokens, and drawn paths.
  [ADR 9](../adr/0009-svg-for-character-art.md) already adopted `react-native-svg` and confirmed
  it ships in Expo Go, so this costs nothing on the dev loop. **No Skia.**
- **The one honest technical risk:** freehand drawing accumulates points fast, and a naive
  implementation re-renders a growing `Path` string on every touch move. The mitigation is
  ordinary — throttle point capture, simplify the path, commit finished strokes to a static
  layer and keep only the in-progress stroke live. If that still janks on a low-end Android,
  *that* is the one condition under which Skia would be the right answer, and it should be
  measured before it is assumed.
- **Low-end Android:** needs testing on a real cheap phone, outdoors, in sunlight, with cold
  hands — that is the actual use context, and it argues for big targets and few controls more
  than any design doc would.

**Localisation is already solved here.** [ADR 10](../adr/0010-localisation-typed-bundles.md)
established typed message bundles with `nb` as the default. A Norwegian-first coaching tool is
close to free on that axis — and per §2, localisation failure is a top complaint against the
largest drill app in the category.

## 7. Play Store feasibility

- **Target audience is adults**, not children. A real and pleasant difference from
  penalty-chaos: the app is used *by* coaches, so it declares 13+/18+, Families policy does not
  bind, and §7b is genuinely not applicable rather than merely skipped.
- **The serious risk is not policy, it is data.** A roster is the names of identifiable minors.
  Kept purely on-device with no network, no analytics and no backup, that is defensible and
  needs no collection disclosure. Add **player photos**, or a **community layer**, or any sync,
  and it becomes personal data about children in someone else's hands — with a privacy policy, a
  Data safety declaration, and a duty of care a hobby project should not take on.
  **Names-only, on-device, no network.** That constraint is doing a lot of work and should be
  treated as a hard line, not a default.
- **UGC:** if the community layer ships, Play requires moderation, in-app reporting, and a way
  to block users. Another reason §4 cuts it.
- **Privacy policy:** not required for the offline, names-only version — no personal data leaves
  the device. Verify against Play's current Data safety wording at submission rather than
  trusting this line.
- **[ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md):** no club crests, kits, or
  competition names in the binary or the listing. Formations are geometry, which is not
  protectable — but don't name one after a club or a real manager, and don't let a real club's
  name appear in a screenshot.
- **Monetization: none.** Not the ad-learning app.
- **Android target:** Expo SDK default at scaffold time.

### 7b. Kids and ads

**Not applicable.** No ads, and the declared audience is adult coaches rather than children.
Skipped deliberately.

## 8. Time-box

**Zero evenings until the §3 check is done.** Four real training sessions using PocketCoach and
tiim, over two weeks. That check costs nothing and can kill or confirm the whole idea.

If it survives: **four evenings** for the narrowed board in §9, hard stop. Evening one is a drag
and draw spike on a real phone — if that doesn't feel good in the hand, there is no tool.

## 9. Decision

- **Decision:** shelve as pitched *(recommendation — David's call)*
- **Reasoning:**

  The problem is real. The *pitch* is three apps stapled together, and each one fails
  independently, for a different reason:

  1. **The drill library is content work, not mobile development — and it is already free.**
     tiim gives every Norwegian coach ~200 NFF drills banded by age; PocketCoach gives them 500+
     with video, free, no ads, in Norwegian. The premise of this app is that I *don't* know much
     about football, which is exactly why I can't author better content than the federation.
     There is no version of this where good code closes that gap.
  2. **The tactics board is the feature the target user never asks for.** Zero mentions across
     every lost-parent-coach thread found. Experienced coaches at U8–U10 say "technique, not
     tactics" and put tactics at 5% of a session. Coaches who own boards say they use cones and
     the players themselves at the pitch. Meanwhile the category has two incumbents at 1M+
     installs and a visible 2026 queue of hobby boards getting zero replies. **It is the part
     that would be most fun to build and the part with the least evidence anyone wants it** —
     worth naming, because that is precisely how this repo would lose six evenings.
  3. **The community layer is the only thing that ticks a backend box, and it has the worst
     evidence behind it.** It costs a server, auth, a privacy policy, UGC moderation and
     children's data risk — to build the feature whose one honest first-hand account ends "i let
     it die out and stagnate." Cold start plus zero willingness to pay plus a free federation
     incumbent is not a gap, it's a trap.

  **Stated fairly, because it is not nothing — this idea has the best §6 answer in the repo.**
  The user is the author. Distribution, the binding constraint that shelved viking-row, is
  solved here by standing on the touchline. §6b passes with no stack argument at all, and the
  learning on offer (gesture drag on the UI thread, SVG paths from touch, persistence) is
  genuinely new relative to penalty-chaos. If the demand evidence pointed the other way this
  would be a proceed. It doesn't.

  **What to do instead — the actual recommendation, not a consolation prize.**

  Two narrower things came out of the research with *better* evidence than anything in the
  pitch. Both are offline-only, both are RN-shaped, both are things I would personally use every
  Saturday:

  - **Playing-time and substitution fairness for small-sided formats.** This is the one tool
    category coaches recommend to each other *unprompted* — SubTime, SubCav, SubSMART and
    intelli.coach all came up organically, which the tactics boards never did. Repeated
    independent builds *plus* organic recommendation is the demand signal the board lacks. It is
    a roster, a timer and arithmetic: offline-only without argument, no children's data leaving
    the phone, and honestly useful at 5v5, where "did everyone play the same amount" is a thing
    parents notice and I currently track on my fingers. **Worth its own research doc.**
    (Whether NFF's barnefotball rules actually mandate equal playing time is *unverified* here
    and should be checked — it would strengthen or weaken the case materially.)
  - **If a board is built at all, build the seam, not the category.** Every existing board
    assumes 11-a-side; a 9v9 coach's review complains about shuffling players he can't remove. A
    board that *starts* at 3v3/5v5/7v7/9v9, in Norwegian, with barnefotball formats preset, is
    the one unoccupied square — and neither tiim nor PocketCoach ships a board at all. That is a
    real differentiator, unlike "simpler than TacticalPad". But note it is a *narrower* version
    of the least-wanted third of the pitch, and §3's cheap check should run first.

  **Do the §3 check before deciding anything.** Four real sessions with PocketCoach and tiim,
  two weeks, no code. I am the user — this is the rare case where the riskiest assumption can be
  tested by going to training on Tuesday. If the board never comes up in four sessions, this doc
  is finished. If it does, the narrowed small-sided board is a four-evening build with a clear
  reason to exist.
