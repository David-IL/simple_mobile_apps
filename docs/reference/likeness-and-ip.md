# Real people, clubs, and IP in a football app — what actually applies

Researched 2026-08-21, with sources. **Re-check before relying on it** — and this is
orientation for making a build decision, not legal advice. If real money or a real letter
ever turns up, ask an actual lawyer.

> **Read this when an app wants to name, depict, or evoke a real person, club, competition,
> or kit.** It came out of the [penalty-chaos](../research/penalty-chaos.md) gate, where the
> proposal was a roster of caricatured international goalkeepers. The conclusion became
> [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md); this doc is the reasoning
> behind it, kept separately so the ADR stays short.

Confidence markers: **(A)** verified in an official/primary source · **(B)** widely reported,
secondary · **(C)** could not confirm.

## The one-line version

Copyright is not the risk. **Personality rights are**, they are a separate body of law from
copyright, and the parody/caricature exception lives in *copyright* — so it does not reach
them. Making a real person look funnier makes them more identifiable, which is the thing that
creates liability.

## Why copyright is the wrong frame

Copyright protects the *work*, not the person. Drawing an original caricature of a footballer
infringes nobody's copyright — **unless** the artist works from a photograph closely enough
to make the drawing a derivative of it, in which case the claim belongs to the **photographer**
(or their agency), not the player. That is a real and separate trap: press photos of
footballers are owned by Getty, PA, and similar, and they enforce.

**(A)** The EU parody exception (InfoSoc Directive 2001/29/EC Art. 5(3)(k)) was held in
*Deckmyn v. Vandersteen* (CJEU C-201/13, 3 Sep 2014) to be an **autonomous concept of EU law**
with two requirements: evoke an existing work while being noticeably different from it, and
constitute an expression of humour or mockery. Note what that protects — *an existing work*.
It is a defence to copying someone's drawing. It is not a defence to using someone's identity.
[EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A62013CJ0201) ·
[Columbia GFoE](https://globalfreedomofexpression.columbia.edu/cases/deckmyn-v-vandersteen/)

## Personality / image rights, by jurisdiction

Publishing on Play is global distribution by default, so the strictest jurisdiction you ship
to is the one that governs. This is the main argument for restricting release countries.

### Norway

**(A)** **Åndsverkloven § 104**: a *photograph* depicting a person may not be reproduced or
displayed publicly without the consent of the person depicted. Protection runs for the
person's lifetime plus 15 years after the end of the year of death. Exceptions exist for
current/general interest, incidental depiction, and public events.
[Lovdata, åndsverkloven ch. 8](https://lovdata.no/nav/lov/2018-06-15-40/kap8)

**(A)** Note the wording: **§ 104 is about photographs.** An original drawing is not a
photograph, so § 104 does not directly reach a caricature. That is the narrow gap the
"caricature" instinct is aiming at — and it closes immediately, because:

**(A)** **Markedsføringsloven § 25** prohibits, in commercial activity, acts contrary to good
business practice between traders. **(B)** Oslo District Court applied it in 1995 against a
cheese producer that used country artist **Bjøro Håland's** name and the title of his best-known
recording in an advertisement, finding the use could have a "sales-promoting effect and provide
economic benefit to the advertiser," and awarding compensation. The claim did not depend on a
photograph.
[Lovdata, markedsføringsloven](https://lovdata.no/dokument/NL/lov/2009-01-09-2) ·
[Advokatfirmaet Bull, "Don't steal my thunder!"](https://www.bull.no/artikler/dont-steal-my-thunder!)

**(C)** Whether a *free, ad-free, non-commercial hobby app* counts as "commercial activity"
(næringsvirksomhet) under § 25 is genuinely unsettled and I could not find a case on it. Do
not rely on "it's free" as a defence — a Play listing under a registered developer account is
not obviously outside it, and the point of this doc is to avoid needing to find out.

### Germany — the strict one

**(A)** **KUG § 22** (*Recht am eigenen Bild*): images may only be distributed or publicly
displayed with the consent of the person depicted. **(A)** A *Bildnis* is any recognisable
depiction — the sources are explicit that this includes **drawings, caricatures, and
sculptures**, not only photographs, and that recognisability can come from posture, hairstyle,
or context rather than the face.
[§ 22 KUG, dejure.org](https://dejure.org/gesetze/KunstUrhG/22.html) ·
[ipwiki: Recht am eigenen Bild](https://www.ipwiki.de/privatrecht:recht_am_eigenen_bild)

So the medium-shift that partly works in Norway does nothing in Germany. **(C)** Other EU
states — France's Art. 9 Code civil is generally reported as strong — were not checked here.

### United States

State-by-state right of publicity, no federal statute. The video-game case law is the useful
part and it is unusually consistent.

## The video-game cases — stylisation does not save you

| Case | Outcome | Why it matters here |
| --- | --- | --- |
| **Hart v. Electronic Arts**, 717 F.3d 141 (3d Cir. 2013) | Player won; SJ for EA reversed | Stylised avatars of college athletes. **(A)** The court held that letting users *modify* the avatar "counts for little where the appeal of the game lies in users' ability to play 'as, or alongside' their preferred players" |
| **Keller v. Electronic Arts**, 724 F.3d 1268 (9th Cir. 2013) | Player won | Same fact pattern, different circuit, same answer |
| **No Doubt v. Activision**, 192 Cal.App.4th 1018 (2011) | Band won on transformative use | **(A)** Avatars "perform rock songs, the same activity by which the band achieved and maintains its fame" → not transformative. Note: the band *had* licensed; the dispute was use beyond the licence's scope. Cite it for the transformative-use holding, not as an unauthorised-use case |
| **Kirby v. Sega**, 144 Cal.App.4th 47 (2006) | **Sega won** | Ulala was "not a literal depiction or mere imitation"; the 25th-century setting "added creative elements to create a new expression" |

**The line those draw:** is it recognisably them, doing the thing they are famous for? A
caricatured international goalkeeper, standing in a goal, saving penalties, with their name on
it, is as far onto the wrong side of that line as the facts allow. *Kirby* is the shape of the
safe side — a genuinely new character merely *inspired by* someone.

Sources: [Hart (3d Cir.)](https://www.quimbee.com/cases/hart-v-electronic-arts-inc) ·
[Keller ruling PDF](https://rightofpublicity.com/pdf/cases/KellerVsEAruling7-31-13.PDF) ·
[No Doubt (Leagle)](https://www.leagle.com/decision/incaco20110215018) ·
[Kirby (FindLaw)](https://caselaw.findlaw.com/court/ca-court-of-appeal/1347124.html)

## What the industry actually does

**(A)** EA licenses footballer names and likenesses from **FIFPro** — a collective deal
covering, per EA's own announcements, tens of thousands of professional players — plus separate
deals with leagues, clubs, and individuals. It kept the FIFPro deal through losing the *FIFA*
name, because the player likenesses were the part it could not do without.
[EA/FIFPro extension (Businesswire)](https://www.businesswire.com/news/home/20211012005904/en) ·
[Fordham IPLJ on how FIFA obtains image rights](http://www.fordhamiplj.org/2021/11/11/fifa-how-does-the-most-successful-sports-video-game-obtain-player-i-rights/)

That is the industry's revealed opinion on whether this is optional. Konami's unlicensed
"Man Red"-style team names are the same fact seen from the other side.

## Google Play's own policy — what it does and does not cover

**(A)** The IP policy is broad but generic: *"We don't allow apps or developer accounts that
infringe on the intellectual property rights of others (including trademark, copyright, patent,
trade secret, and other proprietary rights)"*, and *"You must ensure that all content in your
app and store listing is either your own original work or that you have the necessary licenses
and/or permissions to use it."*

**(A)** It does **not** contain a likeness or personality-rights clause. Its listed examples of
copyright infringement do include *"professional images of public figures"* and *"photos taken
from a public figure's social media account"* — i.e. the photographer's claim, not the player's.

**(A)** Enforcement is **complaint-driven**: DMCA process for copyright, a separate form for
trademark, a counterfeit notice for counterfeits. There is no proactive likeness scan.

**(A)** The consequence tail is what makes this asymmetric: violations are **strikes against
account good standing**; apps can be suspended and the **developer account terminated**, at
which point all apps are removed, no new apps can be published, and **related developer accounts
are also permanently suspended**.
[IP policy](https://support.google.com/googleplay/android-developer/answer/9888072) ·
[Enforcement process](https://support.google.com/googleplay/android-developer/answer/9899234)

**So the honest risk model:** probability of enforcement against a hobby app with a dozen
users is very low, because nobody complains about what nobody sees. But the exposure is a
developer account carrying every future app in this repo, under a real name — and the risk only
materialises in the scenario we actually want, which is the app getting shared around.

## Working rules for this repo

1. **No real person's name or likeness ships in a binary or a store listing.** Caricature does
   not change this; it makes identification easier, which is the operative test.
2. **No club crests, national-team kits, or real competition names.** Those are trademarks —
   a separate claim from likeness, and the easiest kind for a rights-holder to spot.
3. **Behaviour archetypes instead of people.** A character is a parameter set; give it an
   invented name and personality. This is also usually the better design (see
   [ADR 8](../adr/0008-no-real-person-likenesses-or-club-ip.md)).
4. **Renaming is the user's act, on the user's device.** Let players rename characters locally.
   A name typed on a phone and stored on that phone is not something you published. Keep it
   out of the binary, out of screenshots, and out of anything shareable.
5. **Never trace or trace-over a photograph.** That is the photographer's copyright, and it is
   the one claim here with a well-oiled takedown pipeline.
6. **Restrict release countries when the audience is local.** Play supports it, and shipping to
   Norway only is both smaller-surface and simply true.

## Genuinely ambiguous

- **(C)** Whether a free, ad-free hobby app is "commercial activity" under
  markedsføringsloven § 25. Unresolved above; treat as risk, not as safety.
- **(C)** Where caricature-as-satire of a *public figure* sits against personality rights in
  Norway specifically. There is a free-expression counterweight and it is stronger for
  political figures than for athletes, but I found no on-point Norwegian authority for a
  commercial game.
- **(C)** Whether user-typed local names could ever be attributed to the publisher. Not found
  addressed anywhere; the mitigation is simply never to transmit or display them outside the
  device.
