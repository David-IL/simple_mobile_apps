# Google Play release tracks, and what production actually requires

Researched 2026-08-25, with sources. **Re-check before relying on it** — Play policy
moves, and this area moved as recently as November 2023.

Confidence markers: **(A)** verified in an official source · **(B)** widely reported,
unofficial · **(C)** could not confirm.

---

## The headline: internal testing does not get you to production

This is the thing that is genuinely confusing, and it is worth stating before anything
else.

**(A)** A personal Play Console account created after **13 November 2023** must run a
**closed test** before it may apply to publish to production. The bar:

> *"At least 12 testers must be opted in to your closed test when you apply for production
> access, and they must have been opted in continuously for the preceding 14 days."*

**Internal testing does not count.** It is not a smaller version of closed testing; it is
a different track that does not satisfy the requirement at all. You can run internal tests
for a year and be no closer to production than on day one.

That single fact reorganises the whole plan, so it goes first.

Source: [Testing requirements for personal developer
accounts](https://support.google.com/googleplay/android-developer/answer/14151465)

### Does it apply to this account?

**(A)** The rule is written against *personal* accounts created after 13 Nov 2023.
**(C)** Whether organisation accounts are exempt is **not stated** in the page above, and
could not be confirmed from an official source — it is implied by the wording and widely
reported **(B)**, but do not plan around it.

An organisation account requires a D-U-N-S number; a personal one requires ID
verification. If you verified your identity rather than registering a company, assume
personal, and assume the rule applies.

---

## The four tracks

| Track | Who can install | How they get in | Review | Counts toward production access? |
| --- | --- | --- | --- | --- |
| **Internal** | up to **100** testers **(A)** | email list you type in | may skip standard policy/security review **(A)** | **No** |
| **Closed** | up to 2,000 per list, 50 lists **(A)** | email list, Google Group, or org | standard review applies **(A)** | **Yes — this is the one** |
| **Open** | unlimited; findable on Play **(A)** | anyone, via opt-in link or Play search | standard review; listing is publicly visible **(A)** | Not required |
| **Production** | everyone | Play Store | full review | — |

### What each is actually *for*

**Internal — the fast loop.** Minutes to go live, no waiting on review, 100 people by
email address. This is the right track for putting builds on your son's phone today and
iterating. Use it heavily. Just do not mistake activity here for progress toward launch.

**Closed — the gate.** The only track that satisfies the 12/14 requirement, and it is
reviewed like a real release. This is where the app has to be genuinely finished, because
you cannot quietly patch around a reviewer.

**Open — optional.** Publicly listed and installable by anyone. Not required to reach
production, and for an app with a deliberately small in-person audience it mostly buys
exposure you did not ask for. Skippable.

**Production — the store.** Requires an approved production-access application, which
requires the closed test above.

Source: [Set up an open, closed, or internal
test](https://support.google.com/googleplay/android-developer/answer/9845334)

---

## The path, as a sequence

```
1. Internal testing            minutes      iterate freely, any number of builds
2. Closed testing              ≥ 14 days    ≥ 12 testers, opted in CONTINUOUSLY
3. Apply for production        ≤ ~7 days    Dashboard → "Apply for production"
4. Production release          full review
```

**(A)** The application is three sections — *About your closed test*, *About your
app/game*, *About your production readiness* — and *"review usually takes seven days or
less, but can occasionally take longer."*

**So the floor is roughly three weeks** from the first closed-test opt-in to a production
release, and that assumes twelve people opt in on day one and none of them drop out.

### The continuity trap

**(A)** The 14 days must be *consecutive*, per tester:

> *"Testers who opt in, test for fewer than 14 days, and then opt out do not count toward
> the requirement. If a tester opts out and opts back in later, the 14 days must be
> consecutive to count toward the minimum requirement."*

Consequences worth planning around:

- A tester who uninstalls resets their own clock. Uninstalling the *app* is not the same
  as opting out of the *test*, but people do both, and neither is visible to you as an
  event you get warned about.
- Recruit **more than twelve**. Twelve is the floor, not the target — one person tidying
  up their phone in week two puts you under the line and you find out at rejection.
- **(A)** Rejection reasons include *"having fewer than 12 opted-in testers or insufficient
  tester engagement"*, so bodies alone are not obviously enough; people should actually
  open it.

---

## What this means for this repo

The requirement looks like bureaucracy and is, but it happens to force the exact activity
[CLAUDE.md](../../CLAUDE.md) already names as the binding constraint:

> *Distribution is the binding constraint, not code: the realistic audience is the one
> reachable in person — the team, the club, other coaches and parents.*

Twelve testers for a football game, from a football team, is not a stretch — it is one
training session and a message to the parents' group. The rule turns "I should really find
some players" from a good intention into a gate with a date on it.

Concretely, for Straffe Kaos:

1. **Now:** internal testing, one tester, iterate. Nothing blocks this.
2. **When the app is genuinely finished:** promote to closed testing and open recruitment.
   Reviewed like production, so ship it as if it were.
3. **Recruit ~18–20** to survive attrition down to twelve. The team, their parents, the
   other coaches.
4. **Start the clock and leave it alone for 14 days.** Collect feedback, ship internal
   builds alongside if you want to keep iterating.
5. **Apply**, then allow another week.

Plan the closed test to *start* about three weeks before any date you have in mind. There
is no way to buy that time back later.

---

## Traps

- **Internal testing feels like progress and is not.** Restated because it is the entire
  reason this document exists.
- **Closed testing is reviewed.** The first closed build meets a human. Treat it as a
  release, not a rehearsal.
- **Twelve is a floor with no margin.** Recruit more.
- **The 14 days are per-tester and consecutive**, not "14 days since the test opened".
- **You cannot shortcut with your own accounts.** **(C)** The policy text does not spell
  out a prohibition on self-created tester accounts, but engagement is assessed and
  account-farming is exactly what the requirement exists to defeat. Do not build a plan on
  it.
- **Nothing here is affected by which build tool you use.** EAS submits to whichever track
  `eas.json` names (`internal` today); the tracks and their rules are Google's.

---

## See also

- [Families policy + ads](families-policy-and-ads.md) — the other Play policy area that
  bites this repo, and the reason the privacy policy is mandatory.
- [apps/penalty-chaos/store/deploying.md](../../apps/penalty-chaos/store/deploying.md) —
  the app-specific, click-by-click version of getting onto Play.
