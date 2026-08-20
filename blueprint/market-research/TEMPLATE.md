# {{TITLE}}

- **Slug:** `{{SLUG}}`
- **Status:** draft <!-- draft | proceed | shelved -->
- **Date:**

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

## 1. Problem and user

- What problem does this solve, in one sentence?
- Who has it? Be specific — "people who X" beats "everyone".
- How often do they have it? (daily / weekly / rarely)
- Would *you* use it daily? If no, say why you're building it anyway.

## 2. Existing alternatives

List 3–5 apps that already do this. For each: name, rough install count, price model, and
what people complain about in reviews.

| App | Installs | Price | Common complaint |
| --- | --- | --- | --- |
|     |          |       |                  |

- What is genuinely different about yours? ("simpler" and "no ads" are legitimate answers,
  but say *simpler than what, specifically*.)
- If the honest answer is "nothing different" — that is fine for a learning project.
  Write that down so you don't later confuse it with a product.

## 3. Riskiest assumption

The single thing that, if false, makes this pointless. How could you check it cheaply
(before writing code)?

## 4. Offline-only or cloud backend?

Answer each. **Any "yes" leans backend.**

- [ ] Does data need to sync across a user's devices?
- [ ] Do multiple users need to see each other's data?
- [ ] Are accounts / login required?
- [ ] Is there logic that can't run on-device (heavy compute, secrets, third-party API keys)?
- [ ] Does content need to be updated by you without shipping an app release?

**Decision:** offline-only / backend
**If backend — what kind?** (managed BaaS like Supabase/Firebase vs. own API) and why.

> Note: offline-only is dramatically cheaper to build, ship, and maintain, and has no
> running cost or privacy-policy burden. Prefer it unless a box above is genuinely ticked.

## 5. MVP scope

- **Must have** (without these it's not the app):
- **Nice to have** (v2):
- **Explicit non-goals** (things you are deliberately not building):

## 6. Success metric

Per [ADR 6](../../docs/adr/0006-monetization-is-a-learning-goal.md), success here is: it
shipped, it works, someone actually used it, and something new was learned. **Not installs,
not revenue.**

- What would make you call this a success? (e.g. "my son plays it unprompted a week later",
  "the team uses it at training", "I learn EAS deployment end-to-end")
- **Who specifically will use it?** Distribution is the binding constraint, not code. Name
  real people you can reach — the team, the club, other coaches and parents. "People who
  find it on the Play Store" is not an answer.

## 6b. Does it fit React Native?

Per [ADR 7](../../docs/adr/0007-game-rendering-approach.md), games stay in RN and mechanics
get scoped to fit. Apply this **here**, not mid-build.

- Core mechanic in one sentence:
- Is it RN-shaped? (one-tap timing, reaction/precision taps, drag-and-release aiming, card
  and grid interactions, tween-driven motion → yes)
- Does it need a physics engine, dozens of independently moving bodies, per-frame collision,
  or particles? **If yes, change the idea, not the stack.**
- Tooling needed: layout/`Animated` only / `react-native-reanimated` / `@shopify/react-native-skia`
- Will it hold up on a low-end Android device? (needs real-device testing, not the dev machine)

## 7. Play Store feasibility

- Any policy risk? (user-generated content, health/finance claims, data collection, permissions)
- Does it need a privacy policy? (yes if it collects *any* personal data — and always if it has ads)
- Monetization: none / paid / IAP / ads
- Target Android API level and minimum supported version

### 7b. Kids and ads — only if this app actually plans to carry ads

Per [ADR 6](../../docs/adr/0006-monetization-is-a-learning-goal.md), ads exist here as a
**compliance and integration exercise**, not a revenue plan. "It could earn ad money" is not
a reason to build something — if that's the main argument for an idea, shelve it.

Default answer for a first app: **no ads**. Skip to §8. Adding them later is a deliberate
learning exercise, not a default.

If this app *is* the one where you learn ad integration, see
[docs/reference/families-policy-and-ads.md](../../docs/reference/families-policy-and-ads.md)
for the verified rules and sources, and answer:

- **Declared target audience:** 13+ only / mixed audience / children included
- If child-inclusive: is the art and store listing *genuinely* non-child-directed? (Google
  reviews this itself and can override your declaration)
- If mixed audience: neutral age screen needed — who sees ads?
- **Rewarded video:** Families policy names rewarded/opt-in ads that aren't closeable after
  5s as prohibited. Which route — 13+, age screen, or a non-rewarded format?
- Ads mean a **development build**, not Expo Go, plus a privacy policy and a Data safety
  declaration covering AdMob. Accepted as part of the exercise?

## 8. Time-box

How many evenings before you stop and reassess?

## 9. Decision

- **Decision:** proceed / shelve / needs more research
- **Reasoning:**
