import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearOf, progressOf, dpuYear } from '../src/calendar.js';

test('milestones map exactly', () => {
  assert.equal(yearOf(1e7), 1440);
  assert.equal(yearOf(1e30), 2035);
  assert.equal(yearOf(1e100), 2045);
});
test('yearOf is monotonic', () => {
  let prev = -Infinity;
  for (let i = 0; i <= 1000; i++) {
    const y = yearOf(10 ** (i / 10));
    assert.ok(y >= prev, `not monotonic at 1e${i / 10}`);
    prev = y;
  }
});
test('progressOf inverts yearOf', () => {
  for (const p of [3, 5e8, 1e25, 1e80]) {
    const back = progressOf(yearOf(p));
    assert.ok(Math.abs(back - p) / p < 1e-9, `${p} -> ${back}`);
  }
});
test('clamps at the edges', () => {
  assert.equal(yearOf(0.5), -70000);
  assert.equal(yearOf(0), -70000);
  assert.equal(yearOf(1e200), 2045);
  assert.equal(yearOf(Infinity), 2045);
});
test('dpuYear looks DPU_RATIO back in progress', () => {
  assert.equal(dpuYear(1e4), yearOf(10));
});

import { yearsPerSecond } from '../src/calendar.js';
test('yearsPerSecond is the calendar speed', () => {
  // between 1e7 (1440) and 1e10 (1760): 320 years per 3 decades of progress
  const p = 1e8, rate = p * Math.LN10; // one decade of progress per second
  assert.ok(Math.abs(yearsPerSecond(p, rate) - 320 / 3) < 1e-3);
  assert.equal(yearsPerSecond(1e100, 1e120), 0);
  assert.equal(yearsPerSecond(0, 0), 0);
});
