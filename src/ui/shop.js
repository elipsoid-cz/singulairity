// Discoveries list: visible upgrades with price, description and an affordability bar.
import { h, setText, setBar, bar } from './dom.js';
import { visibleUpgrades, canBuy, cost, count } from '../engine.js';
import { ERAS } from '../content/eras.js';
import { formatNumber } from '../format.js';
import { describe } from '../content/describe.js';

const PIPS_MAX = 20; // above this, a bar instead of squares

export function mountShop(el, onBuy) {
  const items = new Map();

  function create(u) {
    const name = h('span');
    const price = h('span');
    const desc = h('div', { class: 'up-desc' });
    const progress = bar();
    // Built so far out of the maximum: one square per copy (a bar when there are many).
    const many = Number.isFinite(u.max) && u.max > PIPS_MAX;
    const pips = u.max > 1 && Number.isFinite(u.max)
      ? (many ? bar('built') : h('div', { class: 'pips', 'aria-hidden': 'true' }, Array.from({ length: u.max }, () => h('i'))))
      : null;
    const btn = h('button', { class: 'up', type: 'button', title: u.flavor ?? '', onclick: () => onBuy(u.id) },
      h('div', { class: 'up-head' }, name, price), desc, pips, progress);
    return { btn, name, price, desc, progress, pips, many };
  }

  function showBuilt(it, n, max) {
    if (!it.pips) return;
    if (it.many) { setBar(it.pips, n / max); return; }
    [...it.pips.children].forEach((pip, k) => pip.classList.toggle('on', k < n));
  }

  return {
    update(state) {
      const visible = visibleUpgrades(state);
      const ids = new Set(visible.map((u) => u.id));
      for (const [id, it] of items) {
        if (!ids.has(id)) { it.btn.remove(); items.delete(id); }
      }
      visible.forEach((u, i) => {
        let it = items.get(u.id);
        if (!it) { it = create(u); items.set(u.id, it); }
        if (el.children[i] !== it.btn) el.insertBefore(it.btn, el.children[i] ?? null);
        const locked = u.era > state.era;
        it.btn.classList.toggle('locked', locked);
        if (it.pips) it.pips.hidden = locked;
        if (locked) {
          setText(it.name, '???');
          setText(it.price, '');
          setText(it.desc, `Unlocks in the next era: ${ERAS[u.era - 1].name}.`);
          it.btn.disabled = true;
          setBar(it.progress, 0);
          return;
        }
        const n = count(state, u.id);
        const c = cost(state, u.id);
        const finite = Number.isFinite(u.max);
        setText(it.name, u.max > 1 ? (finite ? `${u.name} ${n}/${u.max}` : n > 0 ? `${u.name} ×${n}` : u.name) : u.name);
        showBuilt(it, n, u.max);
        setText(it.price, formatNumber(c));
        setText(it.desc, describe(u));
        it.btn.disabled = !canBuy(state, u.id);
        setBar(it.progress, state.ideas / c);
      });
    },
  };
}
