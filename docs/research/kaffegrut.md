# Kaffegrut

- **Slug:** `kaffegrut`
- **Status:** shelved <!-- draft | proceed | shelved -->
- **Date:** 2026-09-24

> Fill this in before running `pnpm blueprint:new`. The point is not to be rigorous —
> it is to spend 30 minutes finding the reason *not* to build it, before spending 30 hours.

**Idea as pitched:** the coffee industry grows, harvests, roasts, ships and grinds beans across
the world, pours hot water through them once, and throws the rest away. The spent grounds keep
most of the original mass, which feels like a waste. Can an app be part of the fix? Two ideas:
a *pant* (deposit-return) system where you hand in grounds for cash back, or a logistics system
for collecting grounds from coffee shops, baristas and restaurants. A follow-up question: could
a gardening product be a higher-value brand? For example, grounds mixed into garden soil and
sold at a premium. (At home the grounds already go into the garden.)

**This is not a mobile-app idea in the usual sense for this repo.** It is a physical-operations
business with, at most, a thin software layer. The template is filled in honestly anyway. Sections
that only apply to games (§6b, §7b) are marked N/A.

## 1. Problem and user

- **Problem, one sentence:** spent coffee grounds get thrown away even though they hold most of
  the bean's mass. *But see below: in Norway they mostly aren't thrown away, and most of the
  value has already been taken out.*
- **Who has it:** cafés, restaurants, office canteens and bean-to-cup machines (concentrated
  sources), and households (scattered sources, and the majority of Norwegian coffee drinking).
- **How often:** daily. A busy café produces roughly **10–12 kg of wet grounds a day**
  (300 cups × ~18 g ≈ 5 kg dry, about 60% water). That is about 3–4 t a year per café
  *(my estimate, not measured)*.
- **Would I use it daily?** A household pant app: no. It would just add a step to something the
  food-waste bin already does.

### Testing the premise

**Where the intuition is right.**
- Brewing dissolves only about 20% of the coffee's mass.
- About 650 kg of spent grounds come out per tonne of green coffee, roughly **6.7 Mt a year
  worldwide** ([Foods, 2025 review](https://pmc.ncbi.nlm.nih.gov/articles/PMC13298225/)).
- The dry matter is roughly 40–50% carbohydrate and fibre, 10–15% protein, a notable share of
  oil and some polyphenols.

**Where it doesn't hold up.**

- **"Keeps the nutritional content" is the wrong frame.** Nobody buys coffee for nutrition. The
  billions pay for the soluble flavour, aroma and caffeine, and that is exactly what ends up in
  the cup. What's left is mostly lignocellulose (plant fibre), which is abundant and cheap
  everywhere.
  - Brewers' spent grain is the useful comparison. There is far more of it, it has more protein,
    and it already has an old use as animal feed, yet companies upcycling it still struggle.
  - Coffee grounds are poor feed (caffeine, tannins).
- **Water is the enemy.** Grounds are about 60% water and go mouldy within a few days. Getting
  them below ~8% water to make them stable takes a lot of energy.
- **In Norway the grounds are not really "thrown away".** Landfilling biodegradable waste has
  been banned since 2009. Business and household food waste mostly goes to biogas and
  biofertiliser.
  - So the competitor is an existing stream that is already fairly green.
  - Diverting grounds from biogas only counts as a climate gain if the new use is clearly better.
  - Journalists and customers will eventually spot this, so the green story is weaker than it
    first looks.
- **Most coffee is brewed at home**, and those grounds are scattered and already go into the
  food-waste bin.
- **The bigger waste is upstream.** On the farm, cherry pulp and husk are produced in large
  volumes. Cascara and coffee flour are real upcycling markets, but not something to run from
  Norway.

**The core problem is a value–volume mismatch.**
- High-value uses need only small amounts: cosmetics, gourmet mushrooms, branded products.
- Uses that take large amounts pay almost nothing: fuel, compost, biogas.
- The middle (oil extraction, composites) needs industrial capital and more volume than Norway
  produces.
- A collection-logistics business sits exactly in that gap.

## 2. Existing alternatives

Not apps, but the businesses that have already run this experiment.

| Operator | What | Outcome |
| --- | --- | --- |
| [Gruten AS](https://www.gruten.no/), Oslo | Collected grounds from Oslo coffee bars by e-cargo bike. Grew oyster mushrooms for restaurants: ~1 t of grounds/month → ~150 kg of mushrooms. The leftover substrate went to farms as soil improver ([Godt.no](https://www.godt.no/aktuelt/i/QogrgJ/dyrker-gourmetsopp-paa-oslos-kaffegrut), [Norges Vel](https://www.norgesvel.no/aktuelt/dyrker-gourmetsopp-i-kaffegrut)) | **Stopped mushroom production in summer 2023.** Now mainly courses, lectures and workshops. Reason not confirmed. |
| bio-bean, UK | Collected grounds across London through waste partners and dried them into "Coffee Logs" (fuel) and ingredients | **Went into administration in March 2023** after a fire in its dryer, on top of cost inflation ([The Grocer](https://thegrocer.co.uk/restructures-and-receiverships/coffee-logs-supplier-bio-bean-collapses-following-on-site-fire/678767.article)). A composting company bought the assets in July 2023 ([Envar](https://www.envar.co.uk/envar-composting-ltd-acquires-bio-bean-ltd/)). |
| UpCircle Beauty, UK | Coffee body scrubs made from London cafés' grounds | Still trading, as far as I know. A brand business, not a logistics business. *(Scale not checked.)* |
| JavaEarth (US), Coffee NEXT (HK) | Soil amendments, compost and planting pots made from grounds ([Upcycled Coffee](https://upcycledcoffee.com/), [Eco-Greenergy](https://www.eco-greenergy.com/products/coffee-next-planting-pot)) | Exist. Scale and profitability **couldn't confirm**. |
| Starbucks "Grounds for Your Garden", Olio | Free giveaway of grounds, and a general free-item marketplace | The giveaway niche is already covered and free. |
| Municipal food-waste collection → biogas | Default route for business and household grounds in Norway | This is the real competitor. It's cheap, already paid for and already green. |

**What is genuinely different about ours:** for logistics, nothing, and Gruten ran almost
exactly this pitch in Oslo. For a brand, only the story and the local link, which is a
legitimate basis for a brand but not for a technology.

## 3. Riskiest assumption

### (a) The deposit (pant) app: that grounds are worth enough to pay people for them

- Bottle pant works because the consumer pays the deposit upfront. Nobody pays a deposit on
  grounds, so the cash back has to come out of the grounds' value, which is near zero.
- A household makes ~50–100 g of wet grounds a day, and that is already going to biogas through
  the food-waste bin.
- **Fatal.** At most a loyalty gimmick for a coffee brand.

### (b) Route collection: that someone will pay more than it costs to collect

Rough Oslo numbers. **Every figure is my assumption. Check them before relying on this.**

| Item | Assumption |
| --- | --- |
| Pickups per van-day, city traffic, carrying bins | ~40 stops × 10–12 kg ≈ 400–500 kg |
| Van, driver and fuel | ~5,000 NOK/day |
| **Collection cost** | **≈ 10–12 NOK/kg**, before drying or processing |
| Value of raw grounds as fuel or compost feedstock | ≈ 0–1 NOK/kg |

- The café has to pay, and its ceiling is what it pays today for food-waste pickup, which I
  don't know.
  - **Cheapest check:** ask two or three cafés for their monthly food-waste bill and kg, or get
    a Norsk Gjenvinning / Oslo kommune business price list.
  - If it's a few NOK/kg, a standalone round can't pay for itself.
- Three things improve it:
  1. **Back-haul on trips that already happen.** Roasters, wholesalers and dairy vans visit cafés
     weekly and drive back empty. "We take back what we deliver" is a genuine circular story
     for a roaster, and the collection costs almost nothing extra. The catch: grounds go mouldy
     in a few days, so it needs sealed containers or visits every two to three days.
  2. **Offices and canteens instead of small cafés.** Bean-to-cup machines in big buildings,
     hotels and airports produce concentrated grounds at one pickup point. They have ESG
     budgets and facility managers who sign contracts.
  3. **Sell the report, not the grounds.** Customers pay for "X t diverted, Y kg CO₂ saved" in
     their sustainability report. But the EU's 2025 simplification of CSRD cut back who has to
     report, so that pressure is weaker than it was.

### (c) The garden brand: that people will pay a premium for a story when the product works no better

See §3b. This is the assumption that decides whether the brand route works.

## 3b. The garden brand: grounds mixed into soil, sold as a premium product

### What the science says

Short version: **the practice at home is harmless, and the pitched product ("grounds mixed with
garden soil") would be worse than plain soil.**

- **Raw grounds mixed into soil reduce plant growth.**
  - Hardgrove & Livesley (2016) grew broccoli, leek, radish, viola and sunflower in three soil
    types with 0–25% grounds.
  - Adding the grounds directly **greatly reduced growth, even at the lowest rates**
    ([Urban Forestry & Urban Greening](https://www.sciencedirect.com/science/article/abs/pii/S1618866716300103),
    [Univ. of Melbourne](https://findanexpert.unimelb.edu.au/scholarlywork/1064416-applying-spent-coffee-grounds-directly-to-urban-agriculture-soils-greatly-reduces-plant-growth)).
  - The mechanisms are phytotoxic compounds (polyphenols, caffeine) and soil microbes locking up
    nitrogen while they break down the grounds.
  - The authors' conclusion is to stabilise the grounds, e.g. by composting, before they go into
    soil. A 2025 review of grounds as soil amendments
    ([Agronomy](https://www.mdpi.com/2073-4395/15/1/26)) says the same: treated or composted
    grounds work, raw grounds are risky.
- **"Good for acid-loving plants" is mostly a myth.**
  - Brewing washes the acids out. Spent grounds are close to neutral, around pH 6.2–6.8
    ([Garden Myths](https://www.gardenmyths.com/coffee-grounds-acidifies-soil/),
    [Joh. Johannson](https://johjohannsonkaffe.no/fornuftig-a-bruke-kaffegrut-i-hagen/)).
  - Any effect on soil pH is small and temporary.
- **Composted, they're genuinely useful.**
  - Grounds have a C:N ratio of about 20:1, so they count as a "green" (nitrogen-rich) compost
    input. They help keep compost piles hot. The usual advice is at most ~20% of the pile.
  - Oregon State Extension reports that composted grounds may help suppress root-rot fungi
    (*Fusarium*, *Pythium*)
    ([OSU](https://extension.oregonstate.edu/news/coffee-grounds-boost-soil-health-help-control-slugs)).
- **Slugs: the caffeine effect comes from brewed coffee, not grounds.**
  - The OSU slug result used a 1–2% caffeine drench made from brewed coffee
    ([OSU](https://news.oregonstate.edu/news/used-appropriately-coffee-grounds-improve-soil-and-kill-slugs)).
  - Spent grounds hold far less caffeine.
  - Marketing a pest-control claim would also make the product a plant-protection product,
    which needs its own approval. **Don't make that claim.**
- **So the home practice is fine.** Thin layers of a household's grounds in beds or the compost
  bin break down before they do harm. What doesn't scale is the *pitched product*: grounds mixed
  raw into soil at a percentage high enough to put on the label.

### What a garden product would actually have to be

Not "soil + grounds" but **compost made with grounds**, which is a fertiliser/soil product under
Norwegian rules:

- The new *gjødselvareforskrift* took effect **1 February 2025**. Organic-origin products must be
  **registered with Mattilsynet before being marketed**, with details of composition, origin and
  use. Mattilsynet can stop sales under misleading names or claims
  ([Mattilsynet guidance](https://www.mattilsynet.no/planter-og-dyrking/gjodsel-jord-og-dyrkingsmedier/veileder-til-gjodselvareforskriften),
  [Lovdata](https://lovdata.no/dokument/SFO/forskrift/2003-07-04-951/KAPITTEL_2-4)).
  - Hygiene treatment (heat-treating to kill pathogens), content declaration and labelling
    requirements **not checked in detail**. Read the guidance before spending anything.
- Composting itself takes months and space, plus the smell and neighbour questions.
- The finished compost is **not measurably better than any other good compost**. The premium
  has to come from the brand.

### The market it would sell into

- **Bagged garden soil is a commodity with strong incumbents:** Hasselfors, Tjerbo, Plantasjen's
  own brand, local suppliers like [Grønn Vekst](https://www.gronnvekst.no/kjope-jord). Many
  municipal waste companies sell compost cheaply.
  - Retail price level **not checked**. A 40–50 L bag is probably in the low hundreds of NOK at
    most *(unverified estimate; check [prisradar](https://prisradar.no/kategorier/jord-og-bark))*.
  - A premium on a 50 L bag of soil is hard to justify when the neighbouring shelf is cheap and
    the performance is the same.
- **Garden season in Norway is short** (April–June), so cash flow would be very seasonal.
- **Supply isn't the constraint.** One café's 3–4 t a year covers thousands of small bags.
  Demand is.

### Where a garden brand *could* work: small, indoor, sold in the café

The value–volume mismatch *helps* here, because the brand only needs small volumes:

1. **Houseplant top-dressing or potting mix in small bags (2–5 L), sold by the litre.**
   Houseplant buyers are urban, buy all year round, and already pay premium per-litre prices.
   Seasonality goes away.
2. **Worm compost (vermicompost) made with grounds.** Composting worms eat coffee grounds
   readily. Worm castings are a recognised premium soil input, and "made by worms from your
   café's grounds" is a better story than "soil with coffee in it". *(Price per litre in Norway
   not checked.)*
3. **Sell it in the café that supplied the grounds.** This is the strongest part of the idea:
   - The café becomes the retail channel, and the loop is visible to the customer ("the grounds
     from your latte, back as plant food").
   - The café gets a green story to show customers, so it has a reason to take part without
     payment.
   - Distribution, the thing that usually kills a small consumer product, is solved by the
     supplier.
4. **Gift and grow kits**, e.g. herbs or mushrooms plus a coffee-compost starter, for the
   Christmas market rather than the garden season.

**Honest assessment:** this is a craft brand business. It could pay for itself and give a small
margin. Scale depends on a few cafés or a chain (Kaffebrenneriet, Espresso House, a roaster)
wanting it as their own product. The app is irrelevant to it. The riskiest assumption is (c).
The cheap test is to **make 20 small bags of properly composted coffee compost and sell them
at the counter of one café. See whether anyone buys a second one.**

## 4. Offline-only or cloud backend?

Only relevant to the one software variant that fits this repo: a **giveaway map, "Too Good To Go
for kaffegrut"**. Cafés post "grounds available today" and gardeners, mushroom growers and soap
makers claim a pickup.

- [ ] Does data need to sync across a user's devices?
- [x] Do multiple users need to see each other's data? **Yes.** That's the whole point.
- [x] Are accounts / login required? **Yes**, at least for cafés.
- [ ] Is there logic that can't run on-device?
- [x] Does content need to be updated without shipping an app release? **Yes.** Listings are
  live data.

**Decision:** backend (managed BaaS, Supabase or Firebase) *if* the app is built. That is a new
constraint for this repo: running cost, auth, a privacy policy, and user-generated content (a
Play policy risk). **And nobody would pay for it.** The item is free and low-value, demand is
seasonal, and Starbucks and Olio already cover it.

The only software with a customer who would pay is a **B2B collection tool for a roaster's
take-back service**: pickup requests, bin fill levels, weights and an ESG report. That is not a
mobile hobby app. It only exists after a roaster has said yes.

## 5. MVP scope

Not building software now. The "MVP" is the set of conversations and tests in §8.

- **Must have (before any code):** a café's real food-waste cost; one roaster's answer on
  take-back; the 20-bag counter test.
- **Explicit non-goals:** household pant app, own collection fleet, industrial processing (oil
  extraction, pellets, composites), raw grounds mixed into soil.

## 6. Success metric

Per [ADR 6](../../docs/adr/0006-monetization-is-a-learning-goal.md), success in this repo is
shipped, used and learned. That doesn't fit a business idea. Judged on its own terms:

- **Success:** strangers buy a second bag, or a roaster says "we'd pay for that".
- **Who specifically:** local cafés, a roaster, the garden-centre crowd. None of them has been
  asked yet. That's the gap.

## 6b. Does it fit React Native?

N/A. Not a game. A giveaway map or pickup-scheduling app would fit RN fine, but that isn't the
question here.

## 7. Play Store feasibility

- Only applies to the giveaway map. Risks: user-generated content (moderation), location data,
  and accounts. It needs a privacy policy and a Data safety declaration.
- Monetization: none plausible.

### 7b. Kids and ads

N/A.

## 8. Time-box

Three evenings, and no code:

1. Contact [Gruten](https://www.gruten.no/) and ask what actually ended the mushroom production.
   They've already run the Oslo experiment.
2. Ask two or three cafés what they pay for food-waste pickup and how many kg of grounds they
   produce.
3. Ask one roaster whether they'd pay for a take-back service or stock a coffee-compost product.

Then decide whether to test the 20 bags in one café.

## 9. Decision

- **Decision:** **shelve** as an app. **Needs more research** as a business, and only on the
  brand route: small-format coffee compost or worm compost sold in the café that supplied the
  grounds, possibly under a roaster's take-back programme.
- **Reasoning:**
  - The app variants fail on economics: grounds are worth too little to fund a deposit, and
    collection costs more than the grounds are worth.
  - In Norway, the environmental case against the biogas baseline is thinner than it looks.
  - Gruten and bio-bean both ran versions of this pitch and both stopped in 2023, one of them in
    Oslo.
  - Raw grounds mixed into soil are agronomically worse than plain soil, so the pitched garden
    product doesn't work as described. The composted version does work, but it's a registered
    fertiliser product whose only advantage is the story.
  - The one version with a plausible margin keeps volume small, sells where the grounds came
    from, and treats the story as the product. That is a brand business, not software. Worth a
    few conversations, not an app.
