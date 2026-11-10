// The ending: first the reveal (how your real time compares to calendar time), then the outcome.
import { h } from './dom.js';
import { eraTimeline, ENDINGS } from '../endings.js';
import { formatDuration, formatYear, formatNumber } from '../format.js';

const NOW_YEAR = 2026;
const SVG_NS = 'http://www.w3.org/2000/svg';
const COLORS = ['#e9e4d4', '#b5a67a', '#2f4f8f', '#a2381f', '#00785a', '#2b2bd6', '#ffd400'];

function svg(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

function chart(timeline) {
  const W = 720; const X0 = 110; const BAR = 34; const width = W - X0 - 16;
  const years = timeline.map((e) => Math.max(0, e.toYear - e.fromYear));
  const secs = timeline.map((e) => Math.max(0, e.seconds));
  const totalYears = years.reduce((a, b) => a + b, 0) || 1;
  const totalSecs = secs.reduce((a, b) => a + b, 0) || 1;
  const root = svg('svg', { viewBox: `0 0 ${W} 210`, role: 'img', 'aria-label': 'Calendar years versus your real time, per era' });
  const row = (y, values, total, label) => {
    root.append(svg('text', { x: 8, y: y + 22, 'font-size': 13, fill: 'currentColor' }, label));
    let x = X0;
    values.forEach((v, i) => {
      const w = (v / total) * width;
      if (w > 0) root.append(svg('rect', { x, y, width: Math.max(w, 0.5), height: BAR, fill: COLORS[i], stroke: '#000', 'stroke-width': 0.5 }));
      x += w;
    });
  };
  row(20, years, totalYears, 'Calendar');
  row(90, secs, totalSecs, 'Your time');
  // "You are here": 2026 sits at the far right of the calendar.
  const nowX = X0 + ((NOW_YEAR - timeline[0].fromYear) / totalYears) * width;
  root.append(svg('line', { x1: nowX, y1: 12, x2: nowX, y2: 62, stroke: 'currentColor', 'stroke-width': 2 }));
  root.append(svg('text', { x: nowX - 4, y: 10, 'font-size': 12, 'text-anchor': 'end', fill: 'currentColor' }, 'You are here — 2026 →'));
  // Legend.
  timeline.forEach((e, i) => {
    const x = 8 + (i % 4) * 178; const y = 150 + Math.floor(i / 4) * 22;
    root.append(svg('rect', { x, y, width: 12, height: 12, fill: COLORS[i], stroke: '#000', 'stroke-width': 0.5 }));
    root.append(svg('text', { x: x + 18, y: y + 11, 'font-size': 12, fill: 'currentColor' }, e.name));
  });
  return root;
}

/** One sentence that makes the acceleration tangible. */
export function revealSentence(timeline) {
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const firstYears = first.toYear - first.fromYear;
  const lastYears = Math.max(1, last.toYear - last.fromYear);
  const perYearFirst = first.seconds / firstYears;
  const perYearLast = last.seconds / lastYears;
  const ratio = perYearFirst > 0 ? perYearLast / perYearFirst : 0;
  return {
    lead: `You spent ${formatDuration(first.seconds)} on the first ${formatNumber(Math.round(firstYears))} years. `
      + `The last ${formatNumber(Math.round(lastYears))} years took ${formatDuration(last.seconds)}.`,
    detail: ratio > 1
      ? `Each of those final years held about ${formatNumber(Math.round(ratio))} times more change than a year around the fire.`
      : '',
  };
}

export function showEnding(el, state, { onRestart, onShare, onSaveImage, verdict = null }) {
  const timeline = eraTimeline(state);
  const ending = ENDINGS[state.ending] ?? ENDINGS.sidelined;
  const reveal = revealSentence(timeline);
  const rows = timeline.map((e) => h('tr', {},
    h('td', {}, e.name), h('td', {}, `${formatYear(e.fromYear)} – ${formatYear(e.toYear)}`), h('td', {}, formatDuration(e.seconds))));
  const inner = h('div', { class: 'ending-inner' },
    h('h2', {}, 'Singularity'),
    h('p', { class: 'reveal' }, reveal.lead),
    reveal.detail ? h('p', {}, reveal.detail) : null,
    chart(timeline),
    h('p', {}, 'Look at where 2026 sits on the calendar bar: at the very edge, right where the bar of your own time suddenly grows. '
      + 'In the game, that is the moment the curve stops looking flat. In the real world, it is today.'),
    h('table', { class: 'times' }, h('tbody', {}, rows)),
    h('h2', {}, state.winner === 'rival' ? `${ending.title} (the rival lab got there first)` : ending.title),
    ...ending.paragraphs.map((p) => h('p', {}, p)),
    h('p', { class: 'note' }, 'Sources and inspiration: Tim Urban, ',
      h('a', { href: 'https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html', target: '_blank', rel: 'noopener' }, 'The AI Revolution, part 1'),
      ' and ',
      h('a', { href: 'https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-2.html', target: '_blank', rel: 'noopener' }, 'part 2'),
      ' (Wait But Why, 2015). Game design inspired by Frank Lantz\'s ',
      h('a', { href: 'https://www.decisionproblem.com/paperclips/', target: '_blank', rel: 'noopener' }, 'Universal Paperclips'),
      ' (2017).'),
    verdict ? h('p', { class: 'reveal' }, verdict) : null,
    h('div', { class: 'ending-actions' },
      onShare ? h('button', { class: 'primary', type: 'button', onclick: (e) => onShare(e.currentTarget) }, 'Share result') : null,
      onSaveImage ? h('button', { class: 'secondary', type: 'button', onclick: () => onSaveImage() }, 'Save image') : null,
      h('button', { class: 'secondary', type: 'button', onclick: onRestart }, 'New game')));
  el.replaceChildren(inner);
  el.hidden = false;
}
