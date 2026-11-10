// Side panels. Each appears silently when its era arrives.
import { h, setText, setBar, bar } from './dom.js';
import { rates, agiReadiness, alignmentRatio, clickValue } from '../engine.js';
import { STAIRCASE, staircaseLevel } from '../content/staircase.js';
import { formatNumber } from '../format.js';
import { P_SINGULARITY } from '../balance.js';

function row(label, valueEl) {
  return h('div', { class: 'row' }, h('span', {}, label), valueEl);
}

function logFraction(v, max) {
  return v > 1 ? Math.log10(v) / Math.log10(max) : 0;
}

const PANELS = [
  {
    id: 'people', minEra: 1, intro: null,
    build() {
      const pop = h('b'); const growth = h('b'); const click = h('b');
      return {
        node: h('div', { class: 'panel' }, h('h3', {}, 'Humanity'),
          row('Population', pop), row('Your idea', click), row('Growth', growth),
          h('p', { class: 'note' }, 'Growth: how much progress compounds every second. It is the number that matters.')),
        update(s, r) {
          setText(pop, `${formatNumber(s.population)} / ${formatNumber(r.popCapacity)}`);
          setText(click, `+${formatNumber(clickValue(s))}`);
          setText(growth, `${(r.growthRate * 100).toFixed(2)}% / s`);
        },
      };
    },
  },
  {
    id: 'energy', minEra: 4, intro: 'Machines start to work for us.',
    build() {
      const energy = h('b'); const perSec = h('b');
      return {
        node: h('div', { class: 'panel' }, h('h3', {}, 'Energy'), row('Stored', energy), row('Per second', perSec),
          h('p', { class: 'note' }, 'Every tenfold more energy speeds up growth.')),
        update(s, r) { setText(energy, formatNumber(s.energy)); setText(perSec, formatNumber(r.energyPerSec)); },
      };
    },
  },
  {
    id: 'compute', minEra: 5, intro: 'Thinking machines. They get twice as fast every two years, all by themselves.',
    build() {
      const cps = h('b'); const brain = bar();
      return {
        node: h('div', { class: 'panel' }, h('h3', {}, 'Compute'), row('Calculations / s', cps),
          h('div', { class: 'note' }, 'Toward one human brain (10 quadrillion cps)'), brain),
        update(s, r) { setText(cps, formatNumber(r.computeCps)); setBar(brain, logFraction(r.computeCps, 1e16)); },
      };
    },
  },
  {
    id: 'agi', minEra: 6, intro: 'Narrow AIs everywhere. Each one is another brick on the road to general intelligence.',
    build() {
      const compute = bar(); const emulation = bar(); const evolution = bar(); const status = h('p', { class: 'note' });
      return {
        node: h('div', { class: 'panel' }, h('h3', {}, 'Road to AGI'),
          h('div', {}, 'Hardware: human-brain compute'), compute,
          h('div', {}, 'Software: emulate a brain'), emulation,
          h('div', {}, 'Software: evolve a mind'), evolution, status),
        update(s) {
          const ready = agiReadiness(s);
          setBar(compute, ready.compute); setBar(emulation, s.agiPaths.emulation); setBar(evolution, s.agiPaths.evolution);
          setText(status, s.agi ? 'AGI achieved. It is already improving itself.' : 'AGI needs the hardware and one software path.');
        },
      };
    },
  },
  {
    id: 'beam', minEra: 6, intro: 'A rival lab is racing you to the top. Safety research slows you down.',
    build() {
      const shareLabel = h('b'); const ratio = h('b');
      const input = h('input', { class: 'share', type: 'range', min: 0, max: 100, step: 1, 'aria-label': 'Share of effort spent on alignment' });
      const you = bar(); const rival = bar('rival'); const safety = bar('safe');
      let handler = () => {};
      input.addEventListener('input', () => handler(Number(input.value) / 100));
      return {
        node: h('div', { class: 'panel' }, h('h3', {}, 'Safety vs. speed'),
          row('Effort on alignment', shareLabel), input,
          row('Safety record', ratio), safety,
          h('div', {}, 'You'), you, h('div', {}, 'Rival lab'), rival),
        bind(onShare) { handler = onShare; },
        update(s) {
          if (document.activeElement !== input) input.value = Math.round(s.alignmentShare * 100);
          setText(shareLabel, `${Math.round(s.alignmentShare * 100)}%`);
          const a = alignmentRatio(s);
          setText(ratio, a.toFixed(2));
          setBar(safety, a);
          setBar(you, logFraction(s.progress, P_SINGULARITY));
          setBar(rival, logFraction(s.rival.progress, P_SINGULARITY));
        },
      };
    },
  },
  {
    id: 'stairs', minEra: 7, intro: 'AGI. It is one step above us now. The steps are getting shorter.',
    build() {
      const items = STAIRCASE.map((st) => h('li', {}, st.name));
      return {
        node: h('div', { class: 'panel' }, h('h3', {}, 'The staircase'), h('ol', { class: 'stair' }, items)),
        update(s) {
          const lvl = Math.floor(staircaseLevel(s));
          items.forEach((li, i) => { li.classList.toggle('done', i < lvl); li.classList.toggle('here', i === lvl); });
        },
      };
    },
  },
];

export function mountPanels(el, { onShare, onReveal }) {
  const mounted = new Map();
  return {
    update(state) {
      const r = rates(state);
      for (const p of PANELS) {
        if (state.era >= p.minEra && !mounted.has(p.id)) {
          const inst = p.build();
          inst.bind?.(onShare);
          el.append(inst.node);
          mounted.set(p.id, inst);
          if (p.intro) onReveal(p.intro);
        }
        mounted.get(p.id)?.update(state, r);
      }
    },
  };
}
