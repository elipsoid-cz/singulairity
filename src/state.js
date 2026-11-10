// The single mutable game state object.
export const SAVE_VERSION = 1;

export function createState() {
  return {
    version: SAVE_VERSION,
    ideas: 0,
    progress: 0,
    population: 10,
    energy: 0,
    hardware: 0,
    owned: {},
    era: 1,
    gameTime: 0,
    eraTime: [0, 0, 0, 0, 0, 0, 0, 0],
    eraStartProgress: [0, 0, 0, 0, 0, 0, 0, 0],
    capability: 0,
    alignment: 0,
    alignmentShare: 0.3,
    aiTime: 0,        // game seconds spent in the AI era
    aiShareSum: 0,    // ∫ alignmentShare dt over the AI era
    rival: { progress: 0, active: false },
    agiPaths: { emulation: 0, evolution: 0 },
    agi: false,
    singularity: false,
    winner: null,
    ending: null,
    decisions: {},
    pendingDecision: null,
    buffs: [],
    activeEvent: null,
    stats: { clicks: 0 },
    log: [],
    tickerSeen: [],
    tickerQueue: [],  // fresh discoveries waiting to be announced in the ticker   // keys of history/flavour lines already shown this game
    tickerLiveAt: {}, // live line key → game time it was last shown
  };
}
