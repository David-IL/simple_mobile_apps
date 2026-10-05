# Self-served Renovation PM

- **Slug:** `renovation-pm`
- **Status:** draft <!-- draft | proceed | shelved -->
- **Date:** 2026-09-24

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

**Idea as pitched:** "the self-served renovation project manager". It is for homeowners who act
as their own general contractor (GC): they hire the plumber, electrician, carpenter and tiler
directly and coordinate them. It has two parts:

- **(a)** a helper for sequencing and coordinating the trades;
- **(b)** an estimate of the money saved by not paying a GC or project manager.

The premise is David's own experience from two years of refurbishing: self-managing saved a lot
of money but cost a lot of time and learning. Earlier projects that had a hired project manager
still coordinated the trades badly.

**Research caveat:** Reddit was blocked for the research tools this run, so r/HomeImprovement,
r/Renovations and r/Norge were **not checked**. The demand evidence comes from Houzz, TeamBlind,
ByggeBolig, Kvinneguiden and official Norwegian sources. Before the §3 check, a hand search of
Reddit is worth 20 minutes.

## 1. Problem and user

- **Problem:** when a homeowner hires trades separately, nobody owns the order of work or the
  hand-offs between trades. That job is theirs, and they learn it by getting it wrong.
- **Who:** David, first. He has run several projects himself, including the Østenstadlia
  bathroom, whose folder already holds membrane datasheets (1K-DS, HA-membran), tile-adhesive
  sheets and photos. After David: homeowners in Norway doing a bathroom or kitchen with 2–4
  hired trades.
- **How often:** **rarely, then intensely.** A household does one of these projects every year or
  two. During a project the app would be used daily for 4–10 weeks, then not at all. That shape
  matters for everything in §6.
- **Would I use it daily?** Only during a project. At the moment no project is running.

**The problem is real, and people describe it in their own words:**

> "I'm trying to be my own general contractor(mine quit on me)... **what order do I plan the rest
> of the subcontractors** for a whole house remodel?? … Do they install bathtubs, fixtures and
> toilets or just place water lines? Who's jurisdiction is moving a gas line a few feet??"
> — [Houzz](https://www.houzz.com/discussions/1002457/sub-contractor-expectations-scheduling)

> "Rørlegger nekter å tegne denne streken... **Hvem av fagfolkene bør ta ansvaret?**"
> — [ByggeBolig](https://byggebolig.no/dusj-badekar/hvem-har-ansvaret) (the tiler and the
> plumber each said marking the drain position was the other one's job)

> "Man skal avtale, stille opp, svare opp og beslutte, følge opp at avtalene blir opprettholdt
> samtidig som man ivaretar familie"
> — [Kvinneguiden](https://forum.kvinneguiden.no/topic/1925569-pusser-opp-ved-hjelp-av-h%C3%A5ndverkere)

**Look at what that last quote is actually about.** It lists making appointments, being there,
answering questions, making decisions and chasing people. It is not about *knowing the order*.
§3 depends on this distinction.

**On the hypothesis that hired project managers coordinate badly: partly supported.** The
complaints are real. But they are mostly about **a GC who is absent or doesn't supervise**, not
one who gets the sequence wrong:

> "The main contractor does not come in person to recheck the subs work"
> — [Houzz](https://www.houzz.com/discussions/6468982/bad-contractor-subcontractor-job-what-to-do)

That is a people problem. A homeowner's app does not fix it.

## 2. Existing alternatives

Install counts were read from the live Google Play listing HTML on 2026-09-24.

| App | Installs | Price | What it is / common complaint |
| --- | --- | --- | --- |
| [Houzz](https://play.google.com/store/apps/details?id=com.houzz.app) | **10M+**, 4.3★ | Free (Houzz Pro is paid, for contractors) | Design ideas and finding pros; project management for owners is thin. "randomly start charging you over $200 a month" |
| [HomeZada](https://play.google.com/store/apps/details?id=com.homezada.mobile) | **10K+** | Freemium plus subscription | Renovation budgets and schedules are on the web; the app is mostly home inventory. Mobile "lacks key features available on desktop"; auto-renew and refund complaints ([G2](https://www.g2.com/products/homezada/reviews), summarised) |
| [PlanMyReno](https://planmyreno.app/) | **iOS only**, installs couldn't be confirmed | Couldn't confirm | **The closest match.** UK, DIY homeowners: budget, trade contacts, payment milestones, trade calendar, snag list, site journal. **No sequencing, no savings figure** |
| [Mittanbud](https://play.google.com/store/apps/details?id=no.mittanbud.mittanbud) | **100K+**, 4.8★ | Free (trades pay for leads) | Marketplace for quotes; does not coordinate. "Passwordless login does not work… What do I have the app for then?" |
| [Buildertrend](https://play.google.com/store/apps/details?id=com.BuilderTREND.btMobileApp) / [CoConstruct](https://play.google.com/store/apps/details?id=com.co_construct.htmlapp) | **500K+** / **100K+** | Paid SaaS for professionals | Real scheduling with dependencies, but priced and designed for builders, not homeowners |
| Trello / Notion / Excel | n/a | Free | What owner-builders actually use, per [vendor blogs](https://app-renohub.com/blog/best-apps-for-managing-a-home-renovation/). No organic user threads were found to confirm this |

Also in this space: Checkatrade (UK, 500K+) and Thumbtack (US, 5M+) are lead marketplaces with
no coordination. **Boligmappa** is the Norwegian national archive of documentation for each
home: trades upload from their own job systems, and it publishes a
[documentation checklist per trade](https://www.boligmappa.no/dokumentasjonskrav), including
photos of hidden construction in wet rooms. It covers documentation **after** the work, not
planning. Its homeowner Android app returns "Not found" on Play; it may have moved into Hjemla GO
(unverified).

**What is genuinely different about mine?** For part (a), **no homeowner app encodes trade
sequencing and dependencies** ("rough-in before closing the walls", "membrane before tiling",
"electrician's samsvarserklæring before the ceiling goes up"). That is a real, empty square. But
the content is free as static guides (for example
[Sime](https://sime.no/artikler/riktig-rekkefolge-nar-du-pusser-opp) and
[pusseoppbad.no](https://www.pusseoppbad.no/guide/pusse-opp-bad)). The square is empty partly
because a checklist is easy to find once you know to look for one.

For part (b), nothing does it, and there is a reason (see §3).

**The ceiling signal:** HomeZada has been a homeowner renovation planner for over a decade and
sits at 10K+ installs. The one app built exactly for this persona, PlanMyReno, hasn't shipped to
Android. The category does not pull.

## 3. Riskiest assumption

**That the time a self-managing homeowner loses goes to *not knowing what to do next*, rather
than to *getting other people to do it*.**

An app can fix the first: sequencing, hand-off checklists, what to ask each trade. It can't fix
the second: trades that don't show, quotes that don't arrive, being on site at 07:00. Every
source found puts most of the pain in the second group:

- The Kvinneguiden quote in §1 is entirely follow-up and presence.
- The GC complaints in §1 are about absence, not sequence.
- Trades prioritise GCs who bring repeat work, and one-off homeowners pay near-retail rates
  ([Benton Builders](https://www.thebentonbuilders.com/blog/general-contractor-vs-self-managing-subcontractors-which-approach-actually-saves-you-more)).
  A calendar doesn't change either fact.
- A homeowner who remodels "just once a year" said self-managing "will accelerate the budget and
  increase the timeline unless you yourself are a construction professional". The same thread
  also said: "let [the GC] earn that 25%"
  ([Houzz](https://www.houzz.com/discussions/4622346/addition-and-remodeling-general-contractor-or-sub-contractors)).

**The second risk is the savings estimate, which makes a claim the evidence contests.** GC and PM
markups are real:

- Norway: roughly 15–25%, and 20–25% on bathrooms
  ([Oppussingsguiden](https://www.oppussingsguiden.no/by/oslo/totalentreprenor-oppussing/),
  unverified snippet).
- Norway, site management only: about 25,000 kr for roughly 20 hours on a bathroom
  ([Byggstart](https://www.byggstart.no/pris/byggeledelse)).
- US: 20–30%; UK: 15–20% (unverified snippets).

But the offsets are also real: retail pricing for one-off customers, trades standing idle when a
hand-off slips, and the owner's own hours. Byggstart
[argues outright](https://www.byggstart.no/pris/totalentreprenor) that self-managing may not save
money. A calculator that says "you saved 22%" invites the owner to count the markup and forget
the offsets. A fair version (markup avoided, minus retail premium, minus your hours times your
hourly rate) is one screen and a spreadsheet, not an app.

### How to check it cheaply, before writing any code

The user is David, and the evidence is already on disk. One evening, no code:

1. **Do a post-mortem of the last two projects**, starting with Østenstadlia. List every day or
   week that was lost, and label each one **K** (didn't know what came next, or the order was
   wrong), **F** (follow-up: a trade didn't show, a quote was late, waiting for materials) or
   **D** (documentation was missing or had to be chased afterwards).
2. **If K is a small share, part (a) solves the wrong problem.** Shelve it.
3. Add up actual spend against what a totalentreprenør quote would have been, *including your own
   hours*. If you can't reconstruct that for your own project, nobody using the app will be able
   to either, and part (b) is dead.
4. Ask two or three friends or neighbours who have renovated the same question: where did the
   time go?

If D turns out bigger than expected, read §9.

## 4. Offline-only or cloud backend?

Answered from the *actual* MVP: one homeowner, one phone, one project.

- [ ] **Sync across a user's devices?** — No. One phone on site.
- [ ] **Multiple users see each other's data?** — **Not at MVP, and this is the temptation to
      name.** "Share the plan with the plumber and the electrician" is the obvious v2, and it
      ticks this box hard. It needs trades to install an app, which they won't; they have their
      own systems, per Boligmappa's integrations with 70+ trade systems. Sharing by SMS, PDF or
      the share sheet covers it without a server.
- [ ] **Accounts / login?** — No.
- [ ] **Logic that can't run on-device?** — No. Templates and arithmetic.
- [ ] **Content updated without a release?** — No. Sequencing templates for bathroom and kitchen
      change on the timescale of våtromsnormen revisions, not weekly.

**Decision: offline-only.** Nothing is ticked. Photos stay in app storage, and exports go through
the OS share sheet.

## 5. MVP scope

Recorded for completeness; §9 recommends not building this as pitched.

- **Must have** (if the narrowed version in §9 were built): one project, based on a room-type
  template (bad / kjøkken); a phase list with dependencies ("don't close the wall until…"); per
  trade, the documents to collect (samsvarserklæring, membrane type, wet-room documentation);
  photo capture tied to a phase ("hidden construction before closing"); export to PDF.
- **Nice to have (v2):** trade contacts with call/SMS shortcuts; a simple budget of quote against
  actual; a date per phase.
- **Explicit non-goals:**
  - **A marketplace or finding trades.** Mittanbud and Servicefinder own that.
  - **Sharing with the trades or a multi-user plan.** See §4.
  - **A savings calculator presented as an outcome.** See §3. If anything, show an honest
    breakdown with the owner's own hours included, clearly labelled as an estimate.
  - **Building advice framed as authoritative.** The app is a checklist, not a statement of what
    TEK17 or våtromsnormen requires. It links to the source; it does not paraphrase regulation.
  - **Being Boligmappa.** Export *to* it; don't archive in competition with it.

## 6. Success metric

Per [ADR 6](../adr/0006-monetization-is-a-learning-goal.md): it shipped, it works, someone
actually used it, something new was learned.

- **What would make it a success:** during the next real project, David opens it on site and
  it catches one thing that would otherwise have been missed: a photo not taken before a wall
  closed, or a samsvarserklæring not collected. The handover PDF goes into Boligmappa.
- **Who specifically will use it?** **David, but only when a project is running.** That is the
  weakest part of this idea. Coach-toolkit had a user every Tuesday; this one has a user for six
  weeks every year or two, and **no project is running right now**. An app built without a live
  project is tested against memory, not use.
  - After David: friends and neighbours who happen to be renovating at the same time. That is a
    real but small and random group, with no club or team to reach them through. "Homeowners who
    find it on Play" is nobody, and the §2 install counts confirm it.
- **What would be learned:** camera capture and app storage (`expo-image-picker` /
  `expo-file-system`), PDF generation (`expo-print`), share intents, and modelling a dependency
  graph. Almost none of it overlaps with the game apps, so the learning is genuine.

## 6b. Does it fit React Native?

Not a game, so ADR 7 barely applies, and this section passes easily.

- **Core mechanic:** tick through a phase checklist, attach photos and documents, export.
- **RN-shaped?** Yes: lists, forms, camera and a share sheet. Standard Expo modules.
- **Physics, many moving bodies, per-frame work?** None.
- **Tooling:** layout only. No Reanimated or Skia needed.
- **Low-end Android:** the risk is photo storage size and PDF generation with 50+ images, not
  rendering. Downscale photos on capture.

## 7. Play Store feasibility

- **Policy risk:** low. The real risk is **advice liability in tone**: sequencing guidance for
  wet rooms and electrical work must not read as professional advice. Label it as a checklist,
  link to DiBK and Fagrådet for våtrom, and state that electrical work is for a registered
  electrician ([DiBK](https://www.dibk.no/smartere-oppussing/artikler/bruk-fagfolk)).
- **Privacy policy:** likely not required if everything stays on-device. Trade contact details
  are third-party personal data, but they are stored locally and never transmitted. Photos of the
  home stay in app storage. Check against Play's Data safety wording at submission.
- **Permissions:** camera, and possibly photo library. Both are ordinary.
- **Monetization:** none. This is not the ad-learning app.
- **Android target:** the Expo SDK default at scaffold time.

### 7b. Kids and ads

**Not applicable.** No ads, and the audience is adult homeowners.

## 8. Time-box

**Zero evenings until the §3 post-mortem is done.** It takes one evening, with the Østenstadlia
folder open.

If the post-mortem points at the documentation variant in §9: **four evenings**, hard stop, and
ideally timed so that evening five is the start of a real project.

## 9. Decision

- **Decision:** shelve as pitched *(recommendation; David's call)*. The narrowed documentation
  variant **needs more research**, and the §3 post-mortem is that research.
- **Reasoning:**

  **Stated fairly, first.** Of all the ideas in this repo, this is the one David knows best from
  the inside: he has done the job, repeatedly, and has the paperwork. The sequencing gap is real;
  no homeowner app encodes trade dependencies. §4 and §6b pass cleanly. The learning (camera,
  files, PDF, share) is new relative to everything else here.

  **Why not as pitched:**

  1. **Part (a) targets the pain an app can fix, and the evidence says that is the smaller
     pain.** Owner-builders lose time to follow-up, no-shows and being on site, not mainly to
     not knowing the order. The order is available free in Norwegian guides.
  2. **Part (b) makes a claim the evidence contests.** The 15–25% markup is real. So are the
     retail premium, idle trades and the owner's own hours, and Byggstart argues self-managing
     may not save money at all. An honest calculator is a spreadsheet; a flattering one is
     misleading.
  3. **The usage shape is the killer for this repo specifically.** It is used for six weeks
     every year or two, no project is live now, and there is no reachable group of users. ADR 6
     asks for "someone actually used it". Here the realistic answer is "David, at some future
     date", tested in the meantime against memory.
  4. **The category doesn't pull.** HomeZada has spent a decade at 10K+ installs. The one app
     built for exactly this persona hasn't reached Android. Nobody was found asking for a tool.

  **What to do instead: the angle with the best evidence.**

  The most concrete, Norway-specific hook the research found wasn't sequencing. It was
  **documentation before the wall closes**. Since the 2022 change to avhendingslova, a wet room
  without documentation is marked down in the tilstandsrapport when the home is sold
  ([Boligmappa](https://www.boligmappa.no/dokumentasjonskrav)). The exact grade was reported as
  "the worst" but *couldn't be confirmed*; check forskrift om tilstandsrapport. Boligmappa's own
  checklist asks for photos of hidden construction and for membrane and board types. Those are
  exactly the things David already collects by hand in the Østenstadlia folder.

  A small offline app does this: per phase, "what to photograph and collect before the next
  trade starts", then one PDF for Boligmappa or the eventual buyer. It is narrow, it is
  sequencing reduced to the one hand-off that costs money years later, it needs no backend, and
  it has a clear "caught one thing" success test. It still has the usage-shape problem, so
  **build it only when a real project is about to start**, not before.

  **Open question for the check:** do Norwegian trades now reliably upload to Boligmappa
  themselves? If they do, the gap is mostly the owner's own photos of hidden work, which is
  smaller still. Look at what actually arrived in Boligmappa for the Østenstadlia bathroom.
