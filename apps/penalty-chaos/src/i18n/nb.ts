import type { Messages } from "./messages";

/**
 * Norwegian Bokmål. Written as banter, not as a line-by-line translation of the
 * English — the jokes are the product here, and a literal rendering of English
 * football slang is not funny in Norwegian. Where a phrase had no good Bokmål
 * equivalent it was replaced with one that lands, not padded out.
 */
export const nb: Messages = {
  languageName: "Norsk",

  home: {
    titleLine1: "Straffe",
    titleLine2: "Kaos",
    solo: "Alene mot keeper",
    duel: "To spillere, én telefon",
    footnote: "Ingen reklame. Ingen innlogging. Funker på bussen uten dekning.",
    language: "Språk",
    sound: "Lyd",
    on: "På",
    off: "Av",
  },

  setup: {
    modeSolo: "Alene mot keeper",
    modeDuel: "To spillere",
    pickKeeper: "Velg keeper",
    renameLabel: "Kall ham noe annet",
    renameNote: (shippedName) =>
      `Blir liggende på denne telefonen. Ingenting sendes noe sted, og resultatkortet bruker alltid ${shippedName}.`,
    clearName: "Tilbake til originalnavnet",
    takers: "Skyttere",
    start: "Ta straffene",
    back: "Tilbake",
    playerOne: "Spiller 1",
    playerTwo: "Spiller 2",
  },

  match: {
    toTake: (name) => `${name} skal ta den`,
    hintNormal: "Dra oppover fra ballen og slipp for å skyte.",
    tapToContinue: "Trykk for å fortsette",
    giveUp: "Gi opp",
    giveUpHint: "Hold inne for å avslutte omgangen",
    outOf: (total) => `av ${total}`,
    suddenDeath: "BRÅDØD",
    calmName: "Blikkstille",
    calmBrief: "Ingenting i veien. Ingen unnskyldninger.",
    soloTaker: "Du",
  },

  verdict: { goal: "MÅL", saved: "REDDET", missed: "BOM", blocked: "BLOKKERT" },
  outcome: { goal: "Scoret", saved: "Reddet", missed: "Bom", blocked: "Blokkert" },

  result: {
    fullTime: "Full tid",
    versus: (keeper) => `mot ${keeper}`,
    again: "En gang til",
    differentKeeper: "Bytt keeper",
    allSquare: "Helt likt.",
    wins: (name) => `${name} vinner.`,
    soloVerdict: (scored, total) => {
      if (scored === total) return "Perfekt. Alle sammen.";
      if (scored === 0) return "Ikke én. Ikke en eneste én.";
      if (scored >= total - 1) return "Nesten feilfritt.";
      if (scored >= 2) return "Helt greit, da.";
      return "Litt å jobbe med, skal vi si.";
    },
  },

  sides: { left: "til venstre", centre: "i midten", right: "til høyre" },

  banner: {
    windDirection: (direction) =>
      direction === "left" ? "Blåser mot venstre." : "Blåser mot høyre.",
    invaderAt: (side) => `Han står ${side}.`,
  },

  keepers: {
    sunday: {
      name: "Søndagskeeperen",
      blurb: "Møtte opp i olabukse. Kaster seg tidlig, og feil.",
      taunts: [
        "Dommer, er det pause snart?",
        "Jeg har femmerfotball klokka fire.",
        "Ikke skyt så hardt, da.",
      ],
    },
    statue: {
      name: "Statuen",
      blurb: "Beveger seg ikke. Trenger det ikke. Sikt utenom midten.",
      taunts: ["...", "Jeg går ingen steder.", "Prøv hjørnet, da. Kom igjen."],
    },
    chatterbox: {
      name: "Skravlebøtta",
      blurb: "Holder aldri kjeft. Husker av og til å redde en.",
      taunts: [
        "Fine sko. Fulgte det med et skudd?",
        "Venstre. Du går venstre. Du har et venstrefjes.",
        "Bestemora mi tar dem bedre.",
        "Jeg skal si deg hvor du går: ingen steder.",
      ],
    },
    "line-dancer": {
      name: "Linjedanseren",
      blurb: "Hopper så mye rundt at du ikke klarer å lese ham. Rekker ikke stort, heller.",
      taunts: ["Se på beina!", "Venstre, høyre, venstre, høyre, oi.", "Dette er bare oppvarming."],
    },
    showboat: {
      name: "Skrytepaven",
      blurb: "Peker på hjørnet han skal redde. Lyver omtrent halve tida.",
      taunts: [
        "Den der. Den redder jeg.",
        "Kameraene er på meg, altså.",
        "Jeg sier til og med hvor jeg går. Sannsynligvis.",
      ],
    },
    veteran: {
      name: "Veteranen",
      blurb: "Har sett tusen av dem. Leser deg litt, viser deg litt.",
      taunts: ["Denne har jeg reddet før.", "Du har ett skudd i deg, gutt.", "Ta deg god tid."],
    },
    wall: {
      name: "Muren",
      blurb: "Enorm. Får hånda på ting han umulig burde nå.",
      taunts: ["Lykke til.", "Det finnes ingen luke.", "Du må opp i krysset."],
    },
    "mind-reader": {
      name: "Tankeleseren",
      blurb: "Husker hvert eneste skudd du har tatt. Røper ingenting. Varier.",
      taunts: ["Jeg vet.", "Der har du vært to ganger allerede.", "Kom igjen, da. Samme hjørne."],
    },
  },

  disruptions: {
    crosswind: {
      name: "Sidevind",
      brief: "Flagget står rett ut. Ballen kommer til å dra — sikt mot vinden.",
    },
    "pitch-invader": {
      name: "Banestormer!",
      brief: "Treffer du ham, ryker skuddet.",
    },
    "low-sun": {
      name: "Lav sol",
      brief: "Blender helt. Du mister siktelinja idet du begynner å dra.",
    },
    "muddy-spot": {
      name: "Gjørmete straffemerke",
      brief: "Ikke noe tilløp å snakke om. Du får ikke full kraft — plasser den.",
    },
    "away-end": {
      name: "Bortefansen begynner å synge",
      brief: "Han spiller for publikum — går tidlig og med stil, men han strekker seg.",
    },
  },

  headlines: {
    missOver: () => "Over tverrliggeren. Rad Z.",
    missGround: () => "Rett i bakken. På et vis.",
    missWideLeft: () => "Utenfor venstre stolpe.",
    missWideRight: () => "Utenfor høyre stolpe.",
    blocked: ({ side }) => `Rett på fyren som står ${side}.`,
    saveGuessed: ({ keeper }) => `${keeper} gjettet riktig.`,
    saveFingertips: ({ keeper }) => `Fingertuppene. ${keeper} fikk en hånd på den.`,
    goalCentreLow: () => "Frekt. Rett i midten.",
    goalCentreHigh: () => "Rett i midten, opp i taket.",
    goalCornerLow: () => "Lavt og hardt i hjørnet.",
    goalCornerHigh: () => "Opp i krysset. Umulig.",
  },
};
