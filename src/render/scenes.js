// One pixel-art scene per era. Every discovery leaves a visible mark in its era's scene,
// and a fresh discovery blinks for a moment (palette swap or a flat highlight colour, never glow).
import { seeded } from './pixel.js';
import { PALETTES, rgb6 } from './palettes.js';
import * as S from './sprites.js';
import { drawTrippy } from './trippy.js';

export const SCENE_SIZES = {
  1: [64, 36], 2: [96, 54], 3: [96, 54], 4: [128, 72], 5: [192, 108], 6: [320, 180], 7: [320, 180],
};

/** How a fresh discovery blinks in each era: 'swap' mirrors the palette, a number paints it flat. */
const HIGHLIGHT = { 1: 'swap', 2: 'swap', 3: 'swap', 4: 14, 5: rgb6(5, 5, 0), 6: 5 };

const own = (state, id) => state.owned[id] ?? 0;
const cap = (v, max) => Math.max(0, Math.min(max, Math.floor(v)));

/** Draw the element of discovery `id`; it blinks while it is fresh. */
function mark(px, t, era, id, draw) {
  const f = px.flash;
  const on = f && f.id === id && t < f.until && Math.floor(t * 8) % 2 === 0;
  if (on) px.override = HIGHLIGHT[era];
  draw();
  px.override = null;
}

function people(px, state, t, { n, y, xMin, xMax, color = 1, seed = 7 }) {
  const rnd = seeded(seed);
  for (let i = 0; i < n; i++) {
    const span = xMax - xMin;
    const speed = 1 + rnd() * 3;
    const phase = rnd() * 100;
    const pos = (t * speed + phase * span) % (2 * span);
    const x = xMin + (pos < span ? pos : 2 * span - pos);
    const frame = Math.floor(t * 4 + i) % 2;
    px.sprite(S.PERSON[frame], x, y + (i % 3), { 1: color });
  }
}

function stars(px, n, w, h, color, t, seed = 3) {
  const rnd = seeded(seed);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(rnd() * w); const y = Math.floor(rnd() * h);
    if ((Math.floor(t * 2) + i) % 9 !== 0) px.dot(x, y, color);
  }
}

// ── Era 1: night, fire, the tribe (64×36, 2 colours) ──────────────────
function era1(px, state, t) {
  const m = (id, fn) => own(state, id) && mark(px, t, 1, id, fn);
  px.clear(0);
  stars(px, 24, 64, 18, 1, t);
  px.rect(52, 3, 4, 6, 1); px.rect(51, 4, 6, 4, 1); px.rect(53, 3, 4, 5, 0); px.rect(54, 4, 3, 4, 0); // crescent moon
  px.rect(0, 30, 64, 1, 1);
  for (let x = 0; x < 64; x += 2) px.dot(x + ((x / 2) % 2), 32, 1);
  m('shelter', () => { for (let i = 0; i < cap(own(state, 'shelter'), 3); i++) px.sprite(S.SHELTER, 8 + i * 9, 25); });
  m('paintings', () => { px.rect(0, 14, 6, 16, 1); px.rect(1, 17, 4, 12, 0); px.dot(2, 20, 1); px.dot(3, 22, 1); });
  m('fire', () => px.sprite(S.FIRE[Math.floor(t * 6) % 2], 36, 26));
  m('storytelling', () => { // the tribe sits around the fire
    px.sprite(S.SITTER, 31, 27); px.sprite(S.SITTER, 41, 27); px.sprite(S.SITTER, 33, 23); px.sprite(S.SITTER, 39, 23);
  });
  m('elders', () => { for (let i = 0; i < cap(own(state, 'elders'), 3); i++) px.sprite(S.ELDER, 44 + i * 5, 26); });
  m('tools', () => px.sprite(S.SPEAR_HUNTER, 2 + (Math.floor(t) % 2), 25));
  m('trade', () => { // two groups passing something back and forth
    px.sprite(S.PERSON[0], 56, 25); px.sprite(S.PERSON[1], 61, 25);
    px.dot(58 + Math.round(Math.abs(Math.sin(t * 2)) * 2), 24, 1);
  });
  m('language', () => { // speech bubbles hop between people
    const k = Math.floor(t * 1.5) % 3;
    px.rect(16 + k * 7, 18, 5, 3, 1); px.dot(17 + k * 7, 21, 1);
  });
  people(px, state, t, { n: cap(Math.sqrt(state.population) * 1.1, 10), y: 25, xMin: 8, xMax: 28 });
}

// ── Era 2: day, fields, villages (96×54, still 2 colours) ─────────────
function era2(px, state, t) {
  const m = (id, fn) => own(state, id) && mark(px, t, 2, id, fn);
  px.clear(1);
  px.rect(84, 4, 8, 8, 0); px.rect(85, 5, 6, 6, 1); px.rect(87, 7, 2, 2, 0); // sun
  px.rect(0, 30, 96, 1, 0); // horizon
  m('villages', () => { for (let i = 0; i < cap(own(state, 'villages'), 5); i++) px.sprite(S.HUT, 2 + i * 9, 24, { 1: 0 }); });
  m('writing', () => { px.sprite(S.SCRIBE, 48, 26, { 1: 0 }); px.rect(55, 24, 3, 4, 0); px.dot(56, 25, 1); px.dot(56, 27, 1); });
  m('mathematics', () => px.sprite(S.STELE, 61, 21, { 1: 0 }));
  m('philosophy', () => {
    px.sprite(S.COLUMN, 68, 22, { 1: 0 });
    px.sprite(S.PERSON[0], 74, 26, { 1: 0 }); px.sprite(S.PERSON[1], 79, 26, { 1: 0 });
    if (Math.floor(t * 1.2) % 2) px.rect(74, 22, 3, 2, 0); else px.rect(79, 22, 3, 2, 0);
  });
  m('cities', () => { // a stepped ziggurat on the horizon
    px.rect(84, 26, 12, 4, 0); px.rect(86, 22, 8, 4, 0); px.rect(88, 18, 4, 4, 0); px.rect(89, 15, 2, 3, 0);
  });
  px.rect(0, 39, 96, 1, 0); // road edge
  people(px, state, t, { n: cap(Math.log2(state.population + 1), 10), y: 33, xMin: 0, xMax: 90, color: 0 });
  m('wheel', () => { // an ox pulls a cart; the spokes visibly turn
    const x = Math.round((t * 8) % 130) - 28;
    px.rect(x, 30, 13, 1, 0); px.rect(x, 31, 13, 3, 0); px.rect(x + 1, 32, 11, 1, 1); // wagon box
    px.rect(x + 12, 34, 4, 1, 0); // shaft
    px.sprite(S.WHEEL[Math.floor(t * 5) % 2], x + 3, 32, { 1: 0 });
    px.sprite(S.OX[Math.floor(t * 4) % 2], x + 15, 32, { 1: 0 });
  });
  m('irrigation', () => { for (let x = 0; x < 96; x++) { px.dot(x, 42 + Math.round(Math.sin(x / 6 + t)), 0); px.dot(x, 43 + Math.round(Math.sin(x / 6 + t)), 0); } });
  m('farms', () => {
    for (let i = 0; i < cap(own(state, 'farms'), 8); i++) {
      const fx = 2 + (i % 4) * 24; const fy = 46 + Math.floor(i / 4) * 4;
      for (let x = 0; x < 20; x += 2) px.rect(fx + x, fy, 1, 3 - ((x + Math.floor(t * 2)) % 5 === 0 ? 1 : 0), 0);
    }
  });
}

// ── Era 3: a town of books and instruments (96×54, 4 colours) ─────────
function era3(px, state, t) {
  const m = (id, fn) => own(state, id) && mark(px, t, 3, id, fn);
  const town = { 2: 1, 3: 2, 1: 0 };
  px.clear(3);
  px.rect(80, 5, 7, 7, 2); // sun
  for (let i = 0; i < 3; i++) px.rect(((t * 2 + i * 37) % 120) - 20, 6 + i * 5, 12, 2, 2); // clouds
  px.rect(0, 42, 96, 12, 2);
  px.rect(0, 42, 96, 1, 1);
  for (let i = 0; i < 3; i++) px.sprite(S.HOUSE, 2 + i * 8.5, 36, town);
  m('libraries', () => { for (let i = 0; i < cap(own(state, 'libraries'), 3); i++) px.sprite(S.HOUSE, 27 + i * 8, 36, { 2: 0, 3: 1, 1: 3 }); });
  px.sprite(S.TOWER, 52, 34, town);
  m('universities', () => { for (let i = 0; i < cap(own(state, 'universities'), 2); i++) px.sprite(S.TOWER, 58 + i * 6, 34, { 2: 0, 3: 1, 1: 3 }); });
  m('printing', () => {
    px.sprite(S.PRESS, 72, 36, { 1: 0, 2: 3 });
    for (let i = 0; i < 4; i++) { const k = (t * 8 + i * 12) % 40; px.rect(75 + k, 34 - k / 3, 2, 2, 3); }
  });
  m('telescope', () => px.sprite(S.TELESCOPE, 88, 36, { 3: 1, 1: 0 }));
  const board = () => { px.rect(4, 44, 16, 9, 1); px.rect(5, 45, 14, 7, 0); };
  m('method', () => { // a blackboard with measured data points
    board();
    for (let i = 0; i < 5; i++) px.dot(6 + i * 3, 50 - i, 3);
  });
  m('calculus', () => { // the curve through the points: the mathematics of change
    if (!own(state, 'method')) board();
    for (let x = 0; x < 13; x++) px.dot(6 + x, 51 - Math.round((x * x) / 30), 2);
  });
  m('postal', () => px.sprite(S.CART[Math.floor(t * 4) % 2], (t * 10) % 110 - 10, 45, { 1: 0 }));
  people(px, state, t, { n: 8, y: 45, xMin: 24, xMax: 92, color: 0 });
}

// ── Era 4: smoke, steel and electricity (128×72, 16 colours) ──────────
function era4(px, state, t) {
  const m = (id, fn) => own(state, id) && mark(px, t, 4, id, fn);
  const factories = cap(own(state, 'factories'), 5);
  px.clear(factories > 3 ? 7 : 11);
  px.rect(104, 6, 8, 8, 14);
  px.rect(0, 58, 128, 14, 8);
  px.rect(0, 58, 128, 1, 0);
  m('electricity', () => {
    for (let x = 0; x < 128; x += 16) { px.rect(x, 30, 1, 28, 0); px.rect(x - 2, 30, 5, 1, 0); }
    for (let x = 0; x < 128; x++) px.dot(x, 31 + Math.round(Math.abs(Math.sin((x % 16) / 5))), 0);
    for (let i = 0; i < 6; i++) if ((Math.floor(t * 3) + i) % 3) px.dot(8 + i * 16, 33, 14); // lit bulbs
  });
  m('telegraph', () => {
    for (let x = 6; x < 128; x += 24) px.rect(x, 44, 1, 14, 6);
    px.rect(0, 45, 128, 1, 6);
    px.rect((t * 50) % 128, 44, 2, 1, 15); // a message running down the wire
  });
  m('factories', () => {
    for (let i = 0; i < factories; i++) {
      const x = 4 + i * 17;
      px.sprite(S.FACTORY, x, 49, { 1: 0, 14: (Math.floor(t * 2) + i) % 4 ? 14 : 6 });
      for (let k = 0; k < 4; k++) {
        const age = (t * 1.5 + k * 0.7 + i) % 3;
        px.rect(x + 7 + age * 3, 46 - age * 6, 2 + age, 2 + age, age > 2 ? 7 : 8);
      }
    }
  });
  m('assembly', () => { // conveyor belt with boxes along the factory floor
    px.rect(0, 57, 88, 1, 0);
    for (let k = 0; k < 9; k++) px.rect(((t * 12 + k * 10) % 90) - 2, 55, 3, 2, 6);
  });
  m('germs', () => px.sprite(S.HOSPITAL, 88, 49, { 1: 15, 12: 12 }));
  m('labs', () => { for (let i = 0; i < cap(own(state, 'labs'), 2); i++) px.sprite(S.LAB, 99 + i * 9, 51, { 1: 0, 3: (Math.floor(t * 2) + i) % 2 ? 10 : 2 }); });
  m('coal', () => px.sprite(S.HEADFRAME, 119, 51, { 1: 0 }));
  m('steam', () => {
    const tx = (t * 20) % 170 - 20;
    px.rect(0, 64, 128, 1, 0);
    px.sprite(S.TRAIN, tx, 59, { 1: 0, 7: 4 });
    px.rect(tx + 1, 55 - (t * 4) % 4, 3, 2, 7);
  });
  people(px, state, t, { n: 14, y: 65, xMin: 0, xMax: 124, color: 0 });
}

// ── Era 5: night city, machines that never sleep (192×108, 256 colours) ─
function era5(px, state, t) {
  const m = (id, fn) => own(state, id) && mark(px, t, 5, id, fn);
  px.clear(rgb6(0, 0, 1));
  stars(px, 40, 192, 50, rgb6(5, 5, 4), t, 11);
  const rnd = seeded(5);
  const roofs = [];
  for (let i = 0; i < 18; i++) {
    const w = 8 + Math.floor(rnd() * 8); const hgt = 20 + Math.floor(rnd() * 45); const x = i * 11 - 2;
    roofs.push([x + Math.floor(w / 2), 90 - hgt]);
    px.rect(x, 90 - hgt, w, hgt, rgb6(0, 1, 2));
    for (let wy = 92 - hgt; wy < 88; wy += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) {
      if (((wx * 7 + wy * 13 + Math.floor(t / 2)) % 5) === 0) px.dot(wx, wy, rgb6(5, 5, 2));
    }
  }
  m('opensource', () => { // people sharing code: links between rooftops light up in turn
    for (let i = 0; i + 1 < roofs.length; i++) {
      if ((Math.floor(t * 4) + i) % 4) continue;
      const [x1, y1] = roofs[i]; const [x2, y2] = roofs[i + 1];
      for (let k = 0; k <= 10; k++) px.dot(x1 + ((x2 - x1) * k) / 10, y1 + ((y2 - y1) * k) / 10 - 2, rgb6(0, 4, 5));
    }
  });
  m('transistor', () => { // a billboard shows the newest piece of hardware
    px.rect(148, 6, 40, 26, rgb6(5, 5, 5)); px.rect(149, 7, 38, 24, rgb6(0, 0, 0));
    if (!own(state, 'chips')) {
      const sp = S.TRANSISTOR;
      for (let j = 0; j < sp.h; j++) for (let i = 0; i < sp.w; i++) if (sp.px[j * sp.w + i] === 1) px.rect(163 + i * 2, 13 + j * 2, 2, 2, rgb6(3, 3, 3));
    }
  });
  m('chips', () => {
    if (!own(state, 'transistor')) { px.rect(148, 6, 40, 26, rgb6(5, 5, 5)); px.rect(149, 7, 38, 24, rgb6(0, 0, 0)); }
    const sp = S.CHIP;
    for (let j = 0; j < sp.h; j++) for (let i = 0; i < sp.w; i++) {
      const v = sp.px[j * sp.w + i];
      if (v !== 255) px.rect(159 + i * 2, 11 + j * 2, 2, 2, v === 1 ? rgb6(4, 4, 4) : rgb6(0, 3, 1));
    }
  });
  px.rect(0, 90, 192, 18, rgb6(1, 1, 1));
  const racks = cap(Math.ceil(own(state, 'computers') / 3) + own(state, 'datacenters'), 26);
  const rack = (i) => px.sprite(S.RACK, 3 + i * 7, 96,
    { 1: rgb6(1, 1, 2), 10: (Math.floor(t * 5) + i) % 3 ? rgb6(0, 5, 2) : rgb6(0, 2, 1), 11: rgb6(5, 1, 0), 2: rgb6(2, 2, 3) });
  const fromComputers = cap(Math.ceil(own(state, 'computers') / 3), 26);
  if (fromComputers) mark(px, t, 5, 'computers', () => { for (let i = 0; i < fromComputers; i++) rack(i); });
  if (racks > fromComputers) mark(px, t, 5, 'datacenters', () => { for (let i = fromComputers; i < racks; i++) rack(i); });
  m('internet', () => {
    for (let k = 0; k < 3; k++) {
      const a = t / (4 + k) + k * 2;
      px.sprite(S.SATELLITE, 96 + Math.cos(a) * (70 + k * 10), 40 + Math.sin(a) * 12, { 1: rgb6(4, 4, 4), 3: rgb6(1, 2, 5) });
    }
  });
  m('smartphones', () => { for (let i = 0; i < 30; i++) px.dot((i * 37 + t * 9) % 192, 92 + (i % 4), rgb6(2, 4, 5)); });
}

// ── Era 6: flat shapes, clean rooms, the race (320×180) ───────────────
function era6(px, state, t) {
  const m = (id, fn) => own(state, id) && mark(px, t, 6, id, fn);
  px.clear(0);
  px.rect(0, 150, 320, 30, 11);
  px.rect(0, 150, 320, 1, 1);
  const cluster = (i, color) => {
    const x = 8 + (i % 8) * 26; const y = 112 - Math.floor(i / 8) * 34;
    px.rect(x, y, 22, 30, color);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) {
      px.rect(x + 2 + c * 5, y + 3 + r * 4, 3, 2, ((Math.floor(t * 3) + r + c + i) % 7 === 0) ? 5 : 7);
    }
  };
  let n = 0;
  m('ani', () => { for (let k = 0; k < cap(own(state, 'ani'), 6); k++) cluster(n++, 6); });
  m('gpus', () => { for (let k = 0; k < 2; k++) cluster(n++, 3); });
  m('megacluster', () => { for (let k = 0; k < cap(own(state, 'megacluster'), 8); k++) if (n < 16) cluster(n++, 1); });
  m('transformers', () => { // an attention matrix: every token looks at every other
    px.rect(8, 8, 42, 42, 1);
    for (let r = 0; r < 8; r++) for (let c = 0; c <= r; c++) {
      const hot = (r * 7 + c * 3 + Math.floor(t * 4)) % 9 === 0 || r === c;
      px.rect(10 + c * 5, 10 + r * 5, 4, 4, hot ? 5 : 2);
    }
  });
  m('scaling', () => { // scaling laws: a straight line on a log-log plot
    px.rect(58, 8, 70, 42, 11); px.rect(58, 49, 70, 1, 1); px.rect(58, 8, 1, 42, 1);
    const reach = Math.floor(((t * 10) % 70));
    for (let x = 0; x < reach; x++) px.rect(59 + x, 46 - Math.round(x * 0.52), 1, 1, 3);
  });
  // Data moving toward the lab: small squares along a line.
  px.rect(0, 146, 320, 1, 6);
  for (let k = 0; k < 14; k++) px.rect((t * 40 + k * 23) % 320, 144, 3, 3, 2);
  // Your lab (blue) and the rival lab (red), heights show progress.
  const you = Math.log10(Math.max(10, state.progress)); const rival = Math.log10(Math.max(10, state.rival.progress || 10));
  const hy = Math.max(2, Math.min(100, (you - 19) * 10)); const hr = Math.max(2, Math.min(100, (rival - 19) * 10));
  px.rect(228, 150 - hy, 30, hy, 2); px.rect(270, 150 - hr, 30, hr, 4);
  px.rect(228, 150 - hy, 30, 2, 1); px.rect(270, 150 - hr, 30, 2, 1);
  // The road to AGI: a brain-shaped box that fills as the software paths progress.
  if (own(state, 'scanning') || own(state, 'genetic') || state.agi) {
    const fill = Math.min(1, Math.max(state.agiPaths.emulation, state.agiPaths.evolution) + (state.agi ? 1 : 0));
    px.rect(240, 10, 50, 30, 7); px.rect(240, 40 - 30 * fill, 50, 30 * fill, 3);
    px.rect(240, 10, 50, 1, 1); px.rect(240, 39, 50, 1, 1); px.rect(240, 10, 1, 30, 1); px.rect(289, 10, 1, 30, 1);
  }
  m('scanning', () => { const y = 11 + Math.floor((t * 20) % 28); px.rect(241, y, 48, 1, 10); });
  m('genetic', () => { // a turning double helix next to the brain
    for (let y = 0; y < 30; y++) {
      const a = y / 4 + t * 3;
      px.dot(228 + Math.round(Math.sin(a) * 4), 10 + y, 9);
      px.dot(228 - Math.round(Math.sin(a) * 4), 10 + y, 10);
    }
  });
  people(px, state, t, { n: 12, y: 160, xMin: 0, xMax: 310, color: 1, seed: 21 });
}

const DRAW = { 1: era1, 2: era2, 3: era3, 4: era4, 5: era5, 6: era6, 7: drawTrippy };

export function sceneFor(era) {
  const [w, h] = SCENE_SIZES[era];
  return { w, h, palette: PALETTES[Math.min(era, 6)], draw: DRAW[era] };
}
