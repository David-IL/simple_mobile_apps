import type { Messages } from "./messages";

export const en: Messages = {
  languageName: "English",

  home: {
    titleLine1: "Penalty",
    titleLine2: "Chaos",
    solo: "Solo shootout",
    duel: "Two players, one phone",
    lastOpponent: "Last opponent",
    rematch: "Rematch",
    footnote: "No ads. No accounts. Works on a coach with no signal.",
    language: "Language",
    sound: "Sound",
    on: "On",
    off: "Off",
  },

  setup: {
    modeSolo: "Solo shootout",
    modeDuel: "Two players",
    pickKeeper: "Pick your keeper",
    renameLabel: "Call him something else",
    clearName: "Reset to the original name",
    takers: "Takers",
    yourName: "Your name",
    start: "Take the penalties",
    back: "Back",
    playerOne: "Player 1",
    playerTwo: "Player 2",
    traits: {
      memory: "Memory",
      telegraph: "Gives it away",
      reach: "Reach",
      talk: "Talks",
    },
    neverFaced: "Never faced",
    savePercent: (percent) => `Saves ${percent}%`,
    record: (scored, faced) => `You have scored ${scored} of ${faced}`,
  },

  match: {
    toTake: (name) => `${name} to take it`,
    hintNormal: "Drag up from the ball and release to shoot.",
    tapToContinue: "Tap to continue",
    giveUp: "Give up",
    giveUpHint: "Hold to abandon the shootout",
    outOf: (total) => `of ${total}`,
    suddenDeath: "SUDDEN DEATH",
    calmName: "Still night",
    calmBrief: "Nothing in your way. No excuses.",
    soloTaker: "You",
    readSaved: (times) => `He'd seen you go there ${times} times.`,
    readBeaten: "He guessed you'd repeat yourself.",
  },

  form: {
    label: "Form",
    recent: (scored, of) => `${scored} of your last ${of}`,
  },

  verdict: { goal: "GOAL", saved: "SAVED", missed: "MISSED", blocked: "BLOCKED" },
  outcome: { goal: "Scored", saved: "Saved", missed: "Missed", blocked: "Blocked" },

  result: {
    fullTime: "Full time",
    versus: (keeper) => `versus ${keeper}`,
    again: "Again",
    differentKeeper: "Different keeper",
    allSquare: "All square.",
    wins: (name) => `${name} wins it.`,
    soloVerdict: (scored, total) => {
      if (scored === total) return "Perfect. Every one.";
      if (scored === 0) return "Not one. Not a single one.";
      if (scored >= total - 1) return "Nearly flawless.";
      if (scored >= 2) return "Respectable enough.";
      return "Room for improvement, let's say.";
    },
  },

  sides: { left: "on the left", centre: "in the middle", right: "on the right" },

  banner: {
    windDirection: (direction) => (direction === "left" ? "Blowing left." : "Blowing right."),
    invaderAt: (side) => `He's ${side}.`,
  },

  keepers: {
    sunday: {
      name: "The Sunday Keeper",
      blurb: "Turned up in jeans. Dives early, dives wrong.",
      taunts: [
        "Ref, is it half time?",
        "I've got a five-a-side at four.",
        "Don't kick it hard, yeah?",
      ],
    },
    statue: {
      name: "The Statue",
      blurb: "Does not move. Does not need to. Aim away from the middle.",
      taunts: ["...", "I am not going anywhere.", "Try the corner. Go on."],
    },
    chatterbox: {
      name: "The Chatterbox",
      blurb: "Never stops talking. Occasionally remembers to save one.",
      taunts: [
        "Nice boots. Did they come with the shot?",
        "Left. You're going left. You've got a left face.",
        "My nan takes these better.",
        "I'll tell you where you're going: nowhere.",
      ],
    },
    "line-dancer": {
      name: "The Line-Dancer",
      blurb: "Jigs about so much you cannot read him. Cannot reach much either.",
      taunts: ["Watch the feet!", "Left, right, left, right, whoops.", "This is my warm-up."],
    },
    showboat: {
      name: "The Showboat",
      blurb: "Points at the corner he's going to save. Lies about half the time.",
      taunts: [
        "That one. I'm saving that one.",
        "Cameras on me, mate.",
        "I'll even tell you where I'm going. Probably.",
      ],
    },
    veteran: {
      name: "The Veteran",
      blurb: "Seen a thousand of these. Reads you a bit, shows you a bit.",
      taunts: ["I've saved this one before.", "You've got one shot in you, son.", "Take your time."],
    },
    wall: {
      name: "The Wall",
      blurb: "Enormous. Gets a hand to things he has no business reaching.",
      taunts: ["Good luck.", "There is no gap.", "You'll need the postage stamp."],
    },
    "mind-reader": {
      name: "The Mind-Reader",
      blurb: "Remembers every shot you've taken. Gives away nothing. Mix it up.",
      taunts: ["I know.", "You've been there twice already.", "Go on then. Same corner."],
    },
  },

  disruptions: {
    crosswind: {
      name: "Crosswind",
      brief: "The flag is horizontal. The ball will drift — aim into it.",
    },
    "pitch-invader": {
      name: "Pitch invader!",
      brief: "Hit him and you lose the shot.",
    },
    "low-sun": {
      name: "Low sun",
      brief: "Blinding. You lose the aim line the moment you start to drag.",
    },
    "muddy-spot": {
      name: "Muddy penalty spot",
      brief: "No run-up worth having. You cannot get full power on it — place it.",
    },
    "away-end": {
      name: "The away end starts singing",
      brief: "He's playing to the crowd — commits early and showily, but he's stretching.",
    },
  },

  headlines: {
    missOver: () => "Over the bar. Row Z.",
    missGround: () => "Into the ground. Somehow.",
    missWideLeft: () => "Wide of the left post.",
    missWideRight: () => "Wide of the right post.",
    blocked: ({ side }) => `Straight at the bloke standing ${side}.`,
    saveGuessed: ({ keeper }) => `${keeper} guessed it.`,
    saveFingertips: ({ keeper }) => `Fingertips. ${keeper} got across.`,
    goalCentreLow: () => "Cheeky. Right down the middle.",
    goalCentreHigh: () => "Straight down the middle, roof of the net.",
    goalCornerLow: () => "Low and hard into the corner.",
    goalCornerHigh: () => "Top corner. Unstoppable.",
  },
};
