import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { DECISIONS } from '../src/content/decisions.js';
import { tick } from '../src/engine.js';
import { chooseEnding, ENDINGS, eraTimeline } from '../src/endings.js';
import { STAIRCASE, staircaseLevel } from '../src/content/staircase.js';
import { formatNumber } from '../src/format.js';
import { P_SINGULARITY } from '../src/balance.js';

function agiState() {
  const s = createState();
  s.era = 7; s.agi = true; s.progress = 1e30;
  s.owned = { ani: 20, transformers: 1, scaling: 1, gpus: 1, megacluster: 3, genetic: 10 };
  s.hardware = 1000; s.alignmentShare = 0.3;
  s.rival = { active: true, progress: 1e20 };
  s.decisions = Object.fromEntries(DECISIONS.map((d) => [d.id, 1]));
  return s;
}

test('singularity arrives in finite time, progress stays finite and monotonic', () => {
  const s = agiState();
  let prev = s.progress;
  for (let t = 0; t < 900 && !s.singularity; t++) {
    tick(s, 1);
    assert.ok(Number.isFinite(s.progress), `t=${t}`);
    assert.ok(s.progress >= prev);
    prev = s.progress;
  }
  assert.equal(s.singularity, true);
  assert.equal(s.winner, 'player');
  assert.equal(s.progress, P_SINGULARITY);
  assert.ok(['immortality', 'sidelined', 'extinction'].includes(s.ending));
  assert.notEqual(formatNumber(s.progress), 'NaN');
});

test('after singularity tick changes nothing', () => {
  const s = agiState();
  s.singularity = true; s.winner = 'player'; s.ending = 'sidelined';
  const before = JSON.stringify(s);
  tick(s, 100);
  assert.equal(JSON.stringify(s), before);
});

test('rival reaching the singularity first wins', () => {
  const s = agiState();
  s.progress = 1e29; s.agi = false; s.era = 6; s.owned = {};
  s.rival.progress = 1e60;
  for (let t = 0; t < 900 && !s.singularity; t++) tick(s, 1);
  assert.equal(s.winner, 'rival');
  assert.equal(s.rival.progress, P_SINGULARITY);
});

test('chooseEnding thresholds', () => {
  const s = createState();
  s.decisions = {};
  s.winner = 'player'; s.aiTime = 100;
  s.aiShareSum = 46; assert.equal(chooseEnding(s), 'immortality'); // average 0.46 → ratio 0.85
  s.aiShareSum = 33; assert.equal(chooseEnding(s), 'sidelined');   // 0.33 → 0.49
  s.aiShareSum = 23; assert.equal(chooseEnding(s), 'extinction');  // 0.23 → 0.30
  s.winner = 'rival'; s.aiShareSum = 90;
  assert.equal(chooseEnding(s), 'extinction', 'rival without treaty');
  s.decisions.moratorium = 1;
  assert.equal(chooseEnding(s), 'sidelined', 'rival under treaty');
});

test('every ending has a title and text', () => {
  for (const id of ['immortality', 'sidelined', 'extinction']) {
    assert.ok(ENDINGS[id].title && ENDINGS[id].paragraphs.length >= 2, id);
  }
});

test('eraTimeline covers -70000..2045 and sums time', () => {
  const s = createState();
  s.eraTime = [0, 600, 500, 400, 300, 200, 100, 10];
  s.eraStartProgress = [0, 0, 1e4, 1e7, 1e10, 1e14, 1e20, 1e30];
  const tl = eraTimeline(s);
  assert.equal(tl.length, 7);
  assert.equal(tl[0].fromYear, -70000);
  assert.equal(tl[6].toYear, 2045);
  assert.equal(tl[6].fromYear, 2035);
  assert.equal(tl.reduce((a, e) => a + e.seconds, 0), 2110);
  for (let i = 1; i < tl.length; i++) assert.equal(tl[i].fromYear, tl[i - 1].toYear);
});

test('staircase climbs from human level to the top', () => {
  assert.ok(STAIRCASE.length >= 8);
  const s = createState();
  s.progress = 1e30; s.era = 7;
  const lo = staircaseLevel(s);
  assert.equal(STAIRCASE[Math.floor(lo)].name, 'Human');
  s.progress = P_SINGULARITY;
  assert.equal(staircaseLevel(s), STAIRCASE.length - 1);
});

import { revealSentence } from '../src/ui/ending.js';
test('reveal sentence compares the first and the last era', () => {
  const r = revealSentence([
    { fromYear: -70000, toYear: -10000, seconds: 300 },
    { fromYear: 2035, toYear: 2045, seconds: 500 },
  ]);
  assert.equal(r.lead, 'You spent 5 min on the first 60,000 years. The last 10 years took 8 min.');
  assert.match(r.detail, /10,000 times more change/);
});

import { alignmentRatio, setAlignmentShare } from '../src/engine.js';
test('safety must be kept up the whole AI era: a last-minute switch does not save you', () => {
  const s = agiState();
  s.era = 6; s.agi = false; s.progress = 1e20; s.rival.progress = 1;
  setAlignmentShare(s, 0);
  tick(s, 950);
  setAlignmentShare(s, 0.9);
  tick(s, 50);
  assert.ok(alignmentRatio(s) < 0.4, `ratio ${alignmentRatio(s)}`);
});

test('a steady share gives the expected ratio', () => {
  const s = agiState();
  s.era = 6; s.agi = false; s.progress = 1e20; s.rival.progress = 1;
  s.decisions = {};
  setAlignmentShare(s, 0.45);
  tick(s, 300);
  assert.ok(Math.abs(alignmentRatio(s) - 0.45 / 0.55) < 1e-6, `ratio ${alignmentRatio(s)}`);
});
