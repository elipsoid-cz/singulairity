// Header: year, calendar speed, Die Progress Unit, ideas.
import { h, setText } from './dom.js';
import { yearOf, dpuYear, yearsPerSecond } from '../calendar.js';
import { formatYear, formatDate, formatSpeed, progressLabel } from '../format.js';
import { rates } from '../engine.js';

function showYear(state, year) {
  return state.era >= 6 ? formatDate(year) : formatYear(year);
}

export function mountHud(el) {
  const year = h('span', { class: 'hud-year' });
  const speed = h('b');
  const ideas = h('b');
  const perSec = h('b');
  const dpu = h('span', { class: 'hud-dpu' });
  el.append(
    year,
    h('span', { class: 'hud-item' }, h('span', { class: 'hud-label' }, 'Calendar'), speed),
    h('span', { class: 'hud-item' }, h('span', { class: 'hud-label' }, 'Ideas'), ideas),
    h('span', { class: 'hud-item' }, h('span', { class: 'hud-label' }, 'Per second'), perSec),
    dpu,
  );
  return {
    update(state) {
      const r = rates(state);
      const y = yearOf(state.progress);
      setText(year, showYear(state, y));
      setText(speed, state.singularity ? 'time stands still' : formatSpeed(yearsPerSecond(state.progress, r.progressPerSec)));
      setText(ideas, progressLabel(state, state.ideas));
      setText(perSec, progressLabel(state, r.ideasPerSec));
      const shock = dpuYear(state.progress);
      setText(dpu, state.progress < 10
        ? 'Nothing has changed in living memory.'
        : `Someone from ${showYear(state, shock)} would die of shock today.`);
    },
  };
}
