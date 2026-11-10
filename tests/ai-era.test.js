import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { serialize, deserialize } from '../src/save.js';
import { DECISIONS } from '../src/content/decisions.js';
import { tick, rates, choose, setAlignmentShare, agiReadiness, alignmentRatio } from '../src/engine.js';

function era6() {
  const s = createState();
  s.progress = 1e20; s.ideas = 0; s.owned.ani = 1; s.decisions = Object.fromEntries(DECISIONS.map((d) => [d.id, 0]));
  tick(s, 0.1);
  return s;
}

test('decisions are well formed', () => {
  assert.ok(DECISIONS.length >= 4);
  for (const d of DECISIONS) {
    assert.ok(d.id && d.title && d.text && d.options.length >= 2, d.id);
    for (const o of d.options) assert.ok(o.label && typeof o.effect === 'object', `${d.id} option`);
  }
});

test('alignment share diverts production away from progress', () => {
  const s = era6();
  setAlignmentShare(s, 0);
  const full = rates(s).progressPerSec;
  setAlignmentShare(s, 0.5);
  const r = rates(s);
  assert.ok(Math.abs(r.progressPerSec / full - 0.5) < 1e-9);
  assert.ok(Math.abs(r.alignmentPerSec - r.progressPerSec) / r.progressPerSec < 1e-9);
  const a0 = s.alignment; const c0 = s.capability;
  tick(s, 1);
  assert.ok(s.alignment > a0 && s.capability > c0);
});

test('setAlignmentShare clamps to 0..1', () => {
  const s = era6();
  setAlignmentShare(s, 2); assert.equal(s.alignmentShare, 1);
  setAlignmentShare(s, -1); assert.equal(s.alignmentShare, 0);
});

test('alignment does not divert before era 6', () => {
  const s = createState();
  s.owned.elders = 1; s.alignmentShare = 0.9;
  assert.equal(rates(s).alignmentPerSec, 0);
});

test('AGI needs both compute and software', () => {
  const s = era6();
  s.hardware = 1e9; s.owned.gpus = 1; s.owned.transistor = 1; s.owned.chips = 1;
  s.progress = 1e25; tick(s, 0.1);
  assert.equal(agiReadiness(s).compute, 1);
  assert.equal(s.agi, false, 'compute alone is not enough');
  const t = era6();
  t.owned.genetic = 10; tick(t, 0.1);
  assert.equal(agiReadiness(t).software, 1);
  assert.equal(t.agi, false, 'software alone is not enough');
  s.owned.genetic = 10; tick(s, 0.1);
  assert.equal(s.agi, true);
  assert.equal(s.era, 7);
});

test('brain scanning path reaches software readiness', () => {
  const s = era6();
  s.owned.scanning = 8; tick(s, 0.1);
  assert.equal(agiReadiness(s).software, 1);
});

test('a pending decision freezes the game', () => {
  const s = era6();
  s.pendingDecision = DECISIONS[0].id;
  const before = serialize(s);
  tick(s, 5);
  assert.equal(serialize(s), before);
});

test('decision triggers once, choose applies effect and clears it', () => {
  const s = createState();
  const d = DECISIONS[0];
  s.progress = d.trigger.minProgress; s.agi = !!d.trigger.requiresAgi;
  tick(s, 0.1);
  assert.equal(s.pendingDecision, d.id);
  assert.equal(choose(s, d.id, 99), false);
  const r0 = alignmentRatio(s);
  assert.equal(choose(s, d.id, 1), true);
  assert.equal(s.pendingDecision, null);
  assert.equal(s.decisions[d.id], 1);
  assert.ok(Math.abs(alignmentRatio(s) - r0 - (d.options[1].effect.alignmentBonus ?? 0)) < 1e-12);
  tick(s, 0.1);
  assert.notEqual(s.pendingDecision, d.id, 'asked only once');
});

test('rival is inactive before era 6 and starts with era 6', () => {
  const s = createState();
  s.progress = 1e19; tick(s, 1);
  assert.equal(s.rival.active, false);
  assert.equal(s.rival.progress, 0);
  const t = era6();
  assert.equal(t.rival.active, true);
  const p0 = t.rival.progress;
  assert.ok(p0 > 0);
  tick(t, 10);
  assert.ok(t.rival.progress > p0);
});

test('pending decision survives save/load', () => {
  const s = era6();
  s.pendingDecision = DECISIONS[1].id;
  assert.equal(deserialize(serialize(s)).pendingDecision, DECISIONS[1].id);
});

test('a decision triggered mid-step stops the hyperbolic phase (review #2)', () => {
  const s = createState();
  s.era = 7; s.agi = true; s.progress = 9.9e39; s.rival = { active: true, progress: 1 };
  s.decisions = Object.fromEntries(DECISIONS.filter((d) => d.id !== 'goal').map((d) => [d.id, 0]));
  tick(s, 1);
  assert.equal(s.pendingDecision, 'goal');
  assert.equal(s.singularity, false);
  assert.ok(s.progress < 1e45, `${s.progress}`);
});

test('nothing can be bought or claimed while a decision is pending (review #5)', async () => {
  const { canBuy, claimEvent } = await import('../src/engine.js');
  const s = createState();
  s.ideas = 1e6; s.pendingDecision = 'internet'; s.activeEvent = { id: 'genius', expires: 100 };
  assert.equal(canBuy(s, 'fire'), false);
  assert.equal(claimEvent(s), false);
});
