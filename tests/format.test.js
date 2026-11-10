import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, formatYear, formatDate, formatDuration } from '../src/format.js';

test('formatNumber small and grouped', () => {
  assert.equal(formatNumber(999), '999');
  assert.equal(formatNumber(12345), '12,345');
  assert.equal(formatNumber(12.345), '12.3');
});
test('formatNumber named scales', () => {
  assert.equal(formatNumber(1.5e6), '1.50 million');
  assert.equal(formatNumber(2e63), '2.00 vigintillion');
});
test('formatNumber scientific and infinity', () => {
  assert.equal(formatNumber(3e70), '3.00×10^70');
  assert.equal(formatNumber(1e301), '∞');
  assert.equal(formatNumber(Infinity), '∞');
  assert.equal(formatNumber(NaN), '∞');
});
test('formatYear', () => {
  assert.equal(formatYear(-70000), '70,000 BCE');
  assert.equal(formatYear(1440.4), '1440 CE');
});
test('formatDate', () => {
  assert.equal(formatDate(2043.5), 'Jul 2, 2043 12:00');
});
test('formatDuration', () => {
  assert.equal(formatDuration(2460), '41 min');
  assert.equal(formatDuration(9.2), '9 s');
  assert.equal(formatDuration(7200), '2 h 0 min');
});

import { formatSpeed } from '../src/format.js';
test('formatSpeed picks a readable unit', () => {
  assert.equal(formatSpeed(230), '230 years/s');
  assert.equal(formatSpeed(0.5), '183 days/s');
  assert.equal(formatSpeed(1 / 365 / 2), '12.0 hours/s');
  assert.equal(formatSpeed(1 / 365 / 24 / 60 / 2), '30.0 s/s');
  assert.equal(formatSpeed(0), 'time stands still');
});

import { progressLabel } from '../src/format.js';
test('after the singularity numbers read as infinity (review #4)', () => {
  assert.equal(progressLabel({ singularity: true }, 1e100), '∞');
  assert.equal(progressLabel({ singularity: false }, 1.5e6), '1.50 million');
});
