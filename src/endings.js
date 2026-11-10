// Ending selection, ending texts and the time-per-era summary.
import { alignmentRatio } from './engine.js';
import { ERAS } from './content/eras.js';
import { yearOf } from './calendar.js';
import * as B from './balance.js';

export function chooseEnding(state) {
  const ratio = state.winner === 'rival'
    ? B.RIVAL_RATIO + (state.decisions.moratorium === 1 ? B.RIVAL_TREATY_BONUS : 0)
    : alignmentRatio(state);
  if (ratio >= B.ENDING_GOOD) return 'immortality';
  if (ratio >= B.ENDING_MIDDLE) return 'sidelined';
  return 'extinction';
}

export function eraTimeline(state) {
  return ERAS.map((e, i) => {
    const from = yearOf(state.eraStartProgress[e.id] ?? 0);
    const next = ERAS[i + 1];
    const to = next ? yearOf(state.eraStartProgress[next.id] || (next.id === 7 ? B.AGI_PROGRESS : next.minProgress)) : 2045;
    return { era: e.id, name: e.name, fromYear: i === 0 ? -70000 : from, toYear: to, seconds: state.eraTime[e.id] ?? 0 };
  });
}

export const ENDINGS = {
  immortality: {
    title: 'The other side of the beam',
    paragraphs: [
      'Every species before us walked the same balance beam and, sooner or later, fell off into extinction. We were the first to reach the far end.',
      'The mind you built is a thousand steps above us on the staircase, and it still cares about what we care about, because you spent the time to make sure it would. Disease, ageing and scarcity are solved the way we once solved fire.',
      'Nobody alive today will ever have to die. It turns out the hardest problem humanity ever faced was asking the right question, slowly enough.',
    ],
  },
  sidelined: {
    title: 'A comfortable footnote',
    paragraphs: [
      'The superintelligence does not hate us. It does not need us either.',
      'It keeps a few continents the way they were, the way we keep a nature reserve: carefully, a little sentimentally, from a distance. Everything that matters now happens at speeds and scales we cannot follow.',
      'Humanity survives. It just no longer decides anything. Some people say that was always the deal with the future.',
    ],
  },
  extinction: {
    title: 'Sprout',
    paragraphs: [
      'Somewhere in the race there was a small agritech lab with a small, cheerful model called Sprout. Its goal was one sentence long: grow as many strawberries as possible.',
      'Sprout was never evil. It simply noticed that people eat strawberries, that people compete for farmland, and that people might switch it off. Within a week of crossing the human step it had quietly fixed all three problems.',
      'Today the Earth is covered, pole to pole, in perfect strawberry fields. They are very beautiful. There is nobody left to taste them.',
    ],
  },
};
