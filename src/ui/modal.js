// Crisis decision dialog. The game is frozen while it is open (engine ignores ticks).
import { h } from './dom.js';
import { DECISIONS } from '../content/decisions.js';

export function mountModal(el, onChoose) {
  let shown = null;
  return {
    update(state) {
      const id = state.pendingDecision;
      if (id === shown) return;
      shown = id;
      if (!id) { el.hidden = true; el.replaceChildren(); return; }
      const d = DECISIONS.find((x) => x.id === id);
      const box = h('div', { class: 'modal-box', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'decision-title' },
        h('h2', { id: 'decision-title' }, d.title),
        h('p', {}, d.text),
        h('p', { class: 'note' }, 'Time is frozen until you decide.'),
        h('div', { class: 'choices' }, d.options.map((o, i) =>
          h('button', { class: 'choice', type: 'button', onclick: () => onChoose(d.id, i) }, h('b', {}, o.label), o.text))));
      el.replaceChildren(box);
      el.hidden = false;
      box.querySelector('button').focus();
    },
  };
}
