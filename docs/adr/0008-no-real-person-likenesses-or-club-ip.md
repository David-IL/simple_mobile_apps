# 8. No real-person likenesses or club IP; characters are behaviour archetypes

- **Status:** accepted
- **Date:** 2026-08-21

## Context

The apps lean football, so real footballers, real clubs, and real kits are a constant
temptation — they are free authenticity. The question arrived concretely in the
[penalty-chaos](../research/penalty-chaos.md) gate: a roster of 5–10 international
goalkeepers, drawn as comedic caricatures, plus a custom keeper the player names themselves.

The reasoning behind rejecting the first half of that is in
[docs/reference/likeness-and-ip.md](../reference/likeness-and-ip.md). Condensed:

- The exposure is **personality rights**, not copyright, and the parody/caricature exception
  lives in copyright — it does not reach identity claims.
- **Caricature makes it worse.** A caricature nobody recognises has failed as a caricature.
  Recognisability is the operative test in every regime checked.
- The medium-shift doesn't work anyway. Norway's åndsverkloven § 104 covers *photographs*, so
  a drawing sidesteps it — but markedsføringsloven § 25 doesn't care about the medium, and
  Germany's KUG § 22 explicitly covers drawings and caricatures.
- The video-game case law is consistent and bad for us: *Hart v. EA*, *Keller v. EA* and
  *No Doubt v. Activision* all turn on the defendant losing despite stylised, non-photographic
  avatars. *Kirby v. Sega* is the only clear win, and only because the character was genuinely
  a new character. The test is "recognisably them, doing what they're famous for" — which
  describes a named goalkeeper saving penalties exactly.
- EA licenses likenesses from FIFPro and kept doing so through losing the *FIFA* name. That is
  the industry's revealed opinion on whether it's optional.

Play's own policy has no likeness clause and enforcement is complaint-driven, so the
*probability* against a hobby app is genuinely low. The problem is the asymmetry: the stake is
a developer account that carries every future app in this repo, under a real name, and
suspension cascades to related accounts. The risk only materialises if the app gets shared —
which is the outcome we're building for.

There is also a design argument, and it is the stronger one. *La Vieja contra el Dibu* — the
one thing in this space that actually went viral — works on **one** keeper the audience has a
personal-feeling relationship with. A roster of eight internationals is that effect divided by
eight. The keeper that will get a laugh in a real changing room is the one named after the
local club's actual keeper. **The risky feature is also the weaker feature.**

## Decision

No real person's name or likeness, and no club, kit, or competition trademark, ships in any
app binary or store listing in this repo. Caricature is not an exemption.

Instead:

- **Characters are behaviour archetypes with invented names.** A character is a parameter set
  anyway — for a keeper: taunt frequency, how many shots back it pattern-matches, dive bias,
  how much it telegraphs. Ship those as named personalities (The Chatterbox, The Wall, The
  Line-Dancer, The Statue) with original art. The roster then doubles as the difficulty curve.
- **Renaming is a local user action.** Let the player rename *any* character on their own
  device. A name typed on a phone and stored there is not something we published. It never
  enters the binary, the screenshots, or anything shareable.
- **Never trace a photograph.** That is the photographer's copyright — the one claim here with
  a working takedown pipeline.
- **Restrict release countries when the audience is local.** Play distribution is global by
  default, which means the strictest jurisdiction shipped to governs.

## Consequences

- Costs the cheap authenticity of real names. Accepted — per
  [ADR 6](0006-monetization-is-a-learning-goal.md) the audience is a dozen people reachable in
  person, and for them a local in-joke beats a famous name.
- Forces original character design, which is more work and a genuine (wanted) learning cost on
  the art side.
- **Shareable result cards inherit a constraint:** a share image must render the archetype's
  shipped name, never the user's custom one. Otherwise a private on-device name becomes
  published content — and if a kid names a keeper after a real local person, that is a named
  minor in a shared image, which is a plain privacy problem on top of the likeness one.
- Applies repo-wide, not just to games. A stats or coaching tool must not ship real player
  names, club crests, or league marks either.
- Revisit only if an app ever has a real licence, or if the target is a person who has
  consented in writing. "It's obviously fine, it's a hobby" is not a revisit trigger — that
  reasoning is exactly what this ADR exists to stop re-arguing.
