# 6. Ads are a learning goal, not a revenue plan

- **Status:** accepted
- **Date:** 2026-08-20

## Context

Part of the inspiration for this repo was the "hypercasual game factory" genre of article:
build 20 one-mechanic games, monetise with rewarded video, expect 2–3 hits and
$6,000–$10,000/month. The revenue arithmetic in those articles is usually internally
consistent — ARPDAU of ~$0.01 against 10,000 DAU really is ~$3,000/month — but it treats
DAU as a starting condition rather than something that has to be bought.

The missing line is user acquisition:

- Hypercasual retention is roughly D1 ~35%, D7 ~10%, D30 ~2%. Average player lifetime is a
  few days, so holding 10,000 DAU means acquiring on the order of 3,000+ installs *per day,
  indefinitely*.
- Organic installs for an unknown solo developer with no ASO history are effectively zero.
- Post-ATT hypercasual CPI runs roughly $0.30–$1.00+. At the low end, 3,000 installs/day is
  ~$900/day of spend against ~$100/day of revenue.

That is the actual shape of the business: hypercasual is user-acquisition arbitrage, not game
development. Publishers (Voodoo, Homa, Supersonic) exist because they operate the ad-buying
and creative-testing machine. "Build 20, 2–3 hit" is a portfolio strategy backed by a testing
budget of ~$500–2,000 per title just to read CPI and D1 — $10k–40k before any revenue.
Without that budget the outcome isn't a 15% hit rate, it's 20 games at 0 DAU. The genre also
consolidated after ATT in 2021 and largely moved to "hybridcasual" (hypercasual mechanic plus
meta progression and IAP), which is not a two-week build.

(Figures above are ranges, directionally reliable rather than current-quarter precise.)

## Decision

Ad revenue is not a goal of this repo. Where ads are implemented, they are implemented
**because integrating them is part of learning the mobile pipeline** — AdMob setup, Play
Console data-safety declarations, a consent flow, and the families-policy questions that come
with them.

No app in this repo is planned around ad revenue, and no research doc should justify building
something on a projected revenue figure. The [research template](../../blueprint/) asks
whether an idea is worth building; "it could earn ad money" is not a passing answer.

If an app ever does get real traction, revisit this ADR rather than quietly assuming it.

## Consequences

- Success criteria for an app are: it shipped, it works, someone actually used it, and
  something new was learned. Not installs or revenue.
- Distribution is the binding constraint, not code. The realistic audience for these apps is
  the one already reachable in person — a team, a club, other coaches and parents. An app with
  200 real users who give real feedback teaches more than one with 0 users and a monetisation
  layer.
- Ads, when added, get treated as a first-class compliance exercise. The likely test audience
  is children, which puts these apps near Play's Families policy and COPPA rules; that has to
  be handled properly rather than waved through.
- Avoids the failure mode of building 20 shallow games chasing a number, at the cost of
  building fewer, more interesting things.
