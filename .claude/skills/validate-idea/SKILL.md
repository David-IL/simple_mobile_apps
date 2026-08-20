---
name: validate-idea
description: Research and pressure-test a mobile app idea, filling in a market-research doc under docs/research/. Use when evaluating whether an app idea is worth building, checking the competitive space, or deciding offline-only vs cloud backend.
argument-hint: [the app idea, in your own words]
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - WebSearch
  - WebFetch
  - Agent
  - AskUserQuestion
  - Bash(pnpm blueprint:research *)
---

# Validate an app idea

Idea to evaluate: **$ARGUMENTS**

Research docs that already exist:

!`ls docs/research`

## What this is for

Stage 2 of [WORKFLOW.md](../../../WORKFLOW.md). This is a **gate, not a formality** — it
exists to spend 30 minutes finding the reason *not* to build something, before spending 30
hours. `shelved` is a successful outcome, not a failure.

Your job is to be the skeptic. Do not cheerlead. If the idea is weak, say so plainly and
recommend `shelved` — David explicitly wants pushback, and a research doc that concludes
"proceed" every time is worthless as a filter.

## Steps

### 1. Settle the slug

Derive a kebab-case slug from the idea (e.g. "a habit tracker with no signup" →
`habit-tracker`). If a doc for that slug already exists in the list above, stop and ask
whether to revise it instead of starting over.

### 2. Create the doc

Reuse the existing generator — do not hand-write the file or restate the template:

```
pnpm blueprint:research <slug> "<one-line description of the idea>"
```

Then `Read` both the created `docs/research/<slug>.md` and
[`blueprint/market-research/TEMPLATE.md`](../../../blueprint/market-research/TEMPLATE.md)
so you're filling in the real current sections rather than assumed ones.

### 3. Research

Fan out — launch these as **parallel** `Agent` calls in one message, since they're independent:

- **Competitor scan.** Find 3–5 existing apps that solve this. For each: name, rough install
  count, price model, and what reviewers actually complain about. Google Play listings are
  the primary source; app-comparison sites and Reddit threads are useful for complaints.
- **Demand signal.** Is anyone asking for this? Search Reddit, forums, and Stack Exchange for
  people describing the problem in their own words. Quote them where you find them — real
  phrasing is far more useful than a summarized "users want X."

Then synthesize the results yourself. Do not paste raw agent output into the doc.

### 4. Fill in the doc — sourcing rules

These matter more than completeness:

- **Cite what you verified.** Link the Play Store listing, the thread, the review.
- **Mark what you couldn't.** Write `(unverified estimate)` or `(couldn't confirm)` inline.
  Install counts in particular are often unavailable — say so rather than guessing.
- **Leave gaps as gaps.** A blank with a note on how David could check it by hand beats a
  plausible invention. Never fabricate an install count, a review quote, or a competitor.
- Keep his voice: short, concrete, no marketing language.

### 5. Apply the two standing constraints (§6, §6b, §7b)

**Success is not installs or revenue** ([ADR 6](../../../docs/adr/0006-monetization-is-a-learning-goal.md)).
It's: it shipped, it works, someone actually used it, something was learned. So:

- **"It could earn ad money" is not a passing answer.** If that's the strongest argument for
  an idea, recommend `shelve`.
- **Push hard on §6's "who specifically will use it."** Distribution is the binding
  constraint. Name real reachable people — his son, the team, the club, other coaches and
  parents. "People who find it on the Play Store" means nobody. An idea with 200 real users
  who give feedback beats one with a bigger imagined market.
- Assume **no ads** unless this is explicitly the app where he wants to learn ad integration.
  Only then work §7b, using
  [docs/reference/families-policy-and-ads.md](../../../docs/reference/families-policy-and-ads.md).

**Games stay in React Native** ([ADR 7](../../../docs/adr/0007-game-rendering-approach.md)).
Work §6b properly — ADR 7 says explicitly that this call belongs at the research stage rather
than being discovered mid-build. If the mechanic needs a physics engine, dozens of moving
bodies, per-frame collision, or particles, say so plainly and propose a re-scoped version
that fits RN. **Changing the idea is the expected outcome there, not changing the stack.**

### 6. Work the offline-vs-backend checklist deliberately

§4 of the template is the decision that most shapes the code. Answer each box from the
*actual* MVP scope, not the someday-version — "users might want sync eventually" is not a
ticked box. Offline-only means no running cost, no auth, no privacy policy, and no server
to maintain; recommend it unless a box is genuinely ticked. State the reasoning, not just
the verdict.

### 7. Give a verdict, then hand it back

Fill in §9 with `proceed`, `shelve`, or `needs more research` **and your reasoning**. Then
summarize for David in chat: the strongest reason to build it, the strongest reason not to,
the riskiest assumption, and your recommendation.

Leave `Status:` at the top as `draft`. **He** flips it to `proceed` — the gate is his call,
not yours. Say so when you hand it back, and point out that `pnpm blueprint:new <slug>` is
the next step once he does.

## Don't

- Don't scaffold the app. That's a separate, deliberate step after the gate.
- Don't restate the template's content in this file or in chat — read it and fill it.
- Don't soften a weak verdict to be agreeable. Recommending `shelve` on a bad idea is the
  single most valuable thing this skill does.
