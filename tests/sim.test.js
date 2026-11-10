import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBot } from './helpers/bot.js';

const careful = runBot({ alignmentShare: 0.45, decisionPolicy: 'safe' });

test('careful play reaches immortality within 1–3 hours', () => {
  assert.equal(careful.winner, 'player');
  assert.equal(careful.ending, 'immortality');
  assert.ok(careful.gameTime >= 3600 && careful.gameTime <= 10800, `${careful.gameTime}s`);
});

test('every era has a reasonable length', () => {
  for (let e = 1; e <= 6; e++) {
    const t = careful.eraTime[e];
    assert.ok(t >= 180 && t <= 2400, `era ${e}: ${Math.round(t)}s`);
  }
  assert.ok(careful.eraTime[7] <= 600, `era 7: ${Math.round(careful.eraTime[7])}s`);
});

test('something new to buy at least every 2 minutes early on', () => {
  const early = careful.purchases.filter((p) => p.t <= 600).map((p) => p.t);
  let prev = 0;
  for (const t of [...early, 600]) {
    assert.ok(t - prev <= 120, `gap ${Math.round(prev)}→${Math.round(t)}`);
    prev = t;
  }
});

test('reckless play ends in extinction', () => {
  const r = runBot({ alignmentShare: 0, decisionPolicy: 'first' });
  assert.equal(r.ending, 'extinction');
});

test('excessive caution lets the rival win', () => {
  const r = runBot({ alignmentShare: 0.95, decisionPolicy: 'safe' });
  assert.equal(r.winner, 'rival');
});

test('every decision is answered before the singularity (review #2)', () => {
  const r = runBot({ alignmentShare: 0, decisionPolicy: 'first' });
  assert.equal(r.state.pendingDecision, null);
  assert.ok('goal' in r.state.decisions, JSON.stringify(r.state.decisions));
});
