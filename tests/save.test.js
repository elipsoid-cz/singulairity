import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { serialize, deserialize, saveGame, loadGame, resetGame, SAVE_VERSION } from '../src/save.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

test('createState has version and defaults', () => {
  const s = createState();
  assert.equal(s.version, SAVE_VERSION);
  assert.equal(s.era, 1);
  assert.equal(s.pendingDecision, null);
  assert.equal(s.eraTime.length, 8);
});
test('round trip preserves state', () => {
  const s = createState();
  s.ideas = 123.5; s.owned.fire = 1; s.era = 3; s.pendingDecision = 'internet'; s.rival.progress = 5;
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('garbage, null and old versions give a fresh state', () => {
  for (const bad of ['{garbage', null, '{"version":0}', '"str"', '[]']) {
    assert.deepEqual(deserialize(bad), createState(), String(bad));
  }
});
test('missing fields are filled from defaults', () => {
  const s = createState();
  delete s.agiPaths; delete s.rival.active; s.ideas = 7;
  const loaded = deserialize(JSON.stringify(s));
  assert.equal(loaded.ideas, 7);
  assert.deepEqual(loaded.agiPaths, createState().agiPaths);
  assert.equal(loaded.rival.active, false);
});
test('saveGame/loadGame/resetGame via storage', () => {
  const st = fakeStorage();
  const s = createState(); s.ideas = 42;
  saveGame(s, st);
  assert.equal(loadGame(st).ideas, 42);
  resetGame(st);
  assert.equal(loadGame(st).ideas, 0);
});
test('loadGame survives a throwing storage', () => {
  const st = { getItem() { throw new Error('denied'); } };
  assert.deepEqual(loadGame(st), createState());
});

test('right version but wrong field types falls back per field (review #3)', () => {
  const bad = { ...createState(), owned: null, rival: null, eraTime: null, buffs: {}, progress: 'x', ideas: Infinity, log: 5 };
  const s = deserialize(JSON.stringify(bad));
  const fresh = createState();
  for (const k of ['owned', 'rival', 'eraTime', 'buffs', 'progress', 'ideas', 'log']) assert.deepEqual(s[k], fresh[k], k);
});

test('nested fields with wrong types are reset too', () => {
  const bad = { ...createState(), rival: { progress: 'nope', active: 1 }, agiPaths: { emulation: null } };
  const s = deserialize(JSON.stringify(bad));
  assert.deepEqual(s.rival, createState().rival);
  assert.equal(s.agiPaths.emulation, 0);
});
