// A simple player: clicks, buys the cheapest affordable upgrade, answers decisions by policy.
import { createState } from '../../src/state.js';
import { DECISIONS } from '../../src/content/decisions.js';
import { tick, clickIdea, visibleUpgrades, canBuy, buy, cost, choose, setAlignmentShare, claimEvent } from '../../src/engine.js';

export function runBot({ alignmentShare, clicksPerSec = 2, dt = 1, maxSeconds = 4 * 3600, decisionPolicy = 'first', seed = 42 } = {}) {
  let x = seed;
  const rng = () => ((x = (x * 16807) % 2147483647) / 2147483647);
  const s = createState();
  setAlignmentShare(s, alignmentShare);
  const purchases = [];
  while (!s.singularity && s.gameTime < maxSeconds) {
    if (s.pendingDecision) {
      const d = DECISIONS.find((q) => q.id === s.pendingDecision);
      choose(s, d.id, decisionPolicy === 'safe' ? 1 : 0);
    }
    for (let i = 0; i < clicksPerSec; i++) clickIdea(s);
    if (s.activeEvent) claimEvent(s);
    for (;;) {
      const options = visibleUpgrades(s).filter((u) => canBuy(s, u.id)).sort((a, b) => cost(s, a.id) - cost(s, b.id));
      if (!options.length) break;
      buy(s, options[0].id);
      purchases.push({ t: s.gameTime, id: options[0].id });
    }
    tick(s, dt, rng);
  }
  return { ending: s.ending, winner: s.winner, gameTime: s.gameTime, eraTime: s.eraTime, purchases, state: s };
}
