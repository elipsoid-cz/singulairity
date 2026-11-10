// News ticker line plus the clickable lucky event (inverted colours, no glow).
import { h, setText } from './dom.js';
import { pickTickerLine, tickerInterval } from '../content/ticker.js';
import { EVENTS } from '../content/events.js';

export function mountTicker(el, onClaim) {
  const line = h('div', { class: 'ticker-line' });
  const eventBtn = h('button', { class: 'event', type: 'button', hidden: true, onclick: () => onClaim() });
  el.append(line, eventBtn);
  let nextAt = 0;
  return {
    update(state, now = performance.now()) {
      if (now >= nextAt || state.tickerQueue.length) { // a fresh discovery is announced right away
        const next = pickTickerLine(state);
        if (next !== null) setText(line, next); // nothing new: the current line simply stays longer
        nextAt = now + (next !== null ? tickerInterval(state) : 2) * 1000;
      }
      const ev = state.activeEvent && EVENTS.find((e) => e.id === state.activeEvent.id);
      eventBtn.hidden = !ev;
      if (ev) setText(eventBtn, `★ ${ev.text}  (×${ev.mult} for ${ev.duration} s)`);
    },
  };
}
