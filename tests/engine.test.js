import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { progressOf } from '../src/calendar.js';
import { UPGRADES } from '../src/content/upgrades.js';
import { ERAS } from '../src/content/eras.js';
import { cost, canBuy, buy, visibleUpgrades, clickIdea, clickValue, rates, tick } from '../src/engine.js';
import { CLICK_BASE } from '../src/balance.js';

const byId = (id) => UPGRADES.find((u) => u.id === id);

test('content is well formed', () => {
  const ids = new Set();
  for (const u of UPGRADES) {
    assert.ok(!ids.has(u.id), `duplicate ${u.id}`);
    ids.add(u.id);
    assert.ok(u.era >= 1 && u.era <= 7, u.id);
    assert.ok(u.cost > 0, u.id);
    for (const r of u.requires ?? []) assert.ok(UPGRADES.some((x) => x.id === r), `${u.id} requires unknown ${r}`);
  }
  for (let e = 1; e <= 7; e++) assert.ok(UPGRADES.filter((u) => u.era === e).length >= 4, `era ${e} too thin`);
  assert.deepEqual(ERAS.map((e) => e.id), [1, 2, 3, 4, 5, 6, 7]);
});

test('buy fails without enough ideas and changes nothing', () => {
  const s = createState();
  const before = JSON.stringify(s);
  assert.equal(buy(s, 'fire'), false);
  assert.equal(JSON.stringify(s), before);
});

test('buy subtracts exact cost and repeatables get pricier', () => {
  const s = createState();
  const shelter = byId('shelter');
  s.ideas = 1e6;
  const c0 = cost(s, 'shelter');
  assert.equal(c0, shelter.cost);
  assert.equal(buy(s, 'shelter'), true);
  assert.equal(s.ideas, 1e6 - c0);
  assert.equal(cost(s, 'shelter'), shelter.cost * shelter.costGrowth);
});

test('one-time upgrades cannot be bought twice', () => {
  const s = createState();
  s.ideas = 1e6;
  assert.equal(buy(s, 'fire'), true);
  assert.equal(canBuy(s, 'fire'), false);
  assert.equal(buy(s, 'fire'), false);
});

test('future-era upgrades are not buyable', () => {
  const s = createState();
  s.ideas = 1e30;
  assert.equal(canBuy(s, 'writing'), false);
});

test('clickIdea adds ideas and progress', () => {
  const s = createState();
  for (let i = 0; i < 10; i++) clickIdea(s);
  assert.equal(s.ideas, 10 * CLICK_BASE);
  assert.equal(s.progress, 10 * CLICK_BASE);
  assert.equal(s.stats.clicks, 10);
});

test('one big tick approximates many small ticks', () => {
  const mk = () => { const s = createState(); s.ideas = 1e3; buy(s, 'fire'); buy(s, 'elders'); return s; };
  const a = mk(); const b = mk();
  tick(a, 60);
  for (let i = 0; i < 600; i++) tick(b, 0.1);
  assert.ok(Math.abs(a.progress - b.progress) / b.progress < 0.05, `${a.progress} vs ${b.progress}`);
});

test('huge dt never produces NaN or negatives', () => {
  const s = createState();
  s.ideas = 1e5; s.progress = 2e4; buy(s, 'fire'); buy(s, 'elders');
  tick(s, 1e6);
  for (const k of ['ideas', 'progress', 'population', 'energy']) {
    assert.ok(Number.isFinite(s[k]) && s[k] >= 0, `${k}=${s[k]}`);
  }
});

test('ideas decay in era 2 without writing, not with it', () => {
  const s = createState();
  s.progress = 2e4; s.population = 0; tick(s, 0.1);
  assert.equal(s.era, 2);
  s.ideas = 1000;
  tick(s, 10);
  assert.ok(s.ideas < 1000, 'should decay');
  s.owned.writing = 1; s.ideas = 1000;
  tick(s, 10);
  assert.ok(s.ideas >= 1000, 'writing stops decay');
});

test('computeCps doubles every two calendar years', () => {
  const s = createState();
  s.hardware = 10;
  s.progress = progressOf(1990);
  const a = rates(s).computeCps;
  s.progress = progressOf(1992);
  const b = rates(s).computeCps;
  assert.ok(Math.abs(b / a - 2) < 1e-6, `${b / a}`);
  s.progress = progressOf(1900);
  assert.equal(rates(s).computeCps, 0);
});

test('era follows progress', () => {
  const s = createState();
  s.progress = 1e10;
  tick(s, 0.1);
  assert.equal(s.era, 4);
  assert.ok(s.eraTime[4] > 0);
});

test('new game shows first upgrade plus exactly one future teaser', () => {
  const s = createState();
  const vis = visibleUpgrades(s);
  assert.ok(vis.some((u) => u.id === 'fire'));
  assert.equal(vis.filter((u) => u.era > s.era).length, 1);
});

test('requires hides dependent upgrades', () => {
  const s = createState();
  const dependent = UPGRADES.find((u) => u.era === 1 && u.requires?.length);
  assert.ok(dependent, 'need at least one dependent upgrade in era 1');
  assert.ok(!visibleUpgrades(s).includes(dependent));
});

import { CLICK_SHARE } from '../src/balance.js';
test('a click is worth at least a slice of current production', () => {
  const s = createState();
  assert.equal(clickValue(s), CLICK_BASE);
  s.progress = 1e12; s.era = 4; s.owned = { steam: 1, factories: 3 };
  const r = rates(s);
  assert.ok(Math.abs(clickValue(s) - r.ideasPerSec * CLICK_SHARE) / clickValue(s) < 1e-9);
  assert.ok(clickValue(s) > CLICK_BASE * 100);
});
